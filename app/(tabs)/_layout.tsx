import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '../../lib/theme';

function OfflineBanner() {
  const { colors } = useTheme();
  const styles = createStyles(colors)
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineTitle}>No Connection</Text>
      <Text style={styles.offlineText}>
        Our Chef needs the internet to see your ingredients!
      </Text>
    </View>
  );
}

function useIsOffline() {
  const netInfo = useNetInfo();

  const isConnected =
    netInfo.isConnected === false ? false : true; // treat null/undefined as true
  const isInternetReachable =
    netInfo.isInternetReachable === false ? false : true;

  // Only offline when we *know* we have no connectivity
  return !isConnected || !isInternetReachable;
}


export default function TabsLayout() {
  const isOffline = useIsOffline()
  const { isDark, toggleTheme, colors } = useTheme();

  useEffect(() => {
    const configureUI = async () => {
      if (Platform.OS === 'android') {
        await SystemUI.setBackgroundColorAsync(colors.screenBackground);

        // 2. Make the bottom buttons (triangle/circle/square) white/light
        isDark ? 
        await NavigationBar.setButtonStyleAsync("light") :
        await NavigationBar.setButtonStyleAsync("dark") ;


        // OPTIONAL: Explicitly enable transparent edge-to-edge (removes warnings)
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBackgroundColorAsync(colors.screenBackground)
      }
    };

    configureUI();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.screenBackground} />
      {isOffline ? OfflineBanner() :
        <Tabs
          screenOptions={{
            headerShown: true,
            tabBarHideOnKeyboard: true,
            headerStyle: {
              backgroundColor: colors.screenBackground,
              borderBottomColor: colors.headerBorder,
              borderBottomWidth: 1,
            },
            headerRight: () => (
              <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
                <Feather
                  name={isDark ? 'sun' : 'moon'}
                  color={colors.primary}
                  size={24}
                />
              </TouchableOpacity>
            ),
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.inactive,
            tabBarStyle: {
              backgroundColor: colors.screenBackground,
              borderTopColor: colors.surface,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Feather name="home" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="saved"
            options={{
              title: 'Saved',
              tabBarIcon: ({ color, size }) => (
                <Feather name="bookmark" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Feather name="user" color={color} size={size} />
              ),
            }}
          />
        </Tabs>}
    </>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    offlineContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingTop: 40,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
    },
    offlineTitle: {
      color: colors.offlineTitle,
      fontSize: 18,
      fontWeight: '600',
    },
    offlineText: {
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
}