import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import ThemedButton from '@/components/ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '@/context/productsContext';
import OrderProductCard from '@/components/OrderProductCard';
import { getCurrentDate } from '@/hooks/useDate';
import { useAuth } from '@/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/context/productsContext';

interface ProductID extends Product {
  Producto: any;
  id_orden: number;
  id_producto: number;
}

const OrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id, status } = useLocalSearchParams();
  const { verifyOrder } = useProducts();
  const { user, store } = useAuth();
  const { getOrderDetails } = useProducts();
  const borderColor = useThemeColor({}, 'border');
  const icon = useThemeColor({}, 'icon');
  const color = useThemeColor({}, 'background');
  const [products, setProducts] = useState<ProductID[]>([]);
  const [verifiedOrder, setVerifiedOrder] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [idOrder, setidOrder] = useState(0);
  const [estatus, setStatus] = useState('');
  const [loading, setLoading] = useState(true); 

  const handlePress = () => {
    router.push('/orders');
  };

  const handleIncompleteOrder = () => {
    setModalVisible(prevState => !prevState);
  };

  const handleIncompleteModal = async () => {
    const date = getCurrentDate();
    const response = await verifyOrder(idOrder, 'incompleta', user?.id as number, store?.id as number, date as string )
    console.log(response);
    await AsyncStorage.removeItem(`Order_${id}`);
    router.push('/orders');
    setModalVisible(false);
  };

  const handleConfirmModal = () => {
    setConfirmModalVisible(prevState => !prevState);
  };

  const handleConfirmOrder  = async () => {
    const date = getCurrentDate();
    const response = await verifyOrder(idOrder, 'completada', user?.id as number, store?.id as number, date as string )
    console.log(response);
    await AsyncStorage.removeItem(`Order_${id}`);
    router.push('/orders');
    setConfirmModalVisible(false);
  };

  const checkOrder = async () => {
    const exists = await AsyncStorage.getItem(`Order_${id}`);
    if (exists) {
      const parsedExists = JSON.parse(exists);
      if (parsedExists.ids && Array.isArray(parsedExists.ids)) {
        const productIds = products.map(product => product.Producto.id);
        const allProductsVerified = productIds.every(productId => parsedExists.ids.includes(productId));
        setVerifiedOrder(allProductsVerified);
      } else {
        setVerifiedOrder(false);
      }
    } else {
      setVerifiedOrder(false);
    }
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
      setidOrder(id as any);
      setStatus(status as string)
      obtainProds();
      
      return () => {
        setLoading(true);
      };
    }, [id])
  );

  useEffect(() => {
      checkOrder();

  }, [products]);

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
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

        <View style={[styles.header,  { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={() => handlePress()}>
              <Ionicons name="chevron-back" size={30} color={icon} />
            </TouchableOpacity>
            <ThemedText type='titleBold'>
              {estatus && estatus !== 'pendiente' ? `ORDEN #${id}: ${estatus.toUpperCase()}` : `VERIFICAR ORDEN #${id}`}
            </ThemedText>

            {!verifiedOrder && 
            <TouchableOpacity
              style={{
                backgroundColor: estatus !== 'pendiente' ? color : '#C9223C',
                height: estatus !== 'pendiente' ? 0 : 'auto',
                padding: estatus !== 'pendiente' ? 0 : 7,
                ...styles.prevButton
              }}
              onPress={handleIncompleteOrder}
              disabled={estatus !== 'pendiente'}
            >
              <ThemedText type='defaultSemiBold' style={{ color: estatus !== 'pendiente' ? color : '#FFFFFF', fontSize: 12 }}>
                Sin existencias
              </ThemedText>
            </TouchableOpacity>
            }

          </View>


          {products && products.map((product, index) => (
            <OrderProductCard
              orderId={idOrder}
              id={product.Producto.id}
              key={index}
              image={product.Producto.imagenS ? product.Producto.imagenS: product.Producto.imagen}
              name={product.Producto.nombre}
              price={product.Producto.precio}
              stock={product.cantidad}
              status={estatus}
            />
          ))}

        </ScrollView>

        {verifiedOrder && <ThemedButton title="   Completar orden   " onPress={handleConfirmModal} disabled={!verifiedOrder} />}
        
        {/* Modal de SIN EXISTENCIAS*/} 
        <Modal
          animationType='fade'
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
            <View style={[styles.header,  { borderBottomColor: borderColor }]}>
                <ThemedText type='defaultSemiBold'> SIN EXISTENCIAS </ThemedText>
                <TouchableOpacity onPress={handleIncompleteOrder} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close-circle-outline" size={28} color={icon} />
                </TouchableOpacity>
              </View>

              <ThemedText style={{ textAlign: 'center' }}>
                Los productos de la orden no se han verificado,
                ¿Quieres confirmar que no se encuentran o las cantidades estan incompletas?
              </ThemedText>

              <View style={{ paddingTop: 10 }}>
                <TouchableOpacity onPress={handleIncompleteModal} style={styles.modalButton}>
                  <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>  Entendido  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </ThemedView>
        </Modal>

        {/* Modal de CONFIRMACION */}
        <Modal
          animationType='fade'
          transparent={true}
          visible={isConfirmModalVisible}
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={[styles.header,  { borderBottomColor: borderColor }]}>
                <ThemedText type='defaultSemiBold'> CONFIRMAR ORDEN </ThemedText>
                <TouchableOpacity onPress={handleConfirmModal} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close-circle-outline" size={28} color={icon} />
                </TouchableOpacity>
              </View>

              <ThemedText style={{ textAlign: 'center' }}>
                ¿Estás seguro de que quieres completar la orden?
              </ThemedText>

              <View style={{ paddingTop: 10 }}>
                <TouchableOpacity onPress={handleConfirmOrder} style={styles.modalButton}>
                  <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Confirmar</ThemedText>
                </TouchableOpacity>

              </View>
            </ThemedView>
          </ThemedView>
        </Modal>

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
  prevButton: {
    marginLeft: 'auto',
    borderRadius: 4,
  },

  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalButton: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: '#0ACF83',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  }
});

export default OrderDetailScreen;