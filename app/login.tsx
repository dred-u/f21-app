import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import ThemedButton from '@/components/ThemedButton';
import { useAuth } from '@/context/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

//ESTA ES LA FUNCION PRINCIPAL
const LoginScreen: React.FC = () => {
  const { login, isAuthenticated, user, store, getUserStore } = useAuth();
  const router = useRouter();
  const borderColor = useThemeColor({}, 'border');
  const logoSource = useThemeColor(
    { light: require('@/assets/images/Forever-21-Logo.png'), dark: require('@/assets/images/Forever-21-Black.png') },
    'background'
  );
  const [formValues, setFormValues] = useState<FormValues>({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const isValidForm = () => {
    const errors: FormErrors = {};

    if (!formValues.email) {
      errors.email = '¡El correo es requerido!';
    }

    if (!formValues.password) {
      errors.password = '¡La contraseña es requerida!';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      setTimeout(() => {
        setShowErrors(false);
      }, 2500);
    }

    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    if (isValidForm()) {
      await login(formValues.email, formValues.password);
    }
  };

  useEffect(() => {
    const checkStore = async () => {
      if (!store && user?.rol != 'admin') {
        const response = await getUserStore(user?.id);
        if (response.status === 200){
          if(user?.rol === 'gerente') {
            router.navigate('/(tabs)/manager')
          }else{
            router.navigate('/(tabs)')
          }
        }
        else if (response.status == 404){
          AsyncStorage.removeItem('token');
          setModalVisible(true);
        }
      }else if (user?.rol === 'admin') {
        router.navigate('/(tabs)/admin')
      }
    };
    if (isAuthenticated && user)  {
      checkStore();
    }
    
    return () => {
      setModalVisible(false);
      setFormValues({
        email: "",
        password: "",
      });
    };

  }, [isAuthenticated, user]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Image source={logoSource as any} style={styles.logo} />
          <ThemedText type="subtitle">STOCK MANAGER SYSTEM</ThemedText>
        </View>

        <ThemedText type="title" style={styles.loginText}>INGRESAR</ThemedText>

        <View style={styles.inputContainer}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <ThemedText type="default">Correo electrónico</ThemedText>
            <ThemedText type="light" style={{ marginLeft: 'auto' }}>{showErrors ? formErrors.email : ''}</ThemedText>
          </View>
          <ThemedTextInput
            style={styles.input}
            value={formValues.email}
            onChangeText={(text: string) => handleInputChange('email', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={{ display: 'flex', flexDirection: 'row' }}>
            <ThemedText type="default">Contraseña</ThemedText>
            <ThemedText type="light" style={{ marginLeft: 'auto' }}>{showErrors ? formErrors.password : ''}</ThemedText>
          </View>
          <ThemedTextInput
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
            value={formValues.password}
            onChangeText={(text: string) => handleInputChange('password', text)}
          />
        </View>

        <ThemedButton title="INICIAR SESIÓN" onPress={onSubmit} disabled={false}/>
        {
          /* 
        <TouchableOpacity>
          <ThemedText type="light" style={styles.forgotPassword}>¿Olvidaste tu contraseña?</ThemedText>
        </TouchableOpacity>
          */
        }

        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText style={{ textAlign: 'center' }}>El usuario no pertenece a ninguna tienda, pide a tu gerente que lo asigne.</ThemedText>
              <View style={{ paddingTop: 10 }}>
                <ThemedButton title="Entendido" onPress={() => setModalVisible(false)} disabled={false}/>
              </View>
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
  logo: {
    width: 350,
    height: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 30,
    borderBottomWidth: 2,
  },
  line: {

  },
  loginText: {
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginVertical: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 20,
    width: '60%',
  },
  buttonText: {
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 10,

  }
});

export default LoginScreen;
