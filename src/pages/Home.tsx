import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Scan, CreditCard, Brain, Ghost, MessageSquare, Bell, User, Heart, ToyBrick } from 'lucide-react';

const Home: React.FC = () => {
  const { t, userData } = useApp();
  const navigate = useNavigate();

  const cards = [
    { label: t.scannerLbl, icon: Scan, path: '/scanner', color: 'text-teal', bg: 'bg-teal/10' },
    { label: t.deudasLbl, icon: CreditCard, path: '/deudas', color: 'text-amber', bg: 'bg-amber/10' },
    { label: t.iaHoyLbl, icon: Brain, path: '/ai', color: 'text-purple', bg: 'bg-purple/10' },
    { label: t.tarjetas, icon: MessageSquare, path: '/comms', color: 'text-blue', bg: 'bg-blue/10' },
    { label: t.alarmas, icon: Bell, path: '/medication', color: 'text-red', bg: 'bg-red/10' },
    { label: t.cueva, icon: Ghost, path: '/cave', color: 'text-text3', bg: 'bg-surface2' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome */}
      <section className="pt-4">
        <h2 className="text-text3 text-xs font-bold uppercase tracking-widest mb-1">Bienvenido</h2>
        <h1 className="text-3xl font-black">Hola, <span className="text-teal">{userData.nombre.split(' ')[0] || 'Usuario'}</span></h1>
      </section>

      {/* Grid of Apps */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, idx) => (
          <motion.button
            key={card.path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(card.path)}
            className={`${card.bg} border border-border p-6 rounded-3xl flex flex-col items-center gap-3 transition-colors hover:border-teal/30`}
          >
            <card.icon className={card.color} size={32} />
            <span className="font-bold text-sm tracking-tight">{card.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Social Battery Placeholder */}
      <section className="bg-surface p-6 rounded-3xl border border-border">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm uppercase tracking-tighter text-text3">Batería Social</span>
          <span className="text-teal font-black text-xl">80%</span>
        </div>
        <div className="h-4 bg-bg rounded-full overflow-hidden border border-border">
          <div className="h-full bg-teal w-[80%] rounded-full shadow-[0_0_15px_rgba(77,182,172,0.5)]" />
        </div>
      </section>
    </div>
  );
};

export default Home;
