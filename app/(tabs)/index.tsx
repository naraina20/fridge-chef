import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/theme';

export default function FridgeChefHome() {
  const router = useRouter();
  const {colors} =  useTheme()
  const styles = createStyles(colors)

  // Animation Values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance Fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // 2. Continuous Pulse Animation for the Icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Decor Circles (Glow effects) */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Header Section */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.titleRow}>
          <Ionicons name="restaurant" size={32} color={colors.primary} />
          <Text style={styles.title}>Fridge<Text style={styles.titleHighlight}>Chef</Text></Text>
        </View>
        <Text style={styles.subtitle}>
          Turn your ingredients into{'\n'}culinary masterpieces.
        </Text>
      </Animated.View>

      {/* Center Action Section */}
      <View style={styles.centerStage}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.cameraCircle}
            activeOpacity={0.8}
            onPress={() => router.push('/camera')}
          >
            <View style={styles.cameraInnerRing}>
              <Ionicons name="camera" size={48} color={colors.text} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Connection Line */}
        <View style={styles.connectorLine} />

        <Text style={styles.helperText}>Tap to Scan Fridge</Text>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.infoBadge}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
          <Text style={styles.infoText}>AI Powered Recipes</Text>
        </View>
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
      justifyContent: 'space-between',
      paddingVertical: 60,
      paddingHorizontal: 24,
      overflow: 'hidden', // clips the glow circles
    },
    // Ambient Glow Effects
    glowTop: {
      position: 'absolute',
      top: -100,
      left: -100,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: colors.primary,
      opacity: 0.08,
    },
    glowBottom: {
      position: 'absolute',
      bottom: -50,
      right: -50,
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: colors.accent,
      opacity: 0.1,
    },

    // Header
    header: {
      alignItems: 'center',
      marginTop: 20,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 10,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 1,
    },
    titleHighlight: {
      color: colors.primary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.inactive,
      textAlign: 'center',
      lineHeight: 24,
    },

    // Center Stage (The Interactive Part)
    centerStage: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    cameraCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      // Shadow/Glow logic
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    cameraInnerRing: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    connectorLine: {
      height: 40,
      width: 2,
      backgroundColor: colors.surface,
      marginVertical: 12,
    },
    helperText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },

    // Footer
    footer: {
      width: '100%',
      alignItems: 'center',
    },
    infoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      gap: 8,
      borderWidth: 1,
      borderColor: '#1f2937',
    },
    infoText: {
      color: colors.inactive,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  });
}