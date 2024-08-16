import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import ThemedTextInput from '@/components/ThemedTextInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '../ThemedView';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '@/context/adminContext';
import ThemedButton from '../ThemedButton';

interface FormValues {
    nombre: string;
    precio: number;
    genero: string;
    tipo: string;
    imagen?: string; // Agrega el campo para la imagen
};

interface NewProductFormProps {
    onBack: () => void;
}

const tipos: { [key: string]: string } = {
    'camisa': 'camisa',
    'camiseta': 'camiseta',
    'pantalon': 'pantalon',
    'chamarra': 'chamarra',
    'jean': 'jean',
    'sweater': 'sweater',
    'blusa': 'blusa',
    'falda': 'falda',
    'vestido': 'vestido',
    'mallas': 'mallas',
    'pants': 'pants',
    'pijama': 'pijama',
    'short': 'short',
    'sudadera': 'sudadera'
};

const NewProductForm: React.FC<NewProductFormProps> = ({ onBack }) => {
    const router = useRouter();
    const { postProduct }= useAdmin();
    const icon = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');
    const backgroundColor = useThemeColor({}, 'background');
    const [formValues, setFormValues] = useState<FormValues>({
        nombre: '',
        precio: 0,
        genero: '',
        tipo: '',
        imagen: ''
    });
    const [confirmModal, setConfirmModal] = useState(false);
    const [success, setSuccess] = useState(false);

    const tipoOptions = Object.keys(tipos).map(key => ({
        label: tipos[key],
        value: key
    }));

    const handleInputChange = (name: string, value: string) => {
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleGenreChange = (itemValue: string) => {
        setFormValues({
            ...formValues,
            genero: itemValue,
        });
    };

    const handleTypeChange = (itemValue: string) => {
        setFormValues({
            ...formValues,
            tipo: itemValue,
        });
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFormValues({
                ...formValues,
                imagen: result.assets[0].uri
            });
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFormValues({
                ...formValues,
                imagen: result.assets[0].uri
            });
        }
    };

    const deletePhoto = () => {
        setFormValues({
            ...formValues,
            imagen: ''
        });
    };

    const onSubmit = async () => {
        if (
            formValues.genero &&
            formValues.nombre &&
            formValues.precio &&
            formValues.tipo &&
            formValues.imagen
        ) {
            setConfirmModal(true);
        }
    };

    const onConfirm = async () => {
        try {
            if(formValues.imagen){
                await postProduct(
                    formValues.nombre,
                    formValues.precio,
                    formValues.genero,
                    formValues.tipo,
                    formValues.imagen
                );
            }
          } catch (error) {
            console.error('Error subiendo la imagen:', error);
          }
        setSuccess(true);
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
                <ThemedText type='subtitle' style={{ marginLeft: 10 }}>REGISTRAR NUEVO PRODUCTO</ThemedText>
            </View>

            <ThemedText type="default" style={styles.textInput}>Nombre</ThemedText>
            <ThemedTextInput
                autoCapitalize='words'
                style={styles.input}
                value={formValues.nombre}
                onChangeText={(text: string) => handleInputChange('nombre', text)}
            />

            <ThemedText type="default" style={styles.textInput}>Precio</ThemedText>
            <ThemedTextInput
                keyboardType='numeric'
                style={styles.input}
                value={String(formValues.precio)}
                onChangeText={(text: string) => handleInputChange('precio', text)}
            />

            <ThemedText type="default" style={styles.textInput}>Genero</ThemedText>
            <ThemedView style={[styles.picker, { borderColor: borderColor }]}>
                <Picker
                    selectedValue={formValues.genero}
                    onValueChange={handleGenreChange}
                    style={{ backgroundColor: 'white', color: 'black' }}
                >
                    <Picker.Item label="Seleccione un género" value="" />
                    <Picker.Item key={1} label={'hombre'} value={'hombre'} />
                    <Picker.Item key={2} label={'mujer'} value={'mujer'} />
                </Picker>
            </ThemedView>

            <ThemedText type="default" style={styles.textInput}>Tipo</ThemedText>
            <ThemedView style={[styles.picker, { borderColor: borderColor }]}>
                <Picker
                    selectedValue={formValues.tipo}
                    onValueChange={handleTypeChange}
                    style={{ backgroundColor: 'white', color: 'black' }}
                >
                    <Picker.Item label="Seleccione un tipo" value="" />
                    {tipoOptions.map((tipo) => (
                        <Picker.Item key={tipo.value} label={tipo.label} value={tipo.value} />
                    ))}
                </Picker>
            </ThemedView>
            
                <ThemedText type="default" style={styles.textInput}>Imagen</ThemedText>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                <Ionicons name="image" size={24} color={'black'} />
                </TouchableOpacity>

                <TouchableOpacity onPress={takePhoto} style={styles.imagePickerButton}>
                <Ionicons name="camera" size={24} color={'black'} />
                </TouchableOpacity>
            </View>

            {formValues.imagen ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: formValues.imagen }} style={styles.image} />
                    <TouchableOpacity onPress={deletePhoto} style={styles.deleteImageButton}>
                        <Ionicons name="trash-outline" size={24} color={icon} />
                    </TouchableOpacity>
                </View>
            ) : null}

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
                            {success ? 'Se creó el producto.' : '¿Seguro de realizar esta acción?'}
                        </ThemedText>
                        <TouchableOpacity onPress={success ? onClose : onConfirm} style={styles.modalButton}>
                            <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Confirmar</ThemedText>
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
    buttonsContainer:{
        flexDirection:'row',
        marginHorizontal: '30%',
        alignItems:'center',
        justifyContent:'space-between',  
      },
    imagePickerButton: {
        alignSelf: 'center',
        backgroundColor: '#FFE800',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    imageContainer: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    deleteImageButton: {
        backgroundColor: 'transparent',
        padding: 10,
    },
});

export default NewProductForm;
