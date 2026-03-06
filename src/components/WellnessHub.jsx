// src/components/WellnessHub.jsx
import { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Wind } from 'lucide-react';
import BreathingExercise from './BreathingExercise';

const WellnessHub = () => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(time - 1), 1000);
    } else if (time === 0) {
      const nextMode = !isBreak;
      setIsBreak(nextMode);
      setTime(nextMode ? 5 * 60 : 25 * 60);
      setIsActive(false);
      // Menggunakan notifikasi yang lebih soft jika memungkinkan
      alert(nextMode ? "Waktunya istirahat! 🌿" : "Kembali fokus! 🎯");
    }
    return () => clearInterval(interval);
  }, [isActive, time, isBreak]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Bagian 1: Pomodoro Timer */}
      <div className="card" style={{ 
        textAlign: 'center', 
        background: isBreak ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'white',
        transition: 'all 0.5s ease',
        border: isBreak ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Wind size={32} color={isBreak ? '#10b981' : '#8b5cf6'} />
          <h2 style={{ margin: 0 }}>{isBreak ? 'Istirahat Sejenak' : 'Fokus Belajar'}</h2>
        </div>

        <div style={{ fontSize: '4.5rem', fontWeight: '800', fontFamily: 'monospace', margin: '15px 0', color: '#1e293b' }}>
          {formatTime(time)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button 
            onClick={() => setIsActive(!isActive)} 
            className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
            style={{ padding: '15px 40px', minWidth: '140px', display: 'flex', justifyContent: 'center' }}
          >
            {isActive ? <><Pause size={24} style={{marginRight: '8px'}}/> Pause</> : <><Play size={24} style={{marginRight: '8px'}}/> Start</>}
          </button>
          
          <button 
            onClick={() => { setIsActive(false); setTime(25*60); setIsBreak(false); }} 
            className="btn" 
            style={{ background: '#f1f5f9', color: '#64748b' }}
            title="Reset Timer"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>
      
      {/* Bagian 2: Tips Istirahat (Hanya muncul saat break) */}
      {isBreak && (
        <div className="card" style={{ borderLeft: '6px solid #10b981', animation: 'fadeIn 0.5s ease' }}>
          <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💡</span> Tips Istirahat:
          </h3>
          <ul style={{ color: '#475569', paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Minum segelas air putih hangat</li>
            <li>Lihat ke luar jendela (aturan 20-20-20)</li>
            <li>Regangkan otot bahu dan leher</li>
          </ul>
        </div>
      )}

      {/* Bagian 3: Quick Breathing Exercise */}
      <BreathingExercise />

      {/* Spacer untuk memastikan navigasi bawah tidak menutupi konten terakhir */}
      <div style={{ height: '20px' }}></div>
    </div>
  );
};

export default WellnessHub;