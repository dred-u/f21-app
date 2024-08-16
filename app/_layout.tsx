import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/authContext';
import { ProductsProvider } from '@/context/productsContext';
import { AdminProvider } from '@/context/adminContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Barlow: require('../assets/fonts/Barlow-Regular.ttf'),
    BarlowMedium: require('../assets/fonts/Barlow-Medium.ttf'),
    BarlowLight: require('../assets/fonts/Barlow-Light.ttf'),
    BarlowBold: require('../assets/fonts/Barlow-Bold.ttf'),
    BarlowSemiBold: require('../assets/fonts/Barlow-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AdminProvider>
          <ProductsProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }}/>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack>
          </ProductsProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
