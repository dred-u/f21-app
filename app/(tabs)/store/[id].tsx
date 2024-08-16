import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useProducts } from '@/context/productsContext';
import InventoryCard from '@/components/InventoryCard';
import { Ionicons } from '@expo/vector-icons';

const OrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id, nombre } = useLocalSearchParams();
  const { products, getProducts } = useProducts();

  const icon = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  useFocusEffect(
    useCallback(() => {
      const obtainProds = async () => {
        if (id) {
          await getProducts(id as any);
        }
      };

      obtainProds();
    }, [id])
  );

  const handlePress = () => {
    router.push('/admin');
  };

  if (!products) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={icon} style={styles.loadingContainer} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={handlePress}>
            <Ionicons name="chevron-back" size={24} color={icon} />
          </TouchableOpacity>
          <ThemedText type='titleBold'>{nombre}</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {products.length > 0 ? (
            products.map((product, index) => (
              <InventoryCard
                key={index}
                image={product.imagen}
                name={product.nombre}
                price={product.precio}
                stock={product.cantidad}
              />
            ))
          ) : (
            <View>
              <ThemedText type='defaultCardBold'>No se encontraron productos.</ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default OrderDetailScreen;