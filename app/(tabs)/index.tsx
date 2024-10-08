import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import InventoryCard from '@/components/InventoryCard';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/authContext';
import { useProducts } from '@/context/productsContext';

const HomeScreen: React.FC = () => {
  const { products, getProducts } = useProducts();
  const { store } = useAuth();
  const borderColor = useThemeColor({}, 'border');

  useFocusEffect(
    useCallback(() => {
      const obtainProds = async () => {
        if (store) {
          await getProducts(store.id);
        }
      };

      obtainProds();
    }, [store])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type='titleBold'>INVENTARIO</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {products.length > 0 ? (
            products.map((product, index) => (
              <InventoryCard
                key={index}
                image={product.imagenS ? product.imagenS : product.imagen}
                name={product.nombre}
                price={product.precio}
                stock={product.cantidad}
              />
            ))
          ) : (
            <View style={styles.content}>
              <ThemedText type='default' style={{ textAlign: 'center' }}>
                Esta sucursal no cuenta con productos,
                actualiza el inventario capturando productos.
              </ThemedText>
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
  content: {
    height: '100%',
    justifyContent: 'center',
  },
});

export default HomeScreen;
