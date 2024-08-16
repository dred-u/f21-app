import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Image, View, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CaptureCard from '@/components/captureProductCard';
import { getCurrentDate } from '@/hooks/useDate';
import { useAuth } from '@/context/authContext';
import { useProducts, Product } from '@/context/productsContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from './ThemedView';
import { ThemedText } from '@/components/ThemedText';
import ThemedButton from '@/components/ThemedButton';
import { Ionicons } from '@expo/vector-icons';

const ScanComponent: React.FC = () => {
    const { user, store } = useAuth();
    const { getProducts, captureProducts } = useProducts();
    const icon = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');
    const imageQR = useThemeColor(
        { light: require('@/assets/images/qr-code-black.png'), dark: require('@/assets/images/qr-code-white.png') },
        'background'
    );
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [list, setList] = useState<boolean>(false);

    useFocusEffect(
        useCallback(() => {
            const fetchProducts = async () => {
                try {
                    const productosCapturados = await AsyncStorage.getItem('Captures');

                    if (productosCapturados) {
                        const parsedData = JSON.parse(productosCapturados);
                        setProducts(parsedData.products);
                    }
                } catch (error) {
                    console.error("Error fetching products from AsyncStorage:", error);
                }
            };

            fetchProducts();
            setList(products.length > 0);
        }, [products])
    );

    const handleDelete = (productId: number) => {
        setProductToDelete(productId);
        setModalVisible(prevState => !prevState);
    };

    const handleDeleteModal = async () => {
        if (productToDelete !== null) {
            const updatedProducts = products.filter(product => product.id !== productToDelete);
            setProducts(updatedProducts);

            const updatedCaptures = { products: updatedProducts };
            await AsyncStorage.setItem('Captures', JSON.stringify(updatedCaptures));
        }

        setModalVisible(false);
        setProductToDelete(null);
    };

    const handleUpdateStock = (productId: number, newStock: number) => {
        const updatedProducts = products.map(product =>
            product.id === productId ? { ...product, cantidad: newStock } : product
        );
        setProducts(updatedProducts);
        AsyncStorage.setItem('Captures', JSON.stringify({ products: updatedProducts }));
    };

    const handleConfirmModal = () => {
        setConfirmModalVisible(prevState => !prevState);
    };

    const handleConfirmCapture = async () => {
        const date = getCurrentDate();
        const userId = user?.id;
        const storeId = store?.id;

        try {
            if (userId && storeId) {
                await captureProducts(products.map(product => ({
                    id: product.id,
                    stock: product.cantidad
                })), userId, storeId, date);
                await getProducts(storeId);
            }

            await AsyncStorage.removeItem('Captures');
            setConfirmModalVisible(false);
            setProducts([])
        } catch (error) {
            console.error('Error al realizar la captura:', error);
        }
    };

    if (!products) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }



    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {products.length === 0 ? (
                    <View style={styles.content}>
                        <Image source={imageQR as any} style={styles.logo} />
                        <ThemedText type='default' style={styles.message}>
                            Aun no tienes ningun producto en espera,
                            si quieres actualizar existencias de algun producto ¡Escanealo!
                        </ThemedText>
                    </View>
                ) : (
                    products.map((product, index) => (
                        <CaptureCard
                            key={index}
                            id={product.id}
                            image={product.imagenS ? product.imagenS : product.imagen}
                            name={product.nombre}
                            price={product.precio}
                            stock={product.cantidad}
                            onDelete={() => handleDelete(product.id)}
                            onUpdateStock={(newStock) => handleUpdateStock(product.id, newStock)}
                        />
                    ))
                )}
            </ScrollView>

            <ThemedButton title="   Completar orden   " onPress={handleConfirmModal} disabled={!list} />


            {/* Modal de SIN EXISTENCIAS*/}
            <Modal
                animationType='fade'
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <ThemedView style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <View style={[styles.header, { borderBottomColor: borderColor }]}>
                            <ThemedText type='defaultSemiBold'> ELIMINAR </ThemedText>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginLeft: 'auto' }}>
                                <Ionicons name="close-circle-outline" size={28} color={icon} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={{ textAlign: 'center' }}>
                            ¿Quieres eliminar este producto de la lista de capturas?
                        </ThemedText>

                        <View style={{ paddingTop: 10 }}>
                            <TouchableOpacity onPress={handleDeleteModal} style={styles.modalButton}>
                                <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>  Confrimar  </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </ThemedView>
            </Modal>

            {/* Modal de CONFIRMACION */}
            <Modal
                animationType='fade'
                transparent={true}
                visible={isConfirmModalVisible}
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <ThemedView style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <View style={[styles.header, { borderBottomColor: borderColor }]}>
                            <ThemedText type='defaultSemiBold'> CONFIRMAR CAPTURA </ThemedText>
                            <TouchableOpacity onPress={handleConfirmModal} style={{ marginLeft: 'auto' }}>
                                <Ionicons name="close-circle-outline" size={28} color={icon} />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={{ textAlign: 'center' }}>
                            ¿Estás seguro de que quieres capturar los cambios?
                        </ThemedText>

                        <View style={{ paddingTop: 10 }}>
                            <TouchableOpacity onPress={handleConfirmCapture} style={styles.modalButton}>
                                <ThemedText type='defaultSemiBold' style={{ color: 'black' }}>Confirmar</ThemedText>
                            </TouchableOpacity>

                        </View>
                    </ThemedView>
                </ThemedView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    logo: {
        width: 400,
        height: 400,
        alignSelf: 'center',
    },
    content: {
        height: '100%',
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center'
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
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

})

export default ScanComponent;
