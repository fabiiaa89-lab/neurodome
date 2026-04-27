import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Check, X, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SCANNER_QUESTIONS = [
  { text:'Cierra los ojos. Aprieta las manos.\n¿Sientes tensión o rigidez muscular?', key:'tension' },
  { text:'¿Sientes que tu corazón late rápido\no muy fuerte?', key:'taquicardia' },
  { text:'¿El ruido de afuera te molesta\no te duele?', key:'hipersonido' },
  { text:'¿Tienes la boca seca o el\nestómago revuelto?', key:'boca_estomago' },
  { text:'¿Sientes que no sabes bien dónde\ntermina tu cuerpo, o que flotas?', key:'disociacion' },
  { text:'¿Tienes energía para hacer\nUNA tarea simple como beber agua?', key:'energia_minima' },
  { text:'¿La luz o las pantallas te molestan\nmás de lo normal ahora?', key:'hiperluz' }
];

const BodyScanner: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (val: boolean) => {
    const newAnswers = { ...answers, [SCANNER_QUESTIONS[idx].key]: val };
    setAnswers(newAnswers);
    
    if (idx < SCANNER_QUESTIONS.length - 1) {
      setIdx(idx + 1);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setIdx(0);
    setAnswers({});
    setShowResult(false);
  };

  const getResult = () => {
    let score = 0;
    if (answers.tension) score+=2; if (answers.taquicardia) score+=2; if (answers.hipersonido) score+=2;
    if (answers.disociacion) score+=3; if (answers.boca_estomago) score+=1;
    if (!answers.energia_minima) score+=3; if (answers.hiperluz) score+=1;

    if (score >= 10) return { nivel: 1, label: t.n1title, color: 'text-red', bg: 'bg-red/10', border: 'border-red/20' };
    if (score >= 7) return { nivel: 2, label: t.n2title, color: 'text-amber', bg: 'bg-amber/10', border: 'border-amber/20' };
    if (score >= 4) return { nivel: 3, label: t.n3title, color: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/20' };
    return { nivel: 4, label: t.n4title, color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' };
  };

  const result = getResult();

  return (
    <div className="space-y-6 pb-12">
      <section className="flex items-center gap-4 mb-8">
        <div className="bg-teal/10 p-3 rounded-2xl">
          <Scan className="text-teal" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">{t.scannerLbl}</h1>
          <p className="text-xs font-bold text-text3 tracking-widest uppercase">Calibración Interoceptiva</p>
        </div>
      </section>

      {!showResult ? (
        <div className="space-y-8">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {SCANNER_QUESTIONS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < idx ? 'w-4 bg-teal' : i === idx ? 'w-8 bg-teal animate-pulse' : 'w-2 bg-surface2'
                }`} 
              />
            ))}
          </div>

          {/* Question Card */}
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface border border-border p-8 rounded-[40px] min-h-[300px] flex flex-col justify-center text-center shadow-2xl"
          >
            <h2 className="text-xl font-bold leading-relaxed whitespace-pre-line">
              {SCANNER_QUESTIONS[idx].text}
            </h2>
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleAnswer(true)}
              className="bg-surface border border-teal/30 p-6 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all group hover:bg-teal/5"
            >
              <div className="bg-teal/10 p-3 rounded-full group-hover:bg-teal/20 transition-colors">
                <Check className="text-teal" size={32} />
              </div>
              <span className="font-black text-teal tracking-widest uppercase text-sm">Sí</span>
            </button>
            <button 
              onClick={() => handleAnswer(false)}
              className="bg-surface border border-red/30 p-6 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all group hover:bg-red/5"
            >
              <div className="bg-red/10 p-3 rounded-full group-hover:bg-red/20 transition-colors">
                <X className="text-red" size={32} />
              </div>
              <span className="font-black text-red tracking-widest uppercase text-sm">No</span>
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className={`${result.bg} ${result.border} border p-8 rounded-[40px] text-center space-y-4`}>
            <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${result.color}`}>Resultado del Escáner</div>
            <div className={`text-3xl font-black leading-tight ${result.color}`}>
              Nivel {result.nivel}<br/>{result.label}
            </div>
            <p className="text-text2 text-sm leading-relaxed px-4">
              Basado en tus señales corporales, este es el protocolo de regulación sugerido para ti ahora mismo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => navigate(`/l${result.nivel}`)}
              className="bg-teal text-bg p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              <span>Ir al Protocolo</span>
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={reset}
              className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-text3 active:scale-95 transition-transform"
            >
              <RotateCcw size={20} />
              <span>Repetir Escáner</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BodyScanner;
