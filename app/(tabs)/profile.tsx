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

export default function ProfileScreen() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <ActivityIndicator size="large" color="#f97316" />
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
          placeholderTextColor="#6b7280"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#6b7280"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#020617',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  form: {
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#f9fafb',
    marginBottom: 24,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f9fafb',
    marginBottom: 16,
    backgroundColor: '#020617',
  },
  errorText: {
    color: '#fecaca',
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
    backgroundColor: '#f97316',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0b1120',
    fontWeight: '600',
  },
  secondaryButton: {
    // flex: 1,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e5e7eb',
    fontWeight: '500',
  },
});

