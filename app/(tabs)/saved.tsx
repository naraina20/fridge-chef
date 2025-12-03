import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { supabase, type GeneratedRecipesRow } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

export default function SavedScreen() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<GeneratedRecipesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('generated_recipes')
        .select('id, image_url, recipe_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading saved recipes', error);
        setError('Unable to load saved recipes right now.');
        return;
      }

      setItems((data ?? []) as GeneratedRecipesRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      load();
    }
  }, [authLoading, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Saved Recipes</Text>

      {authLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      )}

      {!authLoading && !user && (
        <View style={styles.center}>
          <Text style={styles.muted}>
            Sign in on the Profile tab to see your saved recipes.
          </Text>
        </View>
      )}

      {!authLoading && user && loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.muted}>Fetching your past fridge scans...</Text>
        </View>
      )}

      {!authLoading && user && !loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={load}>
            <Text style={styles.secondaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!authLoading && user && !loading && !error && items.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.muted}>
            No saved recipes yet. Take a fridge photo to get started.
          </Text>
        </View>
      )}

      {!authLoading && user && !loading && !error && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const recipes = item.recipe_data?.recipes ?? [];

            return (
              <View style={styles.card}>
                <Text style={styles.cardDate}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
                {recipes.slice(0, 1).map((recipe, index) => (
                  <View key={index}>
                    <Text style={styles.cardTitle}>{recipe.title}</Text>
                    <Text style={styles.cardSubtitle}>
                      {recipe.ingredients.slice(0, 3).join(', ')}
                      {recipe.ingredients.length > 3 ? '…' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    marginTop: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorText: {
    color: '#fecaca',
    textAlign: 'center',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 4,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '500',
  },
});

