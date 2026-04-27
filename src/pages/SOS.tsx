import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, MapPin, Activity, ShieldAlert, Heart, User, Clock, CheckCircle2 } from 'lucide-react';

const SOS: React.FC = () => {
  const { t, userData } = useApp();

  const handleCall = () => {
    if (userData.contactoTelefono) {
      window.location.href = `tel:${userData.contactoTelefono}`;
    }
  };

  const handleWhatsApp = () => {
    if (userData.contactoTelefono) {
      const msg = encodeURIComponent("Tengo una crisis, necesito tu contención y sentirme a salvo. Por favor ven o llámame.");
      window.open(`https://wa.me/${userData.contactoTelefono}?text=${msg}`, '_blank');
    }
  };

  const rules = [
    t.sosRule1,
    t.sosRule2,
    t.sosRule3,
    t.sosRule4
  ];

  const instructions = [
    t.sosInst1,
    t.sosInst2,
    t.sosInst3,
    t.sosInst4,
    t.sosInst5
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header SOS */}
      <section className="text-center bg-red/10 border border-red/20 p-6 rounded-3xl">
        <ShieldAlert className="text-red mx-auto mb-3" size={48} />
        <h1 className="text-2xl font-black text-red uppercase tracking-tight">{t.sosBannerMain}</h1>
        <p className="text-sm text-text2 mt-1">{t.sosHdrSub}</p>
      </section>

      {/* Basic Rules Banner */}
      <section className="grid grid-cols-1 gap-2">
        {rules.map((rule, i) => (
          <div key={i} className="bg-surface2 border border-border p-4 rounded-xl flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider leading-tight">{rule}</span>
          </div>
        ))}
      </section>

      {/* Main Buttons */}
      <section className="grid grid-cols-1 gap-3">
        <button 
          onClick={handleCall}
          className="bg-red text-white p-5 rounded-2xl flex items-center justify-center gap-3 font-bold active:scale-95 transition-transform"
        >
          <Phone size={24} />
          <span>{t.sosCallBtn}</span>
        </button>
        <button 
          onClick={handleWhatsApp}
          className="bg-green text-white p-5 rounded-2xl flex items-center justify-center gap-3 font-bold active:scale-95 transition-transform"
        >
          <MessageSquare size={24} />
          <span>{t.sosWaBtn}</span>
        </button>
      </section>

      {/* Medical ID Card */}
      <section className="bg-surface border border-border rounded-3xl overflow-hidden">
        <div className="bg-surface2 p-4 border-b border-border flex items-center gap-3">
          <User className="text-teal" size={20} />
          <h2 className="font-bold text-sm uppercase tracking-widest">{t.sosIdHdr}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-text3 uppercase tracking-widest">{t.sosNombreLbl}</label>
            <div className="text-lg font-black text-teal uppercase">{userData.nombre || '—'}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-text3 uppercase tracking-widest">{t.sosDocLbl}</label>
              <div className="font-bold">{(userData as any).documento || '—'}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text3 uppercase tracking-widest">{t.sosSangreLbl}</label>
              <div className="font-bold text-red">{(userData as any).sangre || '—'}</div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-text3 uppercase tracking-widest">{t.sosDireccionLbl}</label>
            <div className="text-sm font-medium">{(userData as any).direccion || '—'}</div>
          </div>
        </div>
      </section>

      {/* Handling Instructions */}
      <section className="bg-surface border border-border rounded-3xl overflow-hidden">
        <div className="bg-surface2 p-4 border-b border-border flex items-center gap-3">
          <CheckCircle2 className="text-amber" size={20} />
          <h2 className="font-bold text-sm uppercase tracking-widest">{t.sosInstHdr}</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            {instructions.map((inst, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="bg-amber/20 text-amber text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                <span className="text-sm text-text2 leading-relaxed">{inst}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default SOS;
