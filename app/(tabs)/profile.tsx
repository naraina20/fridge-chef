import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme()
  const styles = createStyles(colors)

  const handleAuth = async (mode: 'signin' | 'signup') => {
    try {
      setSubmitting(true);
      setError(null);
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signOut();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to sign out.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user.email}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
          onPress={handleSignOut}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? 'Signing out...' : 'Sign out'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FridgeChef</Text>
      <Text style={styles.subtitle}>
        Create an account or sign in to save your generated recipes.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.inactive}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            // style={[styles.secondaryButton, submitting && { opacity: 0.7 }]}
            style={[styles.secondaryButton, { flex: 1 }, submitting && { opacity: 0.7 }]}
            onPress={() => handleAuth('signin')}
            disabled={submitting}
          >
            <Text style={styles.secondaryButtonText}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            // style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
            style={[styles.primaryButton, { flex: 1 }, submitting && { opacity: 0.7 }]}
            onPress={() => handleAuth('signup')}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Creating…' : 'Sign up'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      backgroundColor: colors.screenBackground,
      paddingHorizontal: 24,
      paddingTop: 48,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 14,
      color: colors.inactive,
    },
    form: {
      marginTop: 32,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 24,
    },
    input: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      marginBottom: 16,
      backgroundColor: colors.screenBackground,
    },
    errorText: {
      color: colors.textSecondary,
      marginBottom: 12,
    },
    buttonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    primaryButton: {
      // flex: 1,
      marginLeft: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.offlineBg,
      fontWeight: '600',
    },
    secondaryButton: {
      // flex: 1,
      marginRight: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.text,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '500',
    },
  });
}
