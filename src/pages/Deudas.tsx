import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash2, CheckCircle, History, AlertCircle, Calendar, DollarSign, X } from 'lucide-react';

interface Deuda {
  id: number;
  acreedor: string;
  monto: string;
  fecha: string;
  pagada: boolean;
}

const Deudas: React.FC = () => {
  const { t } = useApp();
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newDeuda, setNewDeuda] = useState({ acreedor: '', monto: '', fecha: '' });

  useEffect(() => {
    const saved = localStorage.getItem('cfg_deudas');
    if (saved) setDeudas(JSON.parse(saved));
  }, []);

  const saveDeudas = (list: Deuda[]) => {
    setDeudas(list);
    localStorage.setItem('cfg_deudas', JSON.stringify(list));
  };

  const addDeuda = () => {
    if (!newDeuda.acreedor) return;
    const item: Deuda = {
      id: Date.now(),
      acreedor: newDeuda.acreedor,
      monto: newDeuda.monto || '—',
      fecha: newDeuda.fecha || '',
      pagada: false
    };
    saveDeudas([item, ...deudas]);
    setNewDeuda({ acreedor: '', monto: '', fecha: '' });
    setIsFormOpen(false);
  };

  const deleteDeuda = (id: number) => {
    saveDeudas(deudas.filter(d => d.id !== id));
  };

  const markAsPaid = (id: number) => {
    saveDeudas(deudas.map(d => d.id === id ? { ...d, pagada: true } : d));
  };

  const total = deudas
    .filter(d => !d.pagada)
    .reduce((acc, d) => {
      const val = parseFloat(d.monto.replace(/[^0-9.]/g, ''));
      return isNaN(val) ? acc : acc + val;
    }, 0);

  return (
    <div className="space-y-6 pb-12">
      <section className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-amber/10 p-3 rounded-2xl">
            <CreditCard className="text-amber" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{t.deudasLbl}</h1>
            <p className="text-xs font-bold text-text3 tracking-widest uppercase">Gestión Financiera</p>
          </div>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-amber text-bg p-3 rounded-full hover:scale-110 active:scale-90 transition-transform shadow-lg shadow-amber/20"
        >
          <Plus size={24} />
        </button>
      </section>

      {/* Total Card */}
      <section className="bg-surface2 border border-border p-6 rounded-[32px] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-text3 uppercase tracking-widest mb-1">Total por procesar</p>
          <div className="text-3xl font-black text-amber">${total.toFixed(2)}</div>
        </div>
        <div className="bg-amber/10 p-4 rounded-2xl">
          <AlertCircle className="text-amber" size={24} />
        </div>
      </section>

      {/* List of Deudas */}
      <div className="space-y-3">
        {deudas.filter(d => !d.pagada).map((d) => (
          <motion.div 
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border p-5 rounded-3xl flex items-center gap-4 group"
          >
            <div className="flex-1">
              <div className="font-bold text-sm text-text2 uppercase tracking-wide">{d.acreedor}</div>
              <div className="text-xl font-black text-amber">{d.monto}</div>
              {d.fecha && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-text3 font-bold">
                  <Calendar size={12} />
                  <span>{d.fecha}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => markAsPaid(d.id)}
                className="w-10 h-10 bg-green/10 text-green rounded-xl flex items-center justify-center hover:bg-green/20 transition-colors"
              >
                <CheckCircle size={20} />
              </button>
              <button 
                onClick={() => deleteDeuda(d.id)}
                className="w-10 h-10 bg-red/10 text-red rounded-xl flex items-center justify-center hover:bg-red/20 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="bg-surface w-full max-w-md rounded-[40px] border border-border p-8 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight text-amber">Nuevo Compromiso</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-text3 hover:text-text transition-colors"><X size={24} /></button>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text3 uppercase tracking-widest px-1">Acreedor / Concepto</label>
                  <input 
                    type="text" value={newDeuda.acreedor}
                    onChange={e => setNewDeuda({...newDeuda, acreedor: e.target.value})}
                    placeholder="Ej: Banco, Alquiler..."
                    className="w-full bg-bg border border-border p-4 rounded-2xl outline-none focus:border-amber/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text3 uppercase tracking-widest px-1">Monto</label>
                  <input 
                    type="text" value={newDeuda.monto}
                    onChange={e => setNewDeuda({...newDeuda, monto: e.target.value})}
                    placeholder="Ej: $1,200"
                    className="w-full bg-bg border border-border p-4 rounded-2xl outline-none focus:border-amber/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text3 uppercase tracking-widest px-1">Fecha Límite</label>
                  <input 
                    type="date" value={newDeuda.fecha}
                    onChange={e => setNewDeuda({...newDeuda, fecha: e.target.value})}
                    className="w-full bg-bg border border-border p-4 rounded-2xl outline-none focus:border-amber/50 transition-all text-text"
                  />
                </div>
                <button 
                  onClick={addDeuda}
                  className="w-full bg-amber text-bg p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform mt-4 shadow-xl shadow-amber/20"
                >
                  Registrar Compromiso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Deudas;
