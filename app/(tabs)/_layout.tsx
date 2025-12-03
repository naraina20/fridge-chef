import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { View, Text, StyleSheet,Platform  } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

function OfflineBanner() {
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

  useEffect(() => {
    const configureUI = async () => {
      if (Platform.OS === 'android') {
        await SystemUI.setBackgroundColorAsync("#020617");

        // 2. Make the bottom buttons (triangle/circle/square) white/light
        await NavigationBar.setButtonStyleAsync("light");
        
        // OPTIONAL: Explicitly enable transparent edge-to-edge (removes warnings)
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBackgroundColorAsync("#ffffff00"); // Transparent
      }
    };

    configureUI();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor="#020617" />
      {isOffline ? OfflineBanner() :
        <Tabs
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#020617', // Example: Dark blue background matching your tab bar
              borderBottomColor: '#111827', // Optional: separator line color
              borderBottomWidth: 1,         // Optional: separator line width
            },
            headerTintColor: '#f97316',   // Example: Orange text matching your active tab
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            tabBarActiveTintColor: '#f97316',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarStyle: {
              backgroundColor: '#020617',
              borderTopColor: '#111827',
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

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#111827',
  },
  offlineTitle: {
    color: '#fef3c7',
    fontSize: 18,
    fontWeight: '600',
  },
  offlineText: {
    color: '#e5e7eb',
    marginTop: 4,
  },
});