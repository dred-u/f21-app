import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/authContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  'login': undefined;
};

interface FormValues {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  password: string;
}

//ESTA ES LA FUNCION PRINCIPAL
const LoginScreen: React.FC = () => {
  const { user, updateUser, logout, isAuthenticated, store } = useAuth();
  const router = useRouter();
  const borderColor = useThemeColor({}, 'border');
  const icon = useThemeColor({}, 'icon');
  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    password: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    const a = async () => {
      const a = await AsyncStorage.getItem('token');
      console.log(a)
    }
    a()
    return () => {
      setShowConfirm(false);
    }
  }, [])


  const logOut = async () => {
    logout();
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    setConfirmModal(true);
  };


  const onConfirm = async () => {
    setConfirmModal(false);
    setModalVisible(false)
    if (user) {
      const response = await updateUser(
        user?.id,
        formValues.nombre,
        formValues.apellido_paterno,
        formValues.apellido_materno,
        formValues.password
      );

      console.log(response);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText type='titleBold'>PERFIL</ThemedText>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="pencil-sharp" size={30} color={icon} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.infoContainer}>
            <ThemedText type="defaultSemiBold" style={styles.label}>Nombre: <ThemedText type='light'>{user?.nombre}</ThemedText></ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.label}>Apellido Paterno: <ThemedText type='light'>{user?.apellido_paterno}</ThemedText></ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.label}>Apellido Materno: <ThemedText type='light'>{user?.apellido_materno}</ThemedText></ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.label}>Correo: <ThemedText type='light'>{user?.email}</ThemedText></ThemedText>

            {user?.rol != 'admin' &&
            <ThemedText type="defaultSemiBold" style={styles.label}>Sucursal: <ThemedText type='light'>{store?.nombre}</ThemedText></ThemedText>
            }
          
          </View>
          <TouchableOpacity style={[styles.logoutButton, { borderTopColor: borderColor }]} onPress={logOut}>
            <Ionicons name="log-out-outline" size={30} color={icon} />
            <ThemedText type="defaultSemiBold" style={styles.logoutText}>Cerrar sesión</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          animationType='fade'
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>

              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <ThemedText type='defaultSemiBold'>EDITAR PERFIL</ThemedText>
                <TouchableOpacity onPress={() => setModalVisible(prevState => !prevState)}>
                  <Ionicons name="close-circle-outline" size={24} color={icon} />
                </TouchableOpacity>
              </View>

              <View>
                <ThemedText type="default" style={styles.textInput}>Nombre</ThemedText>
                <ThemedTextInput
                  autoCapitalize='words'
                  style={styles.input}
                  value={formValues.nombre}
                  placeholder={user?.nombre}
                  onChangeText={(text: string) => handleInputChange('nombre', text)}
                />

                <ThemedText type="default" style={styles.textInput}>Apellido Paterno</ThemedText>
                <ThemedTextInput
                  autoCapitalize='words'
                  style={styles.input}
                  value={formValues.apellido_paterno}
                  placeholder={user?.apellido_paterno}
                  onChangeText={(text: string) => handleInputChange('apellido_paterno', text)}
                />

                <ThemedText type="default" style={styles.textInput}>Apellido Materno</ThemedText>
                <ThemedTextInput
                  autoCapitalize='words'
                  style={styles.input}
                  value={formValues.apellido_materno}
                  placeholder={user?.apellido_materno}
                  onChangeText={(text: string) => handleInputChange('apellido_materno', text)}
                />

                <ThemedText type="default" style={styles.textInput}>Contraseña</ThemedText>
                <ThemedTextInput
                  secureTextEntry
                  style={styles.input}
                  value={formValues.password}
                  placeholder={formValues.password}
                  onChangeText={(text: string) => handleInputChange('password', text)}
                />

              </View>

              <TouchableOpacity onPress={onSubmit} style={styles.modalButton}>
                <ThemedText type='defaultSemiBold' style={{ color: 'black' }}> Subir cambios </ThemedText>
              </TouchableOpacity>

            </ThemedView>
          </ThemedView>
        </Modal>

        <Modal
          animationType='fade'
          transparent={true}
          visible={confirmModal}
          onRequestClose={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={[styles.modalContent, { width: '50%', alignSelf: 'center' }]}>
              <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => setConfirmModal(prevState => !prevState)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close-circle-outline" size={24} color={icon} />
                </TouchableOpacity>
              </View>
              <ThemedText type="default" style={[styles.textInput, { textAlign: 'center' }]}>¿Seguro de subir estos cambios?</ThemedText>
              <TouchableOpacity onPress={onConfirm} style={styles.modalButton}>
                <ThemedText type='defaultSemiBold' style={{ color: 'black' }}> Confirmar </ThemedText>
              </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  label: {
    marginVertical: 8,
  },
  value: {
    fontWeight: 'normal',
  },
  logoutButton: {
    marginTop: 'auto',
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 10,
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

export default LoginScreen;
