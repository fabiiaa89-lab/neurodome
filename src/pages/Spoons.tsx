import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { ToyBrick as Spoon, Plus, Minus, Info, AlertTriangle } from 'lucide-react';

const Spoons: React.FC = () => {
  const { t } = useApp();
  const [totalSpoons, setTotalSpoons] = useState(12);
  const [usedSpoons, setUsedSpoons] = useState(0);

  useEffect(() => {
    const savedTotal = localStorage.getItem('cfg_total_spoons');
    const savedUsed = localStorage.getItem('cfg_used_spoons');
    if (savedTotal) setTotalSpoons(parseInt(savedTotal));
    if (savedUsed) setUsedSpoons(parseInt(savedUsed));
  }, []);

  const save = (total: number, used: number) => {
    setTotalSpoons(total);
    setUsedSpoons(used);
    localStorage.setItem('cfg_total_spoons', total.toString());
    localStorage.setItem('cfg_used_spoons', used.toString());
  };

  const toggleSpoon = (idx: number) => {
    if (idx < usedSpoons) {
      save(totalSpoons, usedSpoons - 1);
    } else {
      save(totalSpoons, usedSpoons + 1);
    }
  };

  const remaining = totalSpoons - usedSpoons;
  const status = remaining <= 3 ? 'critical' : remaining <= 6 ? 'warning' : 'good';

  return (
    <div className="space-y-6 pb-12">
      <section className="flex items-center gap-4 mb-8">
        <div className="bg-blue/10 p-3 rounded-2xl">
          <Spoon className="text-blue" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Mis Cucharas</h1>
          <p className="text-xs font-bold text-text3 tracking-widest uppercase">Gestión de Energía</p>
        </div>
      </section>

      <section className="bg-surface border border-border p-6 rounded-[32px] space-y-4">
        <div className="flex items-center gap-3 text-teal">
          <Info size={18} />
          <h3 className="font-bold text-sm uppercase tracking-wider">Teoría de las Cucharas</h3>
        </div>
        <p className="text-sm text-text2 leading-relaxed">
          Cada cuchara representa una unidad de energía física y mental. Tocar una cuchara la "gasta". Úsalo para visualizar cuánta energía te queda hoy.
        </p>
      </section>

      {/* Spoons Grid */}
      <section className="grid grid-cols-4 sm:grid-cols-6 gap-4 py-8">
        {Array.from({ length: totalSpoons }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleSpoon(i)}
            className={`aspect-square rounded-2xl flex items-center justify-center transition-all border-2 ${
              i < usedSpoons 
                ? 'bg-surface2 border-border text-text3 opacity-30' 
                : 'bg-blue/10 border-blue/30 text-blue shadow-lg shadow-blue/10'
            }`}
          >
            <Spoon size={24} fill={i < usedSpoons ? "none" : "currentColor"} />
          </motion.button>
        ))}
      </section>

      {/* Status Card */}
      <section className={`p-6 rounded-[32px] border flex items-center gap-5 ${
        status === 'critical' ? 'bg-red/10 border-red/20' : 
        status === 'warning' ? 'bg-amber/10 border-amber/20' : 'bg-green/10 border-green/20'
      }`}>
        <div className={`p-4 rounded-2xl ${
          status === 'critical' ? 'bg-red/20 text-red' : 
          status === 'warning' ? 'bg-amber/20 text-amber' : 'bg-green/20 text-green'
        }`}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="text-2xl font-black">{remaining} Cucharas</div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">
            {status === 'critical' ? 'Batería Crítica — Descansa ya' : 
             status === 'warning' ? 'Energía Limitada — Prioriza' : 'Estado Estable'}
          </p>
        </div>
      </section>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button 
          onClick={() => save(Math.max(1, totalSpoons - 1), Math.min(usedSpoons, totalSpoons - 1))}
          className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-text2 active:scale-95 transition-all"
        >
          <Minus size={18} />
          <span>Quitar Total</span>
        </button>
        <button 
          onClick={() => save(totalSpoons + 1, usedSpoons)}
          className="bg-surface border border-border p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-text2 active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>Añadir Total</span>
        </button>
      </div>
    </div>
  );
};

export default Spoons;
