import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAdmin } from '@/context/adminContext';
import InventoryCard from '@/components/InventoryCard';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedTextInput from '@/components/ThemedTextInput';

const HomeScreen: React.FC = () => {
  const { products, getAllProducts, getStores, stores, getUsers, users } = useAdmin();
  const icon = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({}, 'border');
  const [showProducts, setShowProducts] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchStoreText, setSearchStoreText] = useState('');
  const [searchUserText, setSearchUserText] = useState('');

  useFocusEffect(
    useCallback(() => {
      const obtainData = async () => {
        await getAllProducts();
        await getStores();
        await getUsers();
      };

      obtainData();
    }, [])
  );

  if (!products || !stores || !users) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleProductsButton = () => {
    setShowProducts(true);
    setShowStores(false);
    setShowUsers(false);
  };

  const handleStoresButton = () => {
    setShowStores(true);
    setShowProducts(false);
    setShowUsers(false);
  };

  const handleUsersButton = () => {
    setShowUsers(true);
    setShowProducts(false);
    setShowStores(false);
  };

  const handleBackButton = () => {
    setShowProducts(false);
    setShowStores(false);
    setShowUsers(false);
  };

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredStores = stores.filter(store =>
    store.nombre.toLowerCase().includes(searchStoreText.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchUserText.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor, position: 'relative' }]}>
          <ThemedText type='titleBold'>INICIO</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          <View>
            {showProducts ? (
              <>
                <View style={[styles.backButton, { flexDirection: 'row', borderBottomColor: borderColor }]}>
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="chevron-back" size={24} color={icon} />
                  </TouchableOpacity>
                  <ThemedText type='subtitle' style={{ marginLeft: 10 }}>PRODUCTOS</ThemedText>
                </View>

                <ThemedTextInput
                  style={styles.searchInput}
                  placeholder="Buscar productos..."
                  value={searchText}
                  onChangeText={text => setSearchText(text)}
                />

                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <InventoryCard
                      key={index}
                      image={product.imagen}
                      name={product.nombre}
                      price={product.precio}
                      stock={null}
                    />
                  ))
                ) : (
                  <ThemedText style={{ textAlign: 'center' }} type='defaultSemiBold'>
                    No se encontraron productos.
                  </ThemedText>
                )}
              </>
            ) : showStores ? (
              <>
                <View style={[styles.backButton, { flexDirection: 'row', borderBottomColor: borderColor }]}>
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="chevron-back" size={24} color={icon} />
                  </TouchableOpacity>
                  <ThemedText type='subtitle' style={{ marginLeft: 10 }}>SUCURSALES</ThemedText>
                </View>

                <ThemedTextInput
                  style={styles.searchInput}
                  placeholder="Buscar sucursales..."
                  value={searchStoreText}
                  onChangeText={text => setSearchStoreText(text)}
                />

                {filteredStores.length > 0 ? (
                  filteredStores.map((store, index) => (
                    <Link
                      href={{
                        pathname: '/store/[id]',
                        params: { id: store.id, nombre: store.nombre }
                      }}

                      key={index} style={styles.card}
                    >
                      <ThemedText type='defaultCardBold' style={{ color: 'black' }}>{store.nombre}{"\n"}</ThemedText>
                      <ThemedText type='default' style={{ color: 'black' }}>Dirección: {store.direccion}{"\n"}</ThemedText>
                      <ThemedText type='default' style={{ color: 'black' }}>Teléfono: {store.telefono}</ThemedText>
                    </Link>
                  ))
                ) : (
                  <ThemedText style={{ textAlign: 'center' }} type='defaultSemiBold'>
                    No se encontraron sucursales.
                  </ThemedText>
                )}
              </>
            ) : showUsers ? (
              <>
                <View style={[styles.backButton, { flexDirection: 'row', borderBottomColor: borderColor }]}>
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="chevron-back" size={24} color={icon} />
                  </TouchableOpacity>
                  <ThemedText type='subtitle' style={{ marginLeft: 10 }}>USUARIOS</ThemedText>
                </View>

                <ThemedTextInput
                  style={styles.searchInput}
                  placeholder="Buscar usuarios..."
                  value={searchUserText}
                  onChangeText={text => setSearchUserText(text)}
                />

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <View key={index} style={styles.card}>
                      <ThemedText type='default' style={{ color: 'black' }}>
                        <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Nombre:</ThemedText>
                        {user.nombre}
                      </ThemedText>
                      <ThemedText type='default' style={{ color: 'black' }}>
                        <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Apellido Paterno:</ThemedText>
                        {user.apellido_paterno}
                      </ThemedText>
                      <ThemedText type='default' style={{ color: 'black' }}>
                        <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Apellido Materno:</ThemedText>
                        {user.apellido_materno}
                      </ThemedText>
                      <ThemedText type='default' style={{ color: 'black' }}>
                        <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Email:</ThemedText>
                        {user.email}
                      </ThemedText>
                      <ThemedText type='default' style={{ color: 'black' }}>
                        <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Rol:</ThemedText>
                        {user.rol}
                      </ThemedText>
                    </View>
                  ))
                ) : (
                  <ThemedText style={{ textAlign: 'center' }} type='defaultSemiBold'>
                    No se encontraron usuarios.
                  </ThemedText>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.Buttons} onPress={handleProductsButton}>
                  <Ionicons name="shirt" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>PRODUCTOS</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleStoresButton}>
                  <Ionicons name="storefront" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>SUCURSALES</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleUsersButton}>
                  <Ionicons name="people" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>USUARIOS</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
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
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  Buttons: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 150,
    width: '99%',
    flexDirection: 'column',
    padding: 10,
    margin: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  searchInput: {
    height: 40,
    marginBottom: 20,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    width: '99%',
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
    elevation: 4,
  },
});

export default HomeScreen;
