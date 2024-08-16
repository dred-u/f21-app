import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseURL } from '@/constants/conection';
import { Alert } from 'react-native';

export interface User {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  rol: string;
}

export interface Store {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  isAuthenticated: boolean,
  register: (nombre: string, apellido_paterno: string, apellido_materno: string | null, email: string, password: string, rol: string) => Promise<{ status: number; data?: any }>;
  updateUser: (id: number, nombre: string, apellido_paterno: string, apellido_materno: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<{ status: number; data?: any }>;
  logout: () => Promise<{ status: number; data?: any }>;
  verifyToken: (token:string) => Promise<{ status: number; data?: any }>;
  store: Store | null; 
  getUserStore: (id: any) => Promise<{ status: number; data?: any }>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  //FUNCIONES DE AUTENTICACION 
  const register = async (
    nombre: string, 
    apellido_paterno: string, 
    apellido_materno: string | null, 
    email: string, 
    password: string, 
    rol: string
  ): Promise<{ status: number; data?: any }> => {
    const query = { nombre, apellido_paterno, apellido_materno, email, password, rol }
    try {
      console.log(query);
      const response = await axios.post(`${baseURL}/api/register`, query);
      const { user } = response.data;

      return { status: 200, data: user };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return { status: error.response.status, data: error.response.data.message };
      } else {
        return { status: 500, data: 'Error en la solicitud de registro.' };
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ status: number; data?: any }> => {
    const query = { email, password };
  
    try {
      const response = await axios.post(`${baseURL}/api/login`, query);
      const { token, user } = response.data;
  
      setUser(user as User);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('token', token);
      return { status: 200, data: response.data };
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        Alert.alert('Error de inicio de sesión', error.response.data.message);
        return { status: error.response.status, data: error.response.data.message };
      } else {
        Alert.alert('Error de inicio de sesión', 'Error en la solicitud de inicio de sesión.');
        return { status: 500, data: 'Error en la solicitud de inicio de sesión.' };
      }
    }
  };

  const logout = async (): Promise<{ status: number; data?: any }> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      setIsAuthenticated(false);
      setUser(null);
      setStore(null);
      return { status: 200, data: 'La sesion termino correctamente' };
    } catch (error) {
      return { status: 500, data: 'Error al cerrar sesión.' };
    }
  };

  const verifyToken = async (token:string): Promise<{ status: number; data?: any }> => {
    const query = { token };

    try {
      const response = await axios.post(`${baseURL}/api/verify`, query);
      const { user } = response.data;

      if (response.status === 200) {
      setUser(user as User);
      setIsAuthenticated(true);
      }
      return { status: 200, data: response.data };
    } catch (error: any) {
      setUser(null);
      AsyncStorage.removeItem('token');
      if (axios.isAxiosError(error) && error.response) {
        return { status: error.response.status, data: error.response.data.message };
      }else {
        return { status: 401, data: 'Error al verificar la sesion.' };
      }
    }
  };

  const updateUser = async (
    id: number,
    nombre: string | null, 
    apellido_paterno: string | null, 
    apellido_materno: string | null, 
    password: string | null
  ) => {
    const query = { nombre, apellido_paterno, apellido_materno, password }

    try {
      const response = await axios.patch(`${baseURL}/api/user/${id}`, query);
      const { message, user } = response.data;

      setUser(user as User);
      return message;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message);
      }
    }
  };

  const getUserStore = async (id: number): Promise<{ status: number; data?: any }> => {
    try {
      const response = await axios.get(`${baseURL}/api/store_user/${id}`);
      setStore(response.data.Sucursal);
      return { status: 200, data: response.data };
    } catch (error: any) {
      console.error('Error al obtener la sucursal:', error);
      setUser(null);
      if (error.response && error.response.status === 404) {
        return { status: 404 };
      }
      return { status: error.response ? error.response.status : 500 };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser, 
        isAuthenticated, 
        register, 
        login, 
        logout, 
        verifyToken, 
        updateUser,
        store, 
        getUserStore 
      }}>
      {children}
    </AuthContext.Provider>
  );
};


