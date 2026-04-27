import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Ghost, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cave: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(900); // 15:00

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-12 opacity-20"
      >
        <Ghost size={120} className="text-teal" />
      </motion.div>

      <div className="space-y-4 mb-20">
        <h1 className="text-text3 text-xs font-bold uppercase tracking-[0.4em]">Modo Cueva Activo</h1>
        <div className="text-6xl font-black font-mono text-white tracking-tighter">
          {formatTime(seconds)}
        </div>
        <p className="text-text3 text-sm max-w-[200px] mx-auto leading-relaxed">
          Sin ruido. Sin luz. Sin demandas. Solo estar.
        </p>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="bg-surface2/50 border border-white/5 text-text3 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest active:scale-90 transition-all hover:bg-surface2"
      >
        Tap para salir
      </button>
    </motion.div>
  );
};

export default Cave;
