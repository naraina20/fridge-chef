import 'react-native-url-polyfill/auto';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
// Use the legacy FS API to avoid runtime deprecation errors with readAsStringAsync.
import * as FileSystem from 'expo-file-system/legacy';
import type { GeneratedRecipe } from './openrouter';

// In Expo, env vars must be prefixed with EXPO_PUBLIC_ to be available on the client.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

// TODO: Replace `any` with your generated Database type from Supabase
export const supabase: SupabaseClient<any> = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // For now we avoid custom storage wiring; we can enable persisted sessions later with AsyncStorage.
    persistSession: false,
  },
});

/**
 * Upload a fridge image to the `fridge-images` bucket and return its public URL.
 * Uses Base64 + ArrayBuffer as in your working snippet.
 */
export async function uploadFridgeImageAsync(
  uri: string,
  userId?: string | null,
): Promise<string> {
  // Expo SDK 54: pass encoding as the literal string 'base64' to avoid enum issues.
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64' as any,
  });

  const safeUserId = userId ?? 'anonymous';
  const fileName = `${safeUserId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.jpg`;

  const { error } = await supabase.storage
    .from('fridge-images')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image to Supabase', error);
    throw error;
  }

  const { data } = supabase.storage.from('fridge-images').getPublicUrl(fileName);

  return data.publicUrl;
}

export type GeneratedRecipesRow = {
  id: string;
  image_url: string;
  recipe_data: { recipes: GeneratedRecipe[] };
  created_at: string;
};

/**
 * Save generated recipes for an image into the `generated_recipes` table.
 * For now we don't associate a real user_id (auth to be added later), so
 * ensure your table allows NULL user_id or uses a default test user.
 */
export async function saveGeneratedRecipes(options: {
  imageUrl: string;
  recipes: GeneratedRecipe[];
  userId?: string | null;
}): Promise<void> {
  const { imageUrl, recipes, userId = null } = options;

  const { error } = await supabase.from('generated_recipes').insert({
    user_id: userId,
    image_url: imageUrl,
    recipe_data: { recipes },
  });

  if (error) {
    console.error('Error saving generated recipes', error);
    // We intentionally don't throw here so the UI can still show recipes even if saving fails.
  }
}

