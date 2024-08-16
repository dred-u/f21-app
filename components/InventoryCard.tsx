import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { baseURL } from '@/constants/conection';
import { ThemedText } from './ThemedText';

interface InventoryCardProps {
  image: string;
  name: string;
  price: number;
  stock: number | null;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ image, name, price, stock }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: `${baseURL}/${image}` }} style={styles.image} />
      <View style={styles.infoContainer}>
        <ThemedText type='defaultSemiBold' style={styles.name}>{name}</ThemedText>
        <ThemedText type='default' style={styles.price}>$ {price}</ThemedText>
        {stock !== null && 
          <ThemedText type='default' style={styles.stock}>{stock} en inventario</ThemedText>
        }
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
});

export default InventoryCard;
