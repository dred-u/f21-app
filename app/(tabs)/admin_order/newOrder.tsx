import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, FlatList, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import CaptureCard from '@/components/captureProductCard'
import { useAdmin } from '@/context/adminContext';
import { Picker } from '@react-native-picker/picker';
import ThemedButton from '@/components/ThemedButton';
import { getCurrentDate } from '@/hooks/useDate';

interface FormValues {
    id_sucursal: number;
    fecha: string;
    descripcion: string;
    status: string;
}

const OrderDetailScreen: React.FC = () => {
    const router = useRouter();
    const { products, stores, createOrder } = useAdmin();
    const borderColor = useThemeColor({}, 'border');
    const icon = useThemeColor({}, 'icon');
    const [storeOptions, setStoreOptions] = useState<{ label: string; value: number }[]>([]);
    const [formValues, setFormValues] = useState<FormValues>({
        id_sucursal: 0,
        fecha: '',
        descripcion: '',
        status: '',
    });
    const [confirmModal, setConfirmModal] = useState(false);
    const [success, setSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

    useEffect(() => {
        if (stores) {
            const options = stores.map(store => ({
                label: store.nombre,
                value: store.id,
            }));
            setStoreOptions(options);
        }
    }, [stores]);

    useEffect(() => {
        setFilteredProducts(
            products.filter(product =>
                product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, products]);

    const handleStoreChange = (itemValue: number) => {
        setFormValues({
            ...formValues,
            id_sucursal: itemValue,
        });
    };

    const handlePress = () => {
        router.push('/admin/orders');
    };

    const handleInputChange = (name: string, value: string) => {
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleProductSelect = (product: string) => {
        if (!selectedProducts.includes(product)) {
            setSelectedProducts([...selectedProducts, product]);
            setSearchQuery('')
        }
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => handleProductSelect(item)} style={styles.productItem}>
            <ThemedText>{item.nombre}</ThemedText>
        </TouchableOpacity>
    );

    const handleDelete = (productId: number) => {
        setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
    };

    const handleUpdateStock = (productId: number, newStock: number) => {
        const updatedProducts = selectedProducts.map(product =>
            product.id === productId ? { ...product, cantidad: newStock } : product
        );
        setSelectedProducts(updatedProducts);
    };

    const onSubmit = async () => {
        if (formValues.descripcion && formValues.id_sucursal) {
            setConfirmModal(true);
        }
    };

    const onConfirm = async () => {
        const confirmStock = selectedProducts.some(product => product.cantidad === undefined || product.cantidad === 0);

        // Esto sirve para verificar si falta agregar cantidad a algun producto
        if (confirmStock) {
            Alert.alert(
                "Cantidad inválida",
                "Uno o más productos tienen cantidad igual a 0, por favor agrega una cantidad para continuar",
                [{ text: "OK" }]
            );
            setConfirmModal(false);
            return;
        }

        const fecha = getCurrentDate().toString();
        const status = 'pendiente';

        const selection = selectedProducts.map(product => ({
            id_producto: product.id,
            cantidad: product.cantidad >= 0 ? product.cantidad : 0,
        }));

        const response = await createOrder(
            formValues.id_sucursal,
            fecha,
            formValues.descripcion,
            status,
            selection
        );

        if (response.status === 200) {
            setSuccess(true);
        }
    };


    const onClose = () => {
        setFormValues({
            id_sucursal: 0,
            fecha: '',
            descripcion: '',
            status: '',
        });
        setSelectedProducts([]);
        setConfirmModal(false);
        setSuccess(false);
        router.push('/admin/orders');
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={handlePress}>
                        <Ionicons name="chevron-back" size={30} color={icon} />
                    </TouchableOpacity>
                    <ThemedText type='titleBold'>CREAR ORDEN</ThemedText>
                </View>
                <View style={styles.scrollViewContent}>
                    <View>
                        <ThemedText type="default" style={styles.textInput}>Descripción</ThemedText>
                        <TextInput
                            autoCapitalize='sentences'
                            style={styles.textArea}
                            value={formValues.descripcion}
                            onChangeText={(text) => handleInputChange('descripcion', text)}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={300}
                        />
                        <ThemedText type="default" style={styles.textInput}>Sucursal</ThemedText>
                        <ThemedView style={[styles.picker, { borderColor: borderColor }]}>
                            <Picker
                                selectedValue={formValues.id_sucursal}
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

                    <View>
                        <ThemedText type="default" style={styles.textInput}>Buscar producto</ThemedText>
                        <TextInput
                            autoCapitalize={'sentences'}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar..."
                        />
                        {searchQuery.length > 0 && (
                            <>
                                {filteredProducts.length > 0 ? (
                                    <FlatList
                                        data={filteredProducts}
                                        renderItem={renderProductItem}
                                        keyExtractor={item => item.id.toString()}
                                    />
                                ) : (
                                    <ThemedText type="default">
                                        No hay productos que coincidan
                                    </ThemedText>
                                )}
                            </>
                        )}
                    </View>

                    {selectedProducts.length > 0 && searchQuery.length === 0 &&
                        <View style={{ marginTop: 20 }}>
                            <ThemedText type="default" style={styles.textInput}>Productos seleccionados:</ThemedText>
                            <ScrollView style={{ maxHeight: 450 }} contentContainerStyle={{ paddingBottom: 20 }}>
                                {selectedProducts.map((product, index) => (
                                    <CaptureCard
                                        key={product.id}
                                        id={product.id}
                                        name={product.nombre}
                                        price={product.precio}
                                        image={product.imagen}
                                        stock={product.cantidad}
                                        onDelete={() => handleDelete(product.id)}
                                        onUpdateStock={(newStock) => handleUpdateStock(product.id, newStock)}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    }


                </View>
                {selectedProducts.length > 0 && searchQuery.length === 0 && formValues.descripcion && formValues.id_sucursal &&
                    <View style={{ marginTop: 'auto', }}>
                        <ThemedButton title="GENERAR ORDEN" onPress={onSubmit} />
                    </View>
                }

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
                                {success ? 'Se creó la orden.' : '¿Seguro de realizar esta acción?'}
                            </ThemedText>
                            <TouchableOpacity onPress={success ? onClose : onConfirm} style={styles.modalButton}>
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
        padding: 20,
        paddingBottom: 0,
        justifyContent: 'center',
    },
    scrollViewContent: {
        flexGrow: 1,
        height: '90%'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomWidth: 1,
        marginBottom: 20,
    },
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
    textArea: {
        height: 'auto',
        backgroundColor: '#fff',
        color: '#000',
        marginBottom: 15,
        borderWidth: 1,
        borderRadius: 5,
        padding: 8,
        fontSize: 16,
    },
    input: {
        height: 40,
        backgroundColor: '#fff',
        color: '#000',
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
    productItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
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
});

export default OrderDetailScreen;
