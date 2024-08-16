import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { baseURL } from '@/constants/conection';
import { ThemedText } from './ThemedText';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface OrderProductCardProps {
  orderId: number;
  id: number;
  image: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

const OrderProductCard: React.FC<OrderProductCardProps> = ({ orderId, id, image, name, price, stock, status }) => {
  const [verified, setVerified] = useState<Boolean>(false);

  const checkOrder = async () => {
    const exists = await AsyncStorage.getItem(`Order_${orderId}`);
    if (exists) {
      const parsedExists = JSON.parse(exists);
      if (parsedExists.ids && Array.isArray(parsedExists.ids)) {
        setVerified(parsedExists.ids.includes(id));
      } else {
        setVerified(false);
      }
    } else {
      setVerified(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkOrder();
    }, [orderId, id])
  );

  return (
    <View style={styles.card}>
      <Image source={{ uri: `${baseURL}/${image}` }} style={styles.image} />
      <View style={styles.infoContainer}>
        <ThemedText type='defaultSemiBold' style={styles.name}>{name}</ThemedText>
        <ThemedText type='default' style={styles.price}>$ {price}</ThemedText>
        <ThemedText type='default' style={styles.stock}>Cantidad: {stock}</ThemedText>

        {status == 'pendiente' && (
          <Link 
            style={[styles.linkButton, {backgroundColor:verified ?'#0ACF83' : 'white'}]} 
            disabled={verified as any}
            href={{
              pathname: '/order_details/qrScanner',
              params: { orderId:orderId, id: id, cantidad: stock, status: status}
            }}
          >
            <ThemedText type='defaultSemiBold' style={{color:'black'}}>
              {verified ? 'Verificado' : 'Verificar'}
            </ThemedText>
          </Link>
        )}


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
    alignSelf: 'center',
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
  linkButton:{
    marginLeft:'auto',
    borderColor:'#0ACF83',
    textAlign:'center',
    width: 110,
    borderWidth: 1,
    borderRadius: 6,
    padding:10
  }
});

export default OrderProductCard;
