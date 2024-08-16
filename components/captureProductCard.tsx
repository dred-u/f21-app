import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { baseURL } from '@/constants/conection';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import InputSpinner from 'react-native-input-spinner';
import { useProducts } from '@/context/productsContext';
import { useAuth } from '@/context/authContext';

interface CaptureCardProps {
  id: number;
  image: string;
  name: string;
  price: number;
  stock: number;
  onDelete: () => void;
  onUpdateStock: (newStock: number) => void;
}


const CaptureCard: React.FC<CaptureCardProps> = ({ id, image, name, price, stock, onDelete, onUpdateStock }) => {
  const { products } = useProducts();
  const { user } = useAuth();
  const [currentStock, setCurrentStock] = useState(stock || 0);
  const [originalStock, setOriginalStock] = useState<number>(0);

  useEffect(() => {
    const originalProduct = products.find(product => product.id === id);
    if (originalProduct) {
      setOriginalStock(originalProduct.cantidad);
    }
  }, [products, id]);
  

  const handleValueChange = (value: number) => {
    setCurrentStock(value);
    onUpdateStock(value);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: `${baseURL}/${image}` }} style={styles.image} />
      <View style={styles.infoContainer}>
        <ThemedText type='defaultSemiBold' style={styles.name}>{name}</ThemedText>
        <ThemedText type='default' style={styles.price}>$ {price}</ThemedText>
        {user?.rol != 'admin' &&
          <ThemedText type='default' style={styles.price}>Cantidad original: {originalStock}</ThemedText>
        }
        <View style={styles.buttons}>
          <InputSpinner
            max={999}
            min={0}
            step={1}
            value={currentStock}
            onChange={handleValueChange}
            style={styles.spinner}
            skin={'square'}
            color={'#494949'}
            colorPress={'#828282'}
            height={35}
          />
          <TouchableOpacity onPress={onDelete} style={styles.linkButton} >
            <Ionicons name="trash-outline" size={30} color={'black'}  />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 10,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
    elevation: 4,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  infoContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  name: {
    color: '#000',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  price: {
    color: '#000',
    marginBottom: 4,
  },
  stock: {
    color: '#000',
  },
  buttons:{
    paddingTop: 10,
    flexDirection:'row'
  },
  spinner: {
    width: 120,
  },
  linkButton:{
    marginLeft:'auto',
    borderRadius: 6,
  }
});

export default CaptureCard;
