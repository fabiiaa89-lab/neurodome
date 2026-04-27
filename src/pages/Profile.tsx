import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Activity, ShieldAlert, Heart, Clock, ChevronDown, Save, Image as ImageIcon, Briefcase, Star, Info } from 'lucide-react';

const Profile: React.FC = () => {
  const { t, userData, setUserData } = useApp();
  const [openSection, setOpenSection] = useState<string | null>('identity');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const handleChange = (field: string, value: string) => {
    setUserData({ [field]: value });
    localStorage.setItem(`cfg_${field}`, value); // Simulación de persistencia individual
  };

  const sections = [
    {
      id: 'identity',
      icon: User,
      title: 'Mi Identidad',
      color: 'text-teal',
      fields: [
        { label: 'Nombre Completo', key: 'nombre', placeholder: 'Ej: José Aponte' },
        { label: 'Documento ID', key: 'documento', placeholder: 'DNI / Pasaporte' },
      ]
    },
    {
      id: 'emergency',
      icon: ShieldAlert,
      title: 'Contacto de Emergencia',
      color: 'text-red',
      fields: [
        { label: 'Nombre del Contacto', key: 'contactoNombre', placeholder: 'Ej: María García' },
        { label: 'Teléfono / WhatsApp', key: 'contactoTelefono', placeholder: 'Ej: 51987654321' },
      ]
    },
    {
      id: 'health',
      icon: Activity,
      title: 'Salud y Médicos',
      color: 'text-purple',
      fields: [
        { label: 'Tipo de Sangre', key: 'sangre', placeholder: 'Ej: A+' },
        { label: 'Alergias', key: 'alergias', placeholder: 'Separadas por comas' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <section className="flex items-center gap-4 mb-8">
        <div className="bg-purple/10 p-3 rounded-2xl">
          <User className="text-purple" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Mi Perfil</h1>
          <p className="text-xs font-bold text-text3 tracking-widest uppercase">Gestión de Datos</p>
        </div>
      </section>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="bg-surface border border-border rounded-3xl overflow-hidden">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-surface2 transition-colors"
            >
              <div className="flex items-center gap-4">
                <section.icon className={section.color} size={24} />
                <span className="font-bold text-sm uppercase tracking-widest">{section.title}</span>
              </div>
              <ChevronDown 
                size={20} 
                className={`text-text3 transition-transform duration-300 ${openSection === section.id ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <AnimatePresence>
              {openSection === section.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="p-6 space-y-4 bg-surface2/30">
                    {section.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-[10px] font-bold text-text3 uppercase tracking-[0.2em] px-1">{field.label}</label>
                        <input 
                          type="text" 
                          value={(userData as any)[field.key] || ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-surface border border-border focus:border-teal/50 p-4 rounded-2xl outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <button 
        className="w-full bg-teal text-bg p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-transform mt-8 shadow-xl shadow-teal/20"
        onClick={() => {/* logic logic */}}
      >
        <Save size={20} />
        <span>Guardar Cambios</span>
      </button>
    </div>
  );
};

export default Profile;
