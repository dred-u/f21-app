import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/authContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();


  React.useEffect(() => {
    // Redirige al login si no se esta autenticado
    if (!isAuthenticated) {
      router.replace('/login'); 
    }
  }, [isAuthenticated]);

  const getTabName = (defaultRoute: string, adminRoute: string, managerRoute: string) => {
    if (user?.rol === 'admin') return adminRoute;
    if (user?.rol === 'gerente') return managerRoute;
    return defaultRoute;
  };

  const getAltTabNames = (adminRoute: string, managerRoute: string, defaultRoute: string) => {
    if (user?.rol === 'admin') return [managerRoute, defaultRoute];
    if (user?.rol === 'gerente') return [adminRoute, defaultRoute];
    return [adminRoute, managerRoute];
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
      backBehavior={'history'}
    >

      {/*Inicio */}
      <Tabs.Screen
        name={getTabName('index', 'admin/index', 'manager/index')}
        options={{
          title: user?.rol === 'admin' || user?.rol === 'gerente' ? 'Inicio' : 'Inventario',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            //<TabBarIcon name={focused ? 'shirt' : 'shirt-outline'} color={color} />
          ),
        }}
      />

      {getAltTabNames('admin/index', 'manager/index', 'index').map((route) => (
        <Tabs.Screen
          key={route}
          name={route}
          options={{
            href: null,
          }}
        />
      ))}
      {/*Inicio */}

      {/*Capturas */}
      <Tabs.Screen
        name={getTabName('capture', 'admin/create', 'manager/create')}
        options={{
          title: user?.rol === 'admin' || user?.rol === 'gerente' ? 'Crear' : 'Captura',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ?
                (user?.rol === 'admin' || user?.rol === 'gerente' ? 'add-circle' : 'qr-code') :
                (user?.rol === 'admin' || user?.rol === 'gerente' ? 'add-circle-outline' : 'qr-code-outline')}
              color={color}
            />
          ),
        }}
      />

      {getAltTabNames('admin/create', 'manager/create', 'capture').map((route) => (
        <Tabs.Screen
          key={route}
          name={route}
          options={{
            href: null,
          }}
        />
      ))}
      {/*Capturas */}

      {/*Ordenes */}
      <Tabs.Screen
        name={user?.rol !== 'admin' ? 'orders':'admin/orders'}
        options={{
          title: 'Ordenes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'clipboard' : 'clipboard-outline'} color={color} />
          ),
        }}
      />

        <Tabs.Screen
          name={user?.rol === 'admin' ? 'orders':'admin/orders'}
          options={{
            href: null,
          }}
        />

      {/*Ordenes */}

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="order_details/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="admin_order/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="admin_order/newOrder"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="store/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="order_details/qrScanner"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="capture/qrScannerCapture"
        options={{
          href: null,
        }}
      />

    </Tabs>

  );
}
