// src/components/BreathingExercise.jsx
import { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

const BreathingExercise = () => {
  const [phase, setPhase] = useState('Mulai'); // 'Tarik', 'Tahan', 'Hembuskan'
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (isActive) {
      // Logika Teknik 4-7-8
      if (phase === 'Mulai' || (phase === 'Hembuskan' && seconds === 0)) {
        setPhase('Tarik');
        setSeconds(4);
      } else if (phase === 'Tarik' && seconds === 0) {
        setPhase('Tahan');
        setSeconds(7);
      } else if (phase === 'Tahan' && seconds === 0) {
        setPhase('Hembuskan');
        setSeconds(8);
      }

      timer = setInterval(() => {
        setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      setPhase('Mulai');
      setSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isActive, seconds, phase]);

  return (
    <div className="card" style={{ textAlign: 'center', marginTop: '24px' }}>
      <h3 className="stat-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Wind size={20} color="#3b82f6" /> Latihan Pernapasan 4-7-8
      </h3>
      
      <div style={{ margin: '40px 0', position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Lingkaran Animasi */}
        <div className={`breathing-circle ${phase.toLowerCase()}`} />
        
        {/* Teks Instruksi */}
        <div style={{ position: 'absolute', zIndex: 10 }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{phase}</div>
          {isActive && <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6' }}>{seconds}</div>}
        </div>
      </div>

      <button 
        onClick={() => setIsActive(!isActive)} 
        className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
        style={{ width: '100%', justifyContent: 'center', background: isActive ? '#ef4444' : '' }}
      >
        {isActive ? 'Berhenti' : 'Mulai Latihan'}
      </button>
      
      <p style={{ marginTop: '15px', fontSize: '0.85rem', color: '#64748b' }}>
        Tarik lewat hidung (4s), tahan (7s), buang lewat mulut (8s).
      </p>
    </div>
  );
};

export default BreathingExercise;