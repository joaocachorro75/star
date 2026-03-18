import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Rocket, ShieldCheck, MessageCircle } from 'lucide-react';
import { useStore } from '../store/StoreContext';

export function Layout() {
  const { settings } = useStore();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.appName} className="h-8 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {settings?.appName || 'STAR'}
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link to="/" className="hover:text-zinc-50 transition-colors">Início</Link>
            <Link to="/admin" className="flex items-center gap-1 hover:text-zinc-50 transition-colors">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} {settings?.appName || 'Star'}. Todos os direitos reservados.</p>
          <p className="mt-2">
            Desenvolvido por{' '}
            <a 
              href="https://to-ligado.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              To-Ligado.com
            </a>
          </p>
        </div>
      </footer>

      {settings?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-110"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      )}
    </div>
  );
}
