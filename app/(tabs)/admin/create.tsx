import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAdmin } from '@/context/adminContext';
import InventoryCard from '@/components/InventoryCard';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedTextInput from '@/components/ThemedTextInput';
import NewUserForm from '@/components/admin/newUserForm';
import NewProductForm from '@/components/admin/newProductForm';
import NewStoreForm from '@/components/admin/newStoreForm';


const HomeScreen: React.FC = () => {
  const { products, getAllProducts, getStores, stores, getUsers, users } = useAdmin();
  const icon = useThemeColor({}, 'icon')
  const borderColor = useThemeColor({}, 'border');
  const [showProducts, setShowProducts] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [showUsers, setShowUsers] = useState(false);



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


  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type='titleBold'>INICIO</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          <View>
            {showProducts ? (
              <NewUserForm
                onBack={handleBackButton}
              />
            ) : showStores ? (
              <NewProductForm
                onBack={handleBackButton}
              />
            ) : showUsers ? (
              <NewStoreForm
                onBack={handleBackButton}
              />
            ) : (
              <>
                <TouchableOpacity style={styles.Buttons} onPress={handleProductsButton}>
                  <Ionicons name="person-add" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>REGISTRAR NUEVO GERENTE</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleStoresButton}>
                  <Ionicons name="shirt" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>CREAR NUEVO PRODUCTO</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleUsersButton}>
                  <Ionicons name="storefront" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>CREAR NUEVA SUCURSAL</ThemedText>
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
  modalButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#0ACF83',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  textInput: {
    paddingBottom: 5,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
  },
});

export default HomeScreen;
