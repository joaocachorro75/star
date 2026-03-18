import React, { createContext, useContext, useState, useEffect } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  isMonthly: boolean;
  description: string;
  icon: string;
};

export type Order = {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  products: { productId: string; quantity: number }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
};

export type Settings = {
  appName: string;
  logoUrl: string;
  whatsappNumber: string;
  evolutionApiEnabled: boolean;
  evolutionApiUrl: string;
  evolutionApiInstance: string;
  evolutionApiKey: string;
};

type StoreContextType = {
  settings: Settings | null;
  products: Product[];
  orders: Order[];
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  updateSettings: (settings: Settings) => Promise<void>;
  updateProductPrice: (id: string, price: number) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  refreshOrders: () => Promise<void>;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('star_admin_token'));

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/products').then(res => res.json()).then(setProducts);
  }, []);

  const refreshOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setOrders(await res.json());
      } else if (res.status === 401) {
        logout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('star_admin_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('star_admin_token');
    setToken(null);
    setOrders([]);
  };

  const updateSettings = async (newSettings: Settings) => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newSettings)
    });
    setSettings(newSettings);
  };

  const updateProductPrice = async (id: string, price: number) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ price })
    });
    setProducts(products.map(p => p.id === id ? { ...p, price } : p));
  };

  const addOrder = async (order: Omit<Order, 'id' | 'date' | 'status'>) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const data = await res.json();
    const newOrder = { ...order, ...data };
    if (token) setOrders([newOrder, ...orders]);
    return newOrder;
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <StoreContext.Provider value={{ settings, products, orders, token, login, logout, updateSettings, updateProductPrice, addOrder, updateOrderStatus, refreshOrders }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
