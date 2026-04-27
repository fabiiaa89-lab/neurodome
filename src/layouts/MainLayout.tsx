import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, Home, ShieldAlert, User, Scan, CreditCard, Box, Ghost, Kit, Heart, Moon, Sun, CloudRain, Share2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'home', icon: Home, label: t.appName, path: '/' },
    { id: 'sos', icon: ShieldAlert, label: 'SOS', path: '/sos' },
    { id: 'profile', icon: User, label: t.miApoyo, path: '/profile' },
    { id: 'scanner', icon: Scan, label: t.scannerLbl, path: '/scanner' },
    { id: 'deudas', icon: CreditCard, label: t.deudasLbl, path: '/deudas' },
    { id: 'cave', icon: Ghost, label: t.cueva, path: '/cave' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-teal/30">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-bg/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:bg-surface2 rounded-full transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="font-bold text-xl tracking-tight">
          NEURO<span className="text-text3">-DOME</span>
        </div>
        <button 
          onClick={() => navigate('/sos')}
          className="p-2 text-red hover:bg-red/10 rounded-full transition-colors"
        >
          <ShieldAlert size={24} />
        </button>
      </header>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-surface border-r border-border z-50 overflow-y-auto"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="font-bold text-xl">Menú</div>
                  <button onClick={closeMenu} className="p-2 hover:bg-surface2 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <nav className="flex-1 space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { navigate(item.path); closeMenu(); }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        location.pathname === item.path 
                        ? 'bg-teal/10 text-teal border border-teal/20' 
                        : 'hover:bg-surface2'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-border space-y-6">
                  {/* Theme Switcher */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-text3 uppercase tracking-widest px-4">Apariencia</div>
                    <div className="grid grid-cols-3 gap-2 px-2">
                      <button onClick={() => setTheme('dark')} className={`p-3 rounded-lg flex justify-center ${theme === 'dark' ? 'bg-surface2 border border-teal/50' : 'bg-bg'}`}><Moon size={18}/></button>
                      <button onClick={() => setTheme('light')} className={`p-3 rounded-lg flex justify-center ${theme === 'light' ? 'bg-surface2 border border-teal/50' : 'bg-bg'}`}><Sun size={18}/></button>
                      <button onClick={() => setTheme('rainbow')} className={`p-3 rounded-lg flex justify-center ${theme === 'rainbow' ? 'bg-surface2 border border-teal/50' : 'bg-bg'}`}><CloudRain size={18}/></button>
                    </div>
                  </div>

                  {/* Lang Switcher */}
                  <div className="flex items-center justify-between px-4 bg-surface2 p-4 rounded-2xl">
                    <span className="text-sm font-medium">Idioma</span>
                    <div className="flex gap-1 bg-bg p-1 rounded-lg">
                      <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-bold ${lang === 'es' ? 'bg-surface2 text-teal' : 'text-text3'}`}>ES</button>
                      <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md text-xs font-bold ${lang === 'en' ? 'bg-surface2 text-teal' : 'text-text3'}`}>EN</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20 pb-24 min-h-screen container mx-auto max-w-lg px-4">
        {children}
      </main>

      {/* Floating Action Button (Mute) */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-surface shadow-2xl border border-border rounded-full flex items-center justify-center z-40 active:scale-90 transition-transform"
        onClick={() => {/* logic logic */}}
      >
        <Moon className="text-teal" size={24} />
      </button>
    </div>
  );
};

export default Layout;
