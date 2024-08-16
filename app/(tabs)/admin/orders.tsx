import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useProducts } from '@/context/productsContext';
import OrderCard from '@/components/OrderCard';
import { Link, useFocusEffect } from 'expo-router';
import { useAdmin } from '@/context/adminContext';
import { Ionicons } from '@expo/vector-icons';

const OrdersScreen: React.FC = () => {
  const { orders, getOrders } = useAdmin();
  const borderColor = useThemeColor({}, 'border');
  const imageClip = useThemeColor(
    { light: require('@/assets/images/clipboard-black.png'), dark: require('@/assets/images/clipboard-white.png') },
    'background'
  );
  const [showPending, setShowPending] = useState(true);


  useFocusEffect(
    useCallback(() => {
      const obtainProds = async () => {
          await getOrders();
      };
      obtainProds();
    }, [])
  );


  if (!orders) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const filteredOrders = showPending
    ? orders.filter(order => order.status === 'pendiente')
    : orders.filter(order => order.status === 'completada' || order.status === 'incompleta');

  const handleToggleOrders = () => {
    setShowPending(prevState => !prevState);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type='titleBold'> {showPending ? 'ORDENES' : 'ORDENES ANTERIORES'}</ThemedText>
          
          <TouchableOpacity style={[styles.prevButton,{marginLeft:'auto'}]} onPress={handleToggleOrders}>
            <ThemedText type='defaultSemiBold' style={{ color: '#000000', fontSize: 12 }}>
              {showPending ? 'Anteriores' : 'Pendientes'}
            </ThemedText>
          </TouchableOpacity>

          <Link
            href={{
              pathname: '/admin_order/newOrder',
              params: {}
            }}
            style={{marginLeft:15}}
          >
            <Ionicons name="add-circle" size={30} color={"#0ACF83"} />
          </Link>



        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image source={imageClip as any} style={styles.emptyImage} />

              <ThemedText type='titleBold'>
                {showPending ? 'No hay órdenes pendientes' : 'No hay órdenes'}
              </ThemedText>
              <ThemedText type='default'>
                {showPending ? 'No tienes órdenes pendientes en este momento.' : 'No tienes órdenes en este momento.'}
              </ThemedText>

            </View>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderCard
                key={index}
                id={order.id}
                desc={order.descripcion}
                status={order.status}
                date={order.fecha}
                store={order.sucursal}
                rol={'admin'}
              />
            ))
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  prevButton: {
    backgroundColor: '#FFE800',
    padding: 7,
    borderRadius: 4
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});

export default OrdersScreen;
