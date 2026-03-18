import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/StoreContext';
import { Package, Users, DollarSign, Settings, CheckCircle2, Clock, XCircle, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export function Admin() {
  const { settings, products, orders, token, login, logout, updateSettings, updateProductPrice, updateOrderStatus, refreshOrders } = useStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [appName, setAppName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [evolutionApiEnabled, setEvolutionApiEnabled] = useState(false);
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiInstance, setEvolutionApiInstance] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');

  useEffect(() => {
    if (settings) {
      setAppName(settings.appName || '');
      setLogoUrl(settings.logoUrl || '');
      setWhatsappNumber(settings.whatsappNumber || '');
      setEvolutionApiEnabled(settings.evolutionApiEnabled || false);
      setEvolutionApiUrl(settings.evolutionApiUrl || '');
      setEvolutionApiInstance(settings.evolutionApiInstance || '');
      setEvolutionApiKey(settings.evolutionApiKey || '');
    }
  }, [settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
      } else {
        setLoginError(data.error || 'Erro ao fazer login');
      }
    } catch (e) {
      setLoginError('Erro de conexão');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ 
      appName, logoUrl, whatsappNumber, 
      evolutionApiEnabled, evolutionApiUrl, evolutionApiInstance, evolutionApiKey 
    });
    alert('Configurações salvas com sucesso!');
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 w-full max-w-md backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Acesso Restrito</h2>
          {loginError && <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Usuário</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Senha</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <button type="submit" className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl px-4 py-4 transition-all">
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Painel de Controle</h1>
          <p className="text-zinc-400">Gerencie seus produtos, clientes e pedidos.</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Receita Total</h3>
          </div>
          <p className="text-3xl font-bold text-white">R$ {totalRevenue}</p>
        </div>
        
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Pedidos Pendentes</h3>
          </div>
          <p className="text-3xl font-bold text-white">{pendingOrders}</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">Total de Clientes</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {new Set(orders.map(o => o.clientPhone)).size}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeTab === 'orders' ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
          )}
        >
          Pedidos Recentes
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors",
            activeTab === 'products' ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
          )}
        >
          Gerenciar Preços
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
            activeTab === 'settings' ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
          )}
        >
          <Settings className="w-4 h-4" />
          Configurações
        </button>
      </div>

      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden"
        >
          {orders.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">Nenhum pedido encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Valor</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-500">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{order.clientName}</div>
                        <div className="text-zinc-500 text-xs">{order.clientPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(order.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-300">R$ {order.total}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border",
                          order.status === 'completed' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          order.status === 'pending' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                          order.status === 'cancelled' && "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {order.status === 'completed' ? 'Concluído' : order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="p-2 text-zinc-400 hover:text-emerald-400 transition-colors"
                              title="Marcar como concluído"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                              title="Cancelar pedido"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.map(product => (
            <div key={product.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-1">{product.name}</h3>
              <p className="text-sm text-zinc-500 mb-6">{product.description}</p>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Preço (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProductPrice(product.id, Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 max-w-2xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Configurações do Sistema</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Nome da Empresa</label>
              <input
                type="text"
                value={appName}
                onChange={e => setAppName(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ex: Star"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">URL da Logo</label>
              <input
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-xs text-zinc-500 mt-2">Deixe em branco para usar o ícone padrão.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Número do WhatsApp</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="5511999999999"
              />
              <p className="text-xs text-zinc-500 mt-2">Apenas números, incluindo código do país (ex: 55) e DDD.</p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-lg font-medium text-white mb-4">Evolution API v2 (Notificações)</h3>
              
              <label className="flex items-center gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={evolutionApiEnabled}
                  onChange={e => setEvolutionApiEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-zinc-950 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-zinc-300">Ativar notificações automáticas no WhatsApp</span>
              </label>

              {evolutionApiEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">URL da API (Base URL)</label>
                    <input
                      type="url"
                      value={evolutionApiUrl}
                      onChange={e => setEvolutionApiUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="https://sua-api.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Nome da Instância</label>
                    <input
                      type="text"
                      value={evolutionApiInstance}
                      onChange={e => setEvolutionApiInstance(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Instancia01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Global API Key</label>
                    <input
                      type="password"
                      value={evolutionApiKey}
                      onChange={e => setEvolutionApiKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="Sua Global API Key"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl px-6 py-3 transition-colors"
            >
              Salvar Configurações
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
