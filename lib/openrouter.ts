export type GeneratedRecipe = {
  title: string;
  ingredients: string[];
  instructions: string[];
};

export type GeneratedRecipesResponse = {
  recipes: GeneratedRecipe[];
};

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
  process.env.EXPO_PUBLIC_OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  console.warn(
    'Missing EXPO_PUBLIC_OPENROUTER_API_KEY. Recipe generation will fail until this is set.'
  );
}

export async function generateRecipesFromImage(
  imageUrl: string
): Promise<GeneratedRecipesResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured.');
  }

  const systemPrompt =
    'You are an expert chef. Analyze the image provided, identify ingredients, and generate 3 recipes. ' +
    'You must return ONLY valid JSON matching this structure: ' +
    '{ "recipes": [{ "title": string, "ingredients": string[], "instructions": string[] }] }. ' +
    'Do not include any explanation or text outside of the JSON.';

  const body = {
    model: 'google/gemini-2.0-flash-001',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Here is a photo of the inside of my fridge. Please analyze and generate recipes.',
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl, // your Supabase public URL
            },
          },
        ],
      },
    ],
    response_format: 'json',
  };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://fridgechef.local', // optional, helps OpenRouter dashboard
      'X-Title': 'FridgeChef',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('OpenRouter error response', text);
    throw new Error('Failed to generate recipes');
  }

  const json = await response.json();

  const content = json?.choices?.[0]?.message?.content;

  const extractJsonString = (raw: string): string => {
    let text = raw.trim();

    // Strip Markdown code fences like ```json ... ```
    if (text.startsWith('```')) {
      // Remove first fence line
      const firstFenceEnd = text.indexOf('\n');
      if (firstFenceEnd !== -1) {
        text = text.slice(firstFenceEnd + 1);
      }
      // Remove trailing fence
      const lastFenceStart = text.lastIndexOf('```');
      if (lastFenceStart !== -1) {
        text = text.slice(0, lastFenceStart);
      }
      text = text.trim();
    }

    // In case the model adds text before/after the JSON, grab the first/last brace block
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }

    return text;
  };

  // Some models may already return parsed JSON, others return a string or content parts
  let parsed: GeneratedRecipesResponse;
  try {
    if (typeof content === 'string') {
      const cleaned = extractJsonString(content);
      parsed = JSON.parse(cleaned);
    } else if (Array.isArray(content)) {
      // OpenRouter / Gemini may return an array of content parts
      const textPart =
        content.find((c: any) => c.type === 'output_text' || c.type === 'text') ?? content[0];
      const text =
        typeof textPart === 'string'
          ? textPart
          : (textPart?.text as string | undefined) ?? JSON.stringify(textPart);
      const cleaned = extractJsonString(text);
      parsed = JSON.parse(cleaned);
    } else {
      parsed = content as GeneratedRecipesResponse;
    }
  } catch (err) {
    console.error('Failed to parse OpenRouter JSON', err, content);
    throw new Error(
      'The chef is confused, please try a clearer photo (could not parse AI response).'
    );
  }

  if (!parsed?.recipes || !Array.isArray(parsed.recipes)) {
    throw new Error(
      'The chef is confused, please try a clearer photo (invalid recipe structure).'
    );
  }

  return parsed;
}


