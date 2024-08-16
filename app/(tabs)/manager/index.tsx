import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAdmin } from '@/context/adminContext';
import InventoryCard from '@/components/InventoryCard';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useProducts } from '@/context/productsContext';
import { useAuth } from '@/context/authContext';
import DateTimePicker from 'react-native-ui-datepicker';
import { Capture, Verification } from '@/context/productsContext';

const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month-1, day);
};

const HomeScreen: React.FC = () => {
  const { getStoreUsers, users } = useAdmin();
  const { products, getProducts, verifications, getVerifications, captures, getCaptures } = useProducts();
  const { store } = useAuth();
  const icon = useThemeColor({}, 'icon')
  const borderTint = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'background');
  const [showProducts, setShowProducts] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchUserText, setSearchUserText] = useState('');
  const [filterType, setFilterType] = useState<'captures' | 'verifications'>('captures');
  const [captureCount, setCaptureCount] = useState(0);
  const [verificationCount, setVerificationCount] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [dateEnd, setDateEnd] = useState<Date | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filteredCapturas, setFilteredCapturas] = useState<Capture[]>([]);
  const [filteredVerificaciones, setFilteredVerificaciones] = useState<Verification[]>([]);
  useFocusEffect(
    useCallback(() => {
      const obtainData = async () => {
        if (store) {
          await getProducts(store.id);
          await getStoreUsers(store.id);
          await getVerifications(store.id);
          await getCaptures(store.id);
        }
      };

      obtainData();
    }, [store])
  );

  if (!products || !users) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  const handleProductsButton = () => {
    setShowProducts(true);
    setShowStats(false);
    setShowUsers(false);
  };

  const handleStoresButton = () => {
    setShowStats(true);
    setShowProducts(false);
    setShowUsers(false);
  };

  const handleUsersButton = () => {
    setShowUsers(true);
    setShowProducts(false);
    setShowStats(false);
  };

  const handleBackButton = () => {
    setShowProducts(false);
    setShowStats(false);
    setShowUsers(false);
  };

  const filteredProducts = products.filter(product =>
    product.nombre?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.nombre?.toLowerCase().includes(searchUserText.toLowerCase())
  );


  useEffect(() => {
    if (date && dateEnd) {
      const newFilteredCapturas = captures.filter((captura) => {
        const capturaDate = parseDate(captura.fecha);
        console.log(capturaDate)
        return capturaDate >= date && capturaDate <= dateEnd;
      });

      const newFilteredVerificaciones = verifications.filter((verificacion) => {
        const verificacionDate = parseDate(verificacion.fecha);
        return verificacionDate >= date && verificacionDate <= dateEnd;
      });

      setFilteredCapturas(newFilteredCapturas);
      setFilteredVerificaciones(newFilteredVerificaciones);
      setCaptureCount(newFilteredCapturas.length);
      setVerificationCount(newFilteredVerificaciones.length);
      console.log(date, dateEnd)
    } else {
      setFilteredCapturas(captures);
      setFilteredVerificaciones(verifications);
      setCaptureCount(captures.length);
      setVerificationCount(verifications.length);
    }
    console.log("CAPTURAS", filteredCapturas)
    console.log("VERIFICACIONES", filteredVerificaciones)
  }, [date, dateEnd, captures, verifications]);


  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderTint, position: 'relative' }]}>
          <ThemedText type='titleBold'>INICIO</ThemedText>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>

          <View>
            {showStats ? (
              <>
                <View style={[styles.backButton, { flexDirection: 'row', borderBottomColor: borderTint }]}>
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="chevron-back" size={24} color={icon} />
                  </TouchableOpacity>
                  <ThemedText type='subtitle' style={{ marginLeft: 10 }}>ESTADISTICAS</ThemedText>
                </View>

                <View style={styles.filterButtons}>
                  <View style={{ alignItems: 'center' }}>

                    <View style={[styles.block, { backgroundColor: icon }]}>
                      <Text style={[styles.blockText, { color: text }]}>
                        {captureCount}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => setFilterType('captures')}
                      style={[styles.filterButton, { backgroundColor: filterType === 'captures' ? icon : text }]}>
                      <ThemedText type='defaultSemiBold' style={{ color: filterType === 'captures' ? text : icon }}>
                        Productos capturados
                      </ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignItems: 'center' }}>

                    <View style={[styles.block, { backgroundColor: icon }]}>
                      <Text style={[styles.blockText, { color: text }]}>
                        {verificationCount}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setFilterType('verifications')}
                      style={[styles.filterButton, { backgroundColor: filterType === 'verifications' ? icon : text }]}
                    >
                      <ThemedText type='defaultSemiBold' style={{ color: filterType === 'verifications' ? text : icon }}>
                        Ordenes verificadas
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{flexDirection:'row', marginLeft:'auto'}}>
                  <TouchableOpacity onPress={() => setModalVisible(true)}
                    style={[styles.filterButton, { backgroundColor: icon, marginLeft: 'auto', margin: 10 }]}
                  >
                    <Ionicons name="calendar" size={24} color={text} />
                  </TouchableOpacity>
                  {date && dateEnd &&
                    <TouchableOpacity onPress={() => {setDate(null), setDateEnd(null)}}
                      style={[styles.filterButton, { backgroundColor: icon, marginLeft: 'auto', margin: 10 }]}
                    >
                      <Ionicons name="close" size={24} color={text} />
                    </TouchableOpacity>
                  }
                </View>

                {filterType === 'captures' ? (
                  <>
                    {/* Filtro y renderizado de capturas */}
                    <ThemedTextInput
                      style={styles.searchInput}
                      placeholder="Buscar capturas..."
                      value={searchText}
                      onChangeText={text => setSearchText(text)}
                    />

                    {filteredCapturas.filter(capture =>
                      capture.fecha.toLowerCase().includes(searchText.toLowerCase()) ||
                      capture.Usuario.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                      capture.Producto.nombre.toLowerCase().includes(searchText.toLowerCase())
                    ).map((capture, index) => (
                      <ThemedView key={`capture-${index}`} style={[styles.table, { borderColor: borderTint }]}>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>{capture.fecha}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>{capture.Usuario.nombre} {capture.Usuario.apellido_paterno}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>
                            {capture.Usuario.rol}
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>{capture.Producto.nombre.toLowerCase()}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                    ))}

                    {captures.length === 0 && (
                      <ThemedText style={{ textAlign: 'center' }} type='defaultSemiBold'>
                        No se encontraron capturas.
                      </ThemedText>
                    )}
                  </>
                ) : (
                  <>
                    {/* Filtro y renderizado de verificaciones */}
                    <ThemedTextInput
                      style={styles.searchInput}
                      placeholder="Buscar verificaciones..."
                      value={searchText}
                      onChangeText={text => setSearchText(text)}
                    />

                    {filteredVerificaciones.filter(verification =>
                      verification.fecha.toLowerCase().includes(searchText.toLowerCase()) ||
                      verification.Usuario.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                      `Orden #${verification.Orden.id}`.toLowerCase().includes(searchText.toLowerCase())
                    ).map((verification, index) => (
                      <ThemedView key={`verification-${index}`} style={[styles.table, { borderColor: borderTint }]}>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>{verification.fecha}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>{verification.Usuario.nombre} {verification.Usuario.apellido_paterno}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>{verification.Orden.status}</ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.row, { flex: 1, borderColor: borderTint }]}>
                          <ThemedText>Orden #{verification.Orden.id}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                    ))}

                    {verifications.length === 0 && (
                      <ThemedText style={{ textAlign: 'center' }} type='defaultSemiBold'>
                        No se encontraron verificaciones.
                      </ThemedText>
                    )}
                  </>
                )}

              </>
            ) : showProducts ? (
              <>
                <View style={[styles.backButton, { flexDirection: 'row', borderBottomColor: borderTint }]}>
                  <TouchableOpacity onPress={handleBackButton}>
                    <Ionicons name="chevron-back" size={24} color={icon} />
                  </TouchableOpacity>
                  <ThemedText type='subtitle' style={{ marginLeft: 10 }}>INVENTARIO</ThemedText>
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
                      image={product.imagenS ? product.imagenS : product.imagen}
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
            ) : showUsers ? (
              <>
                <View style={[styles.backButton, { flexDirection: 'row', borderBottomColor: borderTint }]}>
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
                      {user.puesto &&
                        <ThemedText type='default' style={{ color: 'black' }}>
                          <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Actividad:</ThemedText>
                          {user.puesto}
                        </ThemedText>}
                    </View>
                  ))
                ) : (
                  <ThemedText style={{ textAlign: 'center' }} type='defaultSemiBold'>
                    No se encontraron empleados.
                  </ThemedText>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.Buttons} onPress={handleStoresButton}>
                  <Ionicons name="storefront" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>ESTADISTICAS</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleProductsButton}>
                  <Ionicons name="shirt" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>INVENTARIO</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.Buttons} onPress={handleUsersButton}>
                  <Ionicons name="people" size={80} color={'black'} />
                  <ThemedText type='subtitle' style={{ color: 'black' }}>EMPLEADOS</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        {/* Modal de calendario*/}
        <Modal
          animationType='fade'
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <View style={[styles.header, { borderBottomColor: borderTint }]}>
                <ThemedText type='defaultSemiBold'> FILTRAR POR FECHA </ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close-circle-outline" size={28} color={icon} />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                mode="range"
                locale="es"
                firstDayOfWeek={1}
                startDate={date}
                endDate={dateEnd}
                selectedItemColor={'#0ACF83'}
                calendarTextStyle={{color:icon}}
                headerTextStyle={{color:icon}}
                headerButtonColor={icon}
                weekDaysTextStyle={{color:icon}}
                monthContainerStyle={{backgroundColor:text}}
                yearContainerStyle={{backgroundColor:text}}
                onChange={({ startDate, endDate }) => {
                  setDate(startDate ? startDate as Date : new Date());
                  setDateEnd(endDate ? endDate as Date : null);
                }}
              />

            </ThemedView>
          </ThemedView>
        </Modal>

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
  table: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  row: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderWidth: 1,
  },
  rowTitle: {
    justifyContent: 'center',
    paddingHorizontal: 10,
    fontSize: 14
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
  },
  block: {
    height: 120,
    width: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  blockText: {
    fontFamily: 'BarlowSemiBold',
    fontSize: 60
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

export default HomeScreen;
