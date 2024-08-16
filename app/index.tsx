import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/authContext';

const AuthCheckScreen: React.FC = () => {
  const router = useRouter();
  const { verifyToken, getUserStore, user, store, isAuthenticated } = useAuth();

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      if (!user) {
        const response = await verifyToken(token);
        if (response.status === 401 || response.status === 500){
          AsyncStorage.removeItem('token');
          router.navigate('/login')
        }
      }
      if (isAuthenticated && user && user.rol !== 'admin') {
        await getUserStore(user.id);
      }
      if (user?.rol === 'empleado' && store) {
        router.navigate('/(tabs)');
      } else if (user?.rol === 'admin') {
        router.navigate('/(tabs)/admin');
      } else if (user?.rol === 'gerente') {
        router.navigate('/(tabs)/manager');
      }
    } else if (!user) {
      router.navigate('/login');
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth()
    }, [user, isAuthenticated, store])
  );

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthCheckScreen;
