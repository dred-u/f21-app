import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/context/adminContext';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from '../ThemedView';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'expo-router';
import ThemedButton from '@/components/ThemedButton';

interface FormValues {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  sucursal: number;
}

interface NewUserFormProps {
  onBack: () => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onBack }) => {
  const icon = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const router = useRouter();
  const { getStores, stores, postManager } = useAdmin();
  const { register, user } = useAuth();
  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    sucursal: 0,
  });
  const [storeOptions, setStoreOptions] = useState<{ label: string; value: number }[]>([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchStores = async () => {
      await getStores();
    };

    fetchStores();
  }, []);

  useEffect(() => {
    if (stores) {
      const options = stores.map(store => ({
        label: store.nombre,
        value: store.id,
      }));
      setStoreOptions(options);
    }
  }, [stores]);

  const handleInputChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleStoreChange = (itemValue: number) => {
    setFormValues({
      ...formValues,
      sucursal: itemValue,
    });
  };

  const onSubmit = async () => {
    if (
      formValues.nombre &&
      formValues.apellido_paterno &&
      formValues.apellido_materno &&
      formValues.email &&
      formValues.sucursal
    ) {
      setConfirmModal(true);
    }
  };

  const onConfirm = async () => {
    const response = await register(
      formValues.nombre,
      formValues.apellido_paterno,
      formValues.apellido_materno,
      formValues.email,
      formValues.nombre,
      user?.rol === 'admin' ? 'gerente' : 'empleado'
    )

    if (response.status === 200) {
      const res = await postManager(response.data.id, formValues.sucursal)
    }
    setSuccess(true);
  };

  const onClose = () => {
    setConfirmModal(false);
    setSuccess(false);
    router.push('/admin');
  }

  return (
    <View>
      <View style={[styles.backButton, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={icon} />
        </TouchableOpacity>
        <ThemedText type='subtitle' style={{ marginLeft: 10 }}>
          {user?.rol === 'admin' ? 'REGISTRAR NUEVO GERENTE' : 'REGISTRAR NUEVO EMPLEADO'}
        </ThemedText>
      </View>

      <View>
        <ThemedText type="default" style={styles.textInput}>Nombre</ThemedText>
        <ThemedTextInput
          autoCapitalize='words'
          style={styles.input}
          value={formValues.nombre}
          onChangeText={(text: string) => handleInputChange('nombre', text)}
        />

        <ThemedText type="default" style={styles.textInput}>Apellido Paterno</ThemedText>
        <ThemedTextInput
          autoCapitalize='words'
          style={styles.input}
          value={formValues.apellido_paterno}
          onChangeText={(text: string) => handleInputChange('apellido_paterno', text)}
        />

        <ThemedText type="default" style={styles.textInput}>Apellido Materno</ThemedText>
        <ThemedTextInput
          autoCapitalize='words'
          style={styles.input}
          value={formValues.apellido_materno}
          onChangeText={(text: string) => handleInputChange('apellido_materno', text)}
        />

        <ThemedText type="default" style={styles.textInput}>Email</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={formValues.email}
          onChangeText={(text: string) => handleInputChange('email', text)}
        />

        <ThemedText type="default" style={styles.textInput}>Sucursal</ThemedText>
        <ThemedView style={[styles.picker, { borderColor: borderColor }]}>
          <Picker
            selectedValue={formValues.sucursal}
            onValueChange={handleStoreChange}
            style={{ backgroundColor: 'white', color: 'black' }}
          >
            <Picker.Item label="Selecciona una sucursal" value="" />
            {storeOptions.map((store) => (
              <Picker.Item key={store.value} label={store.label} value={store.value} />
            ))}
          </Picker>
        </ThemedView>
      </View>
      <ThemedButton title="   REGISTRAR   " onPress={onSubmit}/>

      <Modal
        animationType='fade'
        transparent={true}
        visible={confirmModal}
        onRequestClose={() => setConfirmModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { width: '50%', alignSelf: 'center' }]}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
              <TouchableOpacity onPress={() => setConfirmModal(prevState => !prevState)} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close-circle-outline" size={24} color={icon} />
              </TouchableOpacity>
            </View>

            <ThemedText type="default" style={[styles.textInput, { textAlign: 'center' }]}>
              {success ? 'Se creo el usuario.' : '¿Seguro de realizar esta accion?'}
            </ThemedText>
            <TouchableOpacity onPress={success ? onClose : onConfirm} style={styles.modalButton}>
              <ThemedText type='defaultSemiBold' style={{ color: 'black' }}> Confirmar </ThemedText>
            </TouchableOpacity>

          </ThemedView>
        </ThemedView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  textInput: {
    paddingBottom: 5,
  },
  input: {
    backgroundColor:'#fff',
    color: '#000',
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
  },
  picker: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  modalButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#0ACF83',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
});

export default NewUserForm;
