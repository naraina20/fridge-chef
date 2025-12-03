import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
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
          }}
        />
      </Stack>
    </AuthProvider>
  );
}

