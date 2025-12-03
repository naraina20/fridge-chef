import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const {colors} = useTheme()
  const styles = createStyles(colors)

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

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 16,
      color: colors.inactive,
    },
    content: {
      marginTop: 32,
      width: '100%',
    },
    helperText: {
      marginBottom: 16,
      color: colors.offlineText,
      textAlign: 'center',
    },
  });
}
