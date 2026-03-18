import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Layout as LayoutIcon, Bot, Utensils, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore, Product } from '../store/StoreContext';
import { cn } from '../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'shopping-cart': ShoppingCart,
  'layout': LayoutIcon,
  'bot': Bot,
  'utensils': Utensils,
};

export function Home() {
  const { products, addOrder, settings } = useStore();
  const [cart, setCart] = useState<Product[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const toggleProduct = (product: Product) => {
    if (cart.find(p => p.id === product.id)) {
      setCart(cart.filter(p => p.id !== product.id));
    } else {
      setCart([...cart, product]);
    }
  };

  const total = cart.reduce((acc, p) => acc + p.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Selecione pelo menos um produto!');
    if (!clientName || !clientPhone) return alert('Preencha seus dados!');

    const order = await addOrder({
      clientName,
      clientPhone,
      products: cart.map(p => ({ productId: p.id, quantity: 1 })),
      total,
    });

    const message = `Olá, sou ${clientName} e gostaria de solicitar:\n\n${cart.map(p => `- ${p.name} (R$ ${p.price}${p.isMonthly ? '/mês' : ''})`).join('\n')}\n\nTotal: R$ ${total}\nPedido ID: #${order.id}`;
    const whatsappNumber = settings?.whatsappNumber || '5511999999999';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    setCart([]);
    setClientName('');
    setClientPhone('');
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
            O futuro do seu negócio digital começa aqui.
          </h1>
          <p className="text-lg text-zinc-400">
            Soluções completas e modernas para impulsionar suas vendas. Escolha os serviços ideais para a sua empresa e decole.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {products.map((product, index) => {
          const Icon = iconMap[product.icon] || ShoppingCart;
          const isSelected = cart.some(p => p.id === product.id);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => toggleProduct(product)}
              className={cn(
                "relative group cursor-pointer rounded-2xl p-6 transition-all duration-300",
                "border border-white/5 bg-zinc-900/50 backdrop-blur-sm",
                "hover:border-indigo-500/50 hover:bg-indigo-500/5",
                isSelected && "border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]"
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-indigo-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-100">{product.name}</h3>
              <p className="text-sm text-zinc-400 mb-6 min-h-[40px]">{product.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">R$ {product.price}</span>
                {product.isMonthly && <span className="text-sm text-zinc-500">/mês</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-zinc-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Finalizar Pedido</h2>
          
          <div className="space-y-4 mb-8">
            {cart.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span className="text-zinc-300">{p.name}</span>
                <span className="font-medium text-white">R$ {p.price}{p.isMonthly ? '/mês' : ''}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Total Estimado</span>
              <span className="text-2xl font-bold text-indigo-400">R$ {total}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Seu Nome</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="Como devemos te chamar?"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">WhatsApp</label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <button
              type="submit"
              className="w-full mt-4 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl px-4 py-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Fazer Pedido via WhatsApp
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
