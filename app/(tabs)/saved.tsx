import { useEffect, useState, useContext } from 'react';
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
import { useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

export default function SavedScreen() {
  const navigation = useNavigation();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<GeneratedRecipesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isDark, toggleTheme, colors } = useTheme();
  const styles = createStyles(colors)

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
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 16, gap: 12 }}>
          <TouchableOpacity onPress={load}>
            <Feather name="refresh-cw" color={colors.primary} size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme}>
            <Feather
              name={isDark ? 'sun' : 'moon'}
              color={colors.primary}
              size={24}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [authLoading, user, navigation]);

  return (
    <View style={styles.container}>
      {authLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
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
          <ActivityIndicator size="large" color={colors.primary} />
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

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.screenBackground,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    muted: {
      marginTop: 8,
      color: colors.inactive,
      textAlign: 'center',
    },
    errorText: {
      color: colors.error,
      textAlign: 'center',
      marginBottom: 12,
    },
    listContent: {
      paddingBottom: 16,
    },
    card: {
      backgroundColor: colors.screenBackground,
      borderWidth: 1,
      borderColor: colors.headerBorder,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    cardDate: {
      fontSize: 12,
      color: colors.inactive,
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.text,
      marginTop: 4,
    },
    secondaryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      marginTop: 8,
    },
    secondaryButtonText: {
      color: colors.offlineText,
      fontWeight: '500',
    },
  });
}
