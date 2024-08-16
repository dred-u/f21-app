import React, { useState, useCallback, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { StyleSheet, View, Text, Button, Modal, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CaptureQRModal from '@/components/captureQRModal';
import { useProducts } from '@/context/productsContext';
import { useAuth } from '@/context/authContext';
import { Product } from '@/context/productsContext';

const CapturesQR: React.FC = () => {
  const { products, getProduct } = useProducts();
  const { store } = useAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const icon = useThemeColor({}, 'icon');
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<Product | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalCapture, setModalCapture] = useState(false);
  const [error, setError] = useState(false);
  const [duplicated, setDuplicated] = useState(false);
  const [nonExist, setNonExist] = useState(false);
  const [nonExistId, setNonexistId] = useState<Product | null>(null);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
  
      return () => {
        if (scanTimeout.current) {
          clearTimeout(scanTimeout.current);
          scanTimeout.current = null;
        }
        setScanned(false);
        setData(null);
        setError(false);
        setNonExist(false);
        setNonexistId(null);
        setDuplicated(false);
        setIsCameraActive(false);
      };
    }, [])
  );

  if (!permission) {
    return <ThemedView />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.message}>Se necesitan permisos para acceder a la cámara.</Text>
        <Button onPress={requestPermission} title="conceder permiso" />
      </ThemedView>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleToggleModal = () => {
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
    setScanned(false);
    setData(null);
    setError(false);
    setDuplicated(false);
    setNonExist(false);
    setModalVisible(false);
  };

  const handleAddProduct = () => {
    setModalVisible(false);
    setModalCapture(true);
  };

  const handleScan = () => {
    setScanned(true);
    scanTimeout.current = setTimeout(() => {
      if (modalCapture && !data && !error && !duplicated && !nonExist) {
        setModalVisible(true);
      }
    }, 4000);
  };

  const handleModal = async () => {
    const existingCaptures = await AsyncStorage.getItem('Captures');
    const newProduct = {
      id: data?.id,
      nombre: data?.nombre,
      precio: data?.precio,
      genero: data?.genero,
      tipo: data?.tipo,
      cantidad: data?.cantidad,
      imagen: data?.imagen,
      imagenS: data?.imagenS,
    };

    if (existingCaptures) {
      const parsedCaptures = JSON.parse(existingCaptures);
      const existingProducts = parsedCaptures.products || [];

      const productExists = existingProducts.some((product: Product) => product.id === newProduct.id);

      if (!productExists) {
        existingProducts.push(newProduct);
      }

      const updatedCaptures = { products: existingProducts };
      await AsyncStorage.setItem('Captures', JSON.stringify(updatedCaptures));
    } else {
      const newCaptures = { products: [newProduct] };
      await AsyncStorage.setItem('Captures', JSON.stringify(newCaptures));
    }

    setModalVisible(false);
    setData(null);
    setError(false);
    setDuplicated(false);
    router.navigate(user?.rol === 'empleado' ? '/capture': '/manager/create')

  };

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(false);
    try {
      const productoObjeto = JSON.parse(data);
  
      if (productoObjeto.id) {
        const existingCaptures = await AsyncStorage.getItem('Captures');
        if (existingCaptures) {
          const parsedCaptures = JSON.parse(existingCaptures);
          const existingProducts = parsedCaptures.products || [];
  
          const productExists = existingProducts.find((product: Product) => product.id === productoObjeto.id);
  
          if (productExists) {
            setDuplicated(true);
            setModalVisible(true);
            return;
          }
        }
  
        const res = await getProduct(productoObjeto.id);
  
        if (res) {
          const productExistsInInventory = products.find(product => product.id === productoObjeto.id);
  
          if (productExistsInInventory) {
            setData(productExistsInInventory);
          } else {
            setNonExist(true);
            setNonexistId(productoObjeto);
            console.log('El producto escaneado no existe en la lista de productos.');
          }
        }
      }
    } catch (error) {
      setError(true);
      console.log("Error al analizar el código QR: no es un objeto JSON válido.", error);
    }
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {isCameraActive && (
        <CameraView
          onBarcodeScanned={scanned ? handleBarCodeScanned : undefined}
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
      )}

      <TouchableOpacity onPress={handleScan} style={styles.button}>
        <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Toca para escanear</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType='fade'
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.header}>
              <ThemedText type='defaultSemiBold'> PRODUCTO ESCANEADO </ThemedText>
              <TouchableOpacity onPress={handleToggleModal} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close-circle-outline" size={24} color={icon} />
              </TouchableOpacity>
            </View>
            {data ? (
              <>
                <ThemedText style={{ textAlign: 'center', alignSelf: 'center' }}>
                  Se escaneó el siguiente producto:{"\n"}{data.nombre}{"\n"}{"\n"}
                  Este producto se encuentra disponible en la sucursal ¿Quieres actualizar las existencias?
                </ThemedText>

                <View style={{ paddingTop: 10 }}>
                  <TouchableOpacity onPress={handleModal} style={styles.modalButton}>
                    <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>  Confirmar  </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {!nonExist && !duplicated && !error &&
                  <ThemedText style={{ textAlign: 'center' }}>
                      No se escaneo ningun codigo o no se reconoce.
                  </ThemedText>
                }

                {duplicated &&
                  <ThemedText style={{ textAlign: 'center' }}>
                    El producto escaneado ya esta en la lista de captura, escanea otro producto.
                  </ThemedText>
                }

                {nonExist &&
                  <ThemedText style={{ textAlign: 'center' }}>
                    Este producto no se encuentra disponible en la sucursal ¿Quieres agregarlo al inventario?
                  </ThemedText>
                }
                
                {error &&
                  <ThemedText style={{ textAlign: 'center' }}>
                    El codigo escaneado no es de un producto.
                  </ThemedText>
                }
                <View style={{ paddingTop: 10 }}>
                  <TouchableOpacity onPress={nonExist ? handleAddProduct : handleToggleModal} style={styles.modalButton}>
                    <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>  {nonExist ? 'Confirmar':'Entendido'}  </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>
      
      {store && nonExistId &&
        <CaptureQRModal
        isVisible={modalCapture}
        onClose={() => setModalCapture(false)}
        productId={nonExistId.id}
        storeId={store.id}
        stock={0}
        />
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom:10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#0ACF83',
    padding: 15,
    borderRadius: 5,
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

export default CapturesQR;