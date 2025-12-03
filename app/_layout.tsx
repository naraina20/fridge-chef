import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth';
import { ThemeProvider } from '../lib/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: 'Camera',
            headerStyle: { backgroundColor: '#020617' },
            headerTintColor: '#f9fafb',
            headerShown: false
          }}
        />
      </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

