import React from 'react';

export function SetupScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Configuración Inicial</h2>
      <button onClick={onComplete} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Finalizar Setup
      </button>
    </div>
  );
}
