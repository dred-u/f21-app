import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '@/constants/conection';
import { User } from './authContext';

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  genero: string;
  tipo: string;
  cantidad: number;
  imagenS: string;
  imagen: string;
}

export interface Order {
  id: number;
  id_sucursal: number;
  fecha: string;
  descripcion: string;
  status: string;
  sucursal: string;
}

export interface Capture {
  id: number;
  id_usuario: number;
  id_producto: number;
  id_sucursal: number;
  fecha: string;
  Usuario: User;
  Producto: Product;
}

export interface Verification {
  id: number;
  id_usuario: number;
  id_orden: number;
  id_sucursal: number;
  fecha: string;
  Usuario: User;
  Orden: Order;
}

interface ProductsContextType {
  products: Product[];
  getProducts: (storeId: number) => Promise<void>;
  getProduct: (productId: number) => Promise<[]>;
  addProductToStore: (productId: number, storeId: number, stock: number, image: string | null) => Promise<void>;
  orders: Order[];
  getOrders: (storeId: number) => Promise<void>;
  getOrderDetails: (orderId: number) => Promise<void>;
  verifyOrder: (orderId: number, status: string, userId:number, storeId:number, date:string) => Promise<void>;
  captureProducts: (products: { id: number; stock: number }[],  userId:number, storeId:number, date:string) => Promise<void>;
  captures: Capture[];
  verifications: Verification[];
  getCaptures: (storeId: number) => Promise<void>;
  getVerifications: (storeId: number) => Promise<void>;
}

interface ProductProviderProps {
  children: ReactNode;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts debe usarse dentro de ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]); 
  const [orders, setOrders] = useState<Order[]>([]); 
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);

  // FUNCIONES PARA PRODUCTOS
  const getProducts = async (storeId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/store_products/${storeId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const getProduct = async (productId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const addProductToStore = async (
    productId: number, 
    storeId: number, 
    stock: number, 
    image: string | null
  ) => {
    try {
      const formData = new FormData();
      formData.append('id_producto', productId.toString());
      formData.append('id_sucursal', storeId.toString());
      formData.append('cantidad', stock.toString());
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('imagen', {
          uri: image,
          type: blob.type,
          name: `product.png`,
        } as any);
      }

      const response = await axios.post(`${baseURL}/api/store_products/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Producto añadido a la tienda con éxito:', response.data);
    } catch (error) {
      console.error('Error subiendo la imagen:', error);
    }
  };

  // FUNCIONES PARA ORDENES Y CAPTURAS
  const getOrders = async (storeId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/store_orders/${storeId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error al obtener las ordenes:', error);
    }
  };

  const getOrderDetails = async (orderId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/order_details/${orderId}`);
      return response.data;
    } catch (error) {
  
    }
  };

  const verifyOrder = async (
    orderId: number, 
    status: string, 
    userId:number, 
    storeId:number, 
    date:string
  ) => {
    const query = { status }

    const queryVer = { 
      id_usuario: userId, 
      id_orden: orderId, 
      id_sucursal: storeId, 
      fecha: date
    };

    try {
      const response = await axios.patch(`${baseURL}/api/orders/${orderId}`, query);
      const res = await axios.post(`${baseURL}/api/verificate/`, queryVer);

      return response.data && res.data;
    } catch (error) {
      console.error('Error al obtener las ordenes:', error);
    }
  };

  const getVerifications = async (storeId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/verificate/${storeId}`);
      setVerifications(response.data);
    } catch (error) {
      setVerifications([]);
    }
  };

  const captureProducts = async (
    products: { id: number; stock: number }[],
    userId: number,
    storeId: number,
    date: string
  ): Promise<void> => {

    const productsData = products.map(product => ({
      id_producto: product.id,
      cantidad: product.stock
    }))

    const captureData = products.map(product => ({
      id_usuario: userId,
      id_producto: product.id,
      id_sucursal: storeId,
      fecha: date
    }));
  
    try {
      console.log(productsData);
      console.log(captureData);
      // Actualizar la cantidad de productos en la sucursal
      const responseP = await axios.patch(`${baseURL}/api/store_products/${storeId}`, {
        products:productsData
      });
      
      // Capturar los datos
      const response = await axios.post(`${baseURL}/api/capture/`, {
        captures: captureData
      });
      
      console.log('Captura de productos exitosa:', response.data && responseP.data);
    } catch (error) {
      console.error('Error al capturar los productos:', error);
      throw new Error('Ocurrió un error al capturar los productos.');
    }
  };

  const getCaptures = async (storeId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/capture/${storeId}`);
      setCaptures(response.data);
    } catch (error) {
      setCaptures([]);
    }
  };

  return (
    <ProductsContext.Provider 
    value={{ 
      getProducts, 
      getProduct,
      addProductToStore, 
      products, 
      getOrders, 
      orders, 
      getOrderDetails, 
      verifyOrder, 
      captureProducts,
      captures,
      verifications,
      getCaptures,
      getVerifications,
    }}
    >
      {children}
    </ProductsContext.Provider>
  );
};


