import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useAdmin } from '@/context/adminContext';
import { ThemedView } from '../ThemedView';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'expo-router';
import ThemedButton from '../ThemedButton';

interface FormValues {
  nombre: string;
  direccion: string;
  telefono: string;
}

interface NewStoreFormProps {
  onBack: () => void;
}

const NewStoreForm: React.FC<NewStoreFormProps> = ({ onBack }) => {
  const icon = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const router = useRouter();
  const { postStore } = useAdmin();
  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    direccion: '',
    telefono: '',
  });
  const [confirmModal, setConfirmModal] = useState(false);
  const [success, setSuccess] = useState(false)

  const handleInputChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    if (
      formValues.nombre &&
      formValues.direccion &&
      formValues.telefono
    ) {
      setConfirmModal(true);
    }
  };

  const onConfirm = async () => {
    const response = await postStore(
      formValues.nombre,
      formValues.telefono,
      formValues.direccion
    );

    if (response.status === 200) {
      setSuccess(true);
    }
  };

  const onClose = () => {
    setConfirmModal(false);
    setSuccess(false);
    router.push('/admin');
  };

  return (
    <View>
      <View style={[styles.backButton, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={icon} />
        </TouchableOpacity>
        <ThemedText type='subtitle' style={{ marginLeft: 10 }}>REGISTRAR NUEVA SUCURSAL</ThemedText>
      </View>

      <View>
        <ThemedText type="default" style={styles.textInput}>Nombre</ThemedText>
        <ThemedTextInput
          autoCapitalize='words'
          style={styles.input}
          value={formValues.nombre}
          onChangeText={(text: string) => handleInputChange('nombre', text)}
        />

        <ThemedText type="default" style={styles.textInput}>Dirección</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={formValues.direccion}
          onChangeText={(text: string) => handleInputChange('direccion', text)}
        />

        <ThemedText type="default" style={styles.textInput}>Teléfono</ThemedText>
        <ThemedTextInput
          style={styles.input}
          value={formValues.telefono}
          onChangeText={(text: string) => handleInputChange('telefono', text)}
        />
      </View>

      <ThemedButton title="   CREAR   " onPress={onSubmit}/>

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
              {success ? 'Se creó la sucursal.' : '¿Seguro de realizar esta acción?'}
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
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
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

export default NewStoreForm;
