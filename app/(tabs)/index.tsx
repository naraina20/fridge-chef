import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FridgeChef</Text>
      <Text style={styles.subtitle}>Snap your fridge, get recipes.</Text>

      <View style={styles.content}>
        <Text style={styles.helperText}>
          Tap below to open the camera and show us your fridge.
        </Text>
        <Button
          title="Take Picture"
          onPress={() => {
            router.push('/camera');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    marginTop: 32,
    width: '100%',
  },
  helperText: {
    marginBottom: 16,
    color: '#e5e7eb',
    textAlign: 'center',
  },
});
