import React, { useState } from 'react';
import { Button, Image, View, StyleSheet, Modal,TouchableOpacity,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '@/context/productsContext';
import { baseURL } from '@/constants/conection';
import axios from 'axios';


interface CaptureQRModalProps {
  isVisible: boolean;
  onClose: () => void;
  productId: number;
  storeId: number;
  stock: number;
}

const CaptureQRModal: React.FC<CaptureQRModalProps> = ({ isVisible, onClose, productId, storeId, stock }) => {
  const { addProductToStore } = useProducts();
  const borderColor = useThemeColor({}, 'border');
  const icon = useThemeColor({}, 'icon');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      console.log('Selected image URI:', result.assets[0].uri);
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      console.log('Captured image URI:', result.assets[0].uri); // Verifica el URI
      setImage(result.assets[0].uri);
    }
  };

  const deletePhoto = () => {
    setImage(null);
  };

  const uploadImage = async () => {
      try {
        console.log(productId, storeId, stock, image);
        await addProductToStore(productId, storeId, stock, image);
        onClose();
      } catch (error) {
        console.error('Error uploading image:', error);
      }
  };

  return (
    <Modal
      animationType='fade'
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText type='defaultSemiBold'>AÑADIR PRODUCTO</ThemedText>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
              <Ionicons name="close-circle-outline" size={24} color={icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonsContainer}>
            <ThemedText type='defaultSemiBold'> 
              Elije una imagen: 
            </ThemedText>
            <TouchableOpacity onPress={pickImage} style={styles.modalButton}>
              <Ionicons name="image" size={24} color={'black'} />
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} style={styles.modalButton}>
              <Ionicons name="camera" size={24} color={'black'} />
            </TouchableOpacity>
          </View>

          {image && 
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity onPress={deletePhoto}>
              <Ionicons name="trash-outline" size={24} color={icon} />
            </TouchableOpacity>
          </View>
          }

          <TouchableOpacity onPress={uploadImage} disabled={!image} style={styles.modalSendButton}>
            <ThemedText type='defaultSemiBold' style={{ color: 'black' }}> Subir </ThemedText>
          </TouchableOpacity>

        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 20,
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  buttonsContainer:{
    flexDirection:'row',
    marginHorizontal: '20%',
    alignItems:'center',
    justifyContent:'space-between',  
  },
  imageContainer:{
    padding: 10,
    flexDirection:'row',
    justifyContent:'center',
  },
  modalButton: {
    alignSelf: 'center',
    backgroundColor: '#FFE800',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalSendButton: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: '#0ACF83',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  image: {
    width: 200,
    height: 200,
  },  
});

export default CaptureQRModal;
