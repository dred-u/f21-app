import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { StyleSheet, View, Text, Button, Modal, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/context/productsContext';

const OrdersQR: React.FC = () => {
  const { orderId, id, cantidad } = useLocalSearchParams();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const borderColor = useThemeColor({}, 'border');
  const icon = useThemeColor({}, 'icon');
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<Product | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(false);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);
      return () => {
        if (scanTimeout.current) {
          clearTimeout(scanTimeout.current);
          scanTimeout.current = null;
        }
        setIsCameraActive(false);
        setData(null);
        setScanned(false);
        setError(false);
      };
    }, [])
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Se necesitan permisos para acceder a la cámara.</Text>
        <Button onPress={requestPermission} title="conceder permiso" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleToggleOrders = () => {
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
    setModalVisible(prevState => !prevState);
    setError(false);
    setData(null);
    setScanned(false);
  };

  const handleScan = async () => {
    setScanned(true);
    scanTimeout.current = setTimeout(() => {
      if (!data && !error) {
        setError(true);
        setScanned(false);
        setModalVisible(true);
      }
    }, 4000);
  };

  const handleModal = async () => {
    const exists = await AsyncStorage.getItem(`Order_${orderId}`)
    const newId = Number(id)

    if (exists) {
      const existingData = JSON.parse(exists);
      const ids: number[] = existingData.ids ? existingData.ids : [];

      if (!ids.includes(newId)) {
        ids.push(newId);
      }

      const updatedData = { ids: ids };

      await AsyncStorage.mergeItem(`Order_${orderId}`, JSON.stringify(updatedData));
    } else {
      const newData = { ids: [newId] };
      await AsyncStorage.setItem(`Order_${orderId}`, JSON.stringify(newData));
    }

    setModalVisible(false);
    setScanned(false)
    setError(false)
    setData(null);
    router.replace(`/order_details/${orderId}`)
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(false)
    try {
      const productoObjeto = JSON.parse(data);
      console.log(productoObjeto);
      if(productoObjeto.id){
        setData(productoObjeto);
      }
    } catch (error) {
      setError(true)
      console.log("Error al analizar el código QR: no es un objeto JSON válido.", error, data);
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
              <TouchableOpacity onPress={handleToggleOrders} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close-circle-outline" size={24} color={icon} />
              </TouchableOpacity>
            </View>
            <View style={[styles.line, { borderBottomColor: borderColor }]} />

            {data && String(data.id) == id ? (
              <>
                <ThemedText style={{ textAlign: 'center', alignSelf: 'center' }}>
                  Se escaneó el siguiente producto:{"\n"}
                  {data.nombre}{"\n"}{"\n"}
                  La orden necesita que se verifique la existencia de {cantidad} productos
                  de este tipo en total en la sucursal,
                  ¿Confirmas que esta cantidad es correcta?
                </ThemedText>

                <View style={{ paddingTop: 10 }}>
                  <TouchableOpacity onPress={handleModal} style={styles.modalButton}>
                    <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>  Confirmar  </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {data &&
                  <ThemedText style={{ textAlign: 'center' }}>
                    El producto escaneado no coincide con el de la orden, escanea el correcto.
                  </ThemedText>
                }

                {error &&
                  <ThemedText style={{ textAlign: 'center' }}>
                    No se escaneo ningun codigo o no se reconoce.
                  </ThemedText>
                }
                <View style={{ paddingTop: 10 }}>
                  <TouchableOpacity onPress={handleToggleOrders} style={styles.modalButton}>
                    <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>  Entendido  </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>
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
    marginBottom: 10,
  },
  line: {
    borderBottomWidth: 1,
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

export default OrdersQR;
