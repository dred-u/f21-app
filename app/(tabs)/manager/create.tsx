import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NewUserForm from '@/components/admin/newUserForm';
import ScanComponent from '@/components/captureComponent';

const Create: React.FC = () => {
  const icon = useThemeColor({}, 'icon')
  const router = useRouter();
  const borderColor = useThemeColor({}, 'border');
  const [showProducts, setShowProducts] = useState(false);
  const [showStores, setShowStores] = useState(false);

  const handleProductsButton = () => {
    setShowProducts(true);
    setShowStores(false);
  };

  const handleStoresButton = () => {
    setShowStores(true);
    setShowProducts(false);
  };

  const handleBackButton = () => {
    setShowProducts(false);
    setShowStores(false);
  };

  const navigateToQRScanner = () => {
    router.push('/capture/qrScannerCapture');
  };
  
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type='titleBold'>CREAR</ThemedText>
        </View>

          <View style={styles.scrollViewContent}>
            {showProducts ? (
              <NewUserForm
                onBack={handleBackButton}
              />
            ) : showStores ? (
              <>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="chevron-back" size={24} color={icon} />
                  </TouchableOpacity>
                  <ThemedText type='titleBold'>CAPTURAR PRODUCTOS</ThemedText>
                  <TouchableOpacity onPress={navigateToQRScanner} style={{ marginLeft: 'auto' }}>
                    <Ionicons name="add-circle" size={30} color={"#0ACF83"} />
                  </TouchableOpacity>
                </View>
                <ScanComponent />
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.Buttons} onPress={handleProductsButton}>
                  <Ionicons name="person-add" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>REGISTRAR NUEVO EMPLEADO</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleStoresButton}>
                  <Ionicons name="shirt" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>CAPTURAR PRODUCTOS</ThemedText>
                </TouchableOpacity>

              </>
            )}
          </View>

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

export default Create;
