import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { baseURL } from '@/constants/conection';
import { Store } from '@/context/authContext';
import { Product } from '@/context/productsContext';
import { User } from '@/context/authContext';
import { Order } from '@/context/productsContext'

interface Stores extends Store {
  gerente: string;
};

interface Employee extends User {
  puesto: string | null;
}

interface AdminContextType {
  products: Product[];
  getAllProducts: () => Promise<void>;
  stores: Stores[];
  getStores: () => Promise<void>;
  getStoreUsers: (storeId: number) => Promise<void>
  users: Employee[];
  getUsers: () => Promise<void>;
  postManager: (id_usuario: number, id_sucursal: number) => Promise<{ status: number; data?: any }>;
  postProduct: (nombre: string, precio: number, genero: string, tipo:string, image: string | null) => Promise<void>
  postStore: (nombre: string, telefono: string, direccion: string) => Promise<{ status: number; data?: any }>;
  getOrders: () => Promise<void>;
  createOrder: (idSucursal: number, fecha: string, descripcion: string, status: string, orderDetails: {id_producto: number; cantidad: number;}[]) => Promise<{ status: number; data?: any }>;
  orders: Order[];
}

interface AdminProviderProps {
  children: ReactNode;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin debe usarse dentro de AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]); 
  const [stores, setStores] = useState<Stores[]>([]); 
  const [users, setUsers] = useState<Employee[]>([]); 
  const [orders, setOrders] = useState<Order[]>([]); 

  // FUNCIONES PARA PRODUCTOS
  const getAllProducts = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/products/`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  // FUNCIONES PARA TIENDAS
  const getStores = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/stores/`);
      setStores(response.data);
    } catch (error) {
      setStores([]);
    }
  }; 

  const getUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/users/`);
      setUsers(response.data);
    } catch (error) {
      setUsers([]);
    }
  }; 

  const getStoreUsers = async (storeId: number) => {
    try {
      const response = await axios.get(`${baseURL}/api/store_users/${storeId}`);
      const usersData = response.data.map((item: any) => ({
        ...item.Usuario,
        puesto: item.puesto,
      }));
      setUsers(usersData);
    } catch (error) {
      setUsers([]);
    }
  }; 

  const postManager = async (id_usuario:number, id_sucursal:number): Promise<{ status: number; data?: any }> => {
    const query = { id_usuario, id_sucursal }
    try {
      const response = await axios.post(`${baseURL}/api/store_users/`, query);
      return { status: 200, data: response.data };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return { status: error.response.status, data: error.response.data.message };
      } else {
        return { status: 500, data: 'Error en la solicitud de registro.' };
      }
    }
  }; 

  const postProduct = async (
    nombre: string, 
    precio: number, 
    genero: string, 
    tipo: string,
    image: string | null
  ) => {
    try {
      const formData = new FormData();
      formData.append('nombre', nombre.toString());
      formData.append('precio', precio.toString());
      formData.append('tipo', tipo.toString());
      formData.append('genero', genero.toString());
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('imagen', {
          uri: image,
          type: blob.type,
          name: `product.png`,
        } as any);
      }

      const response = await axios.post(`${baseURL}/api/products/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Producto añadido a la tienda con éxito:', response.data);
    } catch (error) {
      console.error('Error subiendo la imagen:', error);
    }
  };

  const postStore = async (nombre:string, telefono:string, direccion:string): Promise<{ status: number; data?: any }> => {
    const query = { nombre, telefono, direccion }
    try {
      const response = await axios.post(`${baseURL}/api/stores/`, query);
      return { status: 200, data: response.data };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return { status: error.response.status, data: error.response.data.message };
      } else {
        return { status: 500, data: 'Error en la solicitud de registro.' };
      }
    }
  }; 

  const getOrders = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/orders/`);
      setOrders(response.data);
    } catch (error) {
      setOrders([]);
    }
  };

  const createOrder = async (
    idSucursal: number,
    fecha: string,
    descripcion: string,
    status: string,
    orderDetails: { id_producto: number; cantidad: number }[]
): Promise<{ status: number; data?: any }> => {
    try {
        // Primero crea la orden
        const orderResponse = await axios.post(`${baseURL}/api/orders/`, {
            id_sucursal: idSucursal,
            fecha,
            descripcion,
            status,
        });
        // Luego extrae el ID para crear los detalles
        const { id } = orderResponse.data;

        const detailsResponse = await axios.post(`${baseURL}/api/order_details/`, orderDetails.map(detail => ({
            id_orden: id,
            id_producto: detail.id_producto,
            cantidad: detail.cantidad,
        })));

        return { status: 200, data: { order: orderResponse.data, details: detailsResponse.data } };
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return { status: error.response.status, data: error.response.data.message };
        } else {
            return { status: 500, data: 'Error en la solicitud de creación de la orden.' };
        }
    }
};

  return (
    <AdminContext.Provider 
    value={{ 
      products,
      getAllProducts,
      getStores,
      getStoreUsers,
      stores, 
      getUsers,
      users, 
      postManager,
      postProduct,
      postStore,
      getOrders,
      orders,
      createOrder
    }}
    >
      {children}
    </AdminContext.Provider>
  );
};


