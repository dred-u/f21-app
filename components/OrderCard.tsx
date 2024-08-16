import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Link } from 'expo-router';

interface OrderCardProps {
  id: number;
  desc: string;
  status: string;
  date: string;
  store: string;
  rol: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ id, desc, status, date, rol }) => {
  return (
    <Link
      href={{
        pathname: rol === 'admin' ? '/admin_order/[id]' : 'order_details/[id]',
        params: { id: id, status: status}
      }}
      asChild // Esto sirve para que se comporte como un child component y no me afecte el estilo
    >
      <TouchableOpacity style={styles.card}>
        <View style={styles.top}>
          <ThemedText type='defaultCardBold' style={styles.id}>ORDEN #{id}</ThemedText>
          <ThemedText style={styles.date}>{date}</ThemedText>
        </View>

        <View style={styles.center}>
          <ThemedText style={styles.description}>{desc}</ThemedText>
          <View style={styles.bottom}>
            <ThemedText type='defaultSemiBold' style={styles.store}>Status: </ThemedText>
            <ThemedText style={styles.storeName}>{status}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    margin: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
    elevation: 4,
  },

  top: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },

  center: {
    justifyContent: 'center',
    flex: 1,
  },

  bottom: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'row',
  },

  id: {
    marginBottom: 4,
    flexWrap: 'wrap',
    color: '#000'
  },

  date: {
    marginLeft: 'auto',
    color: '#000'
  },

  description: {
    paddingBottom: 10,
    color: '#000'
  },

  store: {
    color: '#000'
  },

  storeName: {
    color: '#000'
  }

});

export default OrderCard;
