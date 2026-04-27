import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Headphones, Play, Square, Info, Brain, Clock } from 'lucide-react';

const TONES = [
  { freq: 40, beat: 40, name: 'Gamma — Foco suave', color: '#9060d0', duration: '10 min' },
  { freq: 10, beat: 10, name: 'Alpha — Calma activa', color: '#3090d0', duration: '15 min' },
  { freq: 7.83, beat: 7.83, name: 'Schumann — Tierra', color: '#30a060', duration: '20 min' },
  { freq: 4, beat: 4, name: 'Theta — Sueño', color: '#304080', duration: '30 min' },
  { freq: 2, beat: 2, name: 'Delta — Sueño profundo', color: '#202860', duration: '45 min' },
];

const Isochronic: React.FC = () => {
  const { t } = useApp();
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null>(null);

  const stop = () => {
    if (nodesRef.current) {
      nodesRef.current.osc.stop();
      nodesRef.current.lfo.stop();
      nodesRef.current.gain.disconnect();
      nodesRef.current = null;
    }
    setPlayingIdx(null);
  };

  const play = (idx: number) => {
    if (playingIdx === idx) {
      stop();
      return;
    }
    stop();

    const tone = TONES[idx];
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 200;

    const amGain = ctx.createGain();
    amGain.gain.value = 1;
    osc.connect(amGain);
    amGain.connect(master);

    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = tone.beat;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(amGain.gain);

    osc.start();
    lfo.start();
    nodesRef.current = { osc, lfo, gain: master };
    setPlayingIdx(idx);
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <section className="flex items-center gap-4 mb-8">
        <div className="bg-purple/10 p-3 rounded-2xl">
          <Headphones className="text-purple" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Tonos ISO</h1>
          <p className="text-xs font-bold text-text3 tracking-widest uppercase">Regulación Neurológica</p>
        </div>
      </section>

      <section className="bg-surface border border-border p-6 rounded-[32px] space-y-3">
        <div className="flex items-center gap-2 text-purple">
          <Info size={16} />
          <h3 className="font-bold text-[10px] uppercase tracking-widest">¿Qué son?</h3>
        </div>
        <p className="text-xs text-text2 leading-relaxed italic">
          Pulsos rítmicos que sincronizan las ondas cerebrales para reducir la hiperactivación del sistema nervioso.
        </p>
      </section>

      <div className="space-y-3 mt-8">
        {TONES.map((tone, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => play(i)}
            className={`w-full bg-surface border border-border p-5 rounded-3xl flex items-center justify-between transition-all ${
              playingIdx === i ? 'border-purple shadow-xl shadow-purple/10 bg-purple/5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs"
                style={{ backgroundColor: `${tone.color}20`, color: tone.color }}
              >
                {tone.freq}Hz
              </div>
              <div className="text-left">
                <div className="font-bold text-sm tracking-tight">{tone.name}</div>
                <div className="text-[10px] text-text3 font-bold uppercase tracking-widest">{tone.duration}</div>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              playingIdx === i ? 'bg-purple text-white' : 'bg-surface2 text-text3'
            }`}>
              {playingIdx === i ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Isochronic;
