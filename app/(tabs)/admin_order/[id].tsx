import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '@/context/productsContext';
import { useAuth } from '@/context/authContext';
import { Product } from '@/context/productsContext';
import InventoryCard from '@/components/InventoryCard';

interface ProductID extends Product {
  Producto: any;
  id_orden: number;
  id_producto: number;
}

const OrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getOrderDetails } = useProducts();
  const borderColor = useThemeColor({}, 'border');
  const icon = useThemeColor({}, 'icon');
  const [products, setProducts] = useState<ProductID[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePress = () => {
    router.push('/admin/orders');
  };

  const obtainProds = async () => {
    const res = await getOrderDetails(Number(id));
    setProducts(res as any)

    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  useFocusEffect(
    useCallback(() => {
      obtainProds();

      return () => {
        setLoading(true);
      };
    }, [id])
  );

  if (loading) {
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
          <TouchableOpacity onPress={() => handlePress()}>
            <Ionicons name="chevron-back" size={30} color={icon} />
          </TouchableOpacity>
          <ThemedText type='titleBold'> ORDEN #{id} </ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          {products && products.map((product, index) => (
            <InventoryCard
              key={index}
              image={product.Producto.imagen}
              name={product.Producto.nombre}
              price={product.Producto.precio}
              stock={product.cantidad}
            />
          ))}

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
    paddingBottom: 0,
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  loadingContainer: {
    height: '100%',
  },
});

export default OrderDetailScreen;