// src/components/MoodTracker.jsx
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sun } from 'lucide-react';
// Import Chart.js components untuk menghindari error register
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MoodTracker = () => {
  const [moods, setMoods] = useLocalStorage('moods', []);
  const [currentMood, setCurrentMood] = useState(5);

  const addMood = () => {
    const newMood = { 
      mood: currentMood, 
      date: new Date().toLocaleDateString('id-ID', { weekday: 'short' }) 
    };
    setMoods([...moods, newMood]);
  };

  const data = {
    labels: moods.slice(-7).map(m => m.date),
    datasets: [{
      label: 'Tren Mood',
      data: moods.slice(-7).map(m => m.mood),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  return (
    <div className="card mood-container">
      <h3 className="stat-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Sun size={20} color="#eab308" />
        Bagaimana perasaanmu sekarang? (1-10)
      </h3>
      
      <div className="mood-selector">
        {[1,2,3,4,5,6,7,8,9,10].map(val => (
          <button
            key={val}
            onClick={() => setCurrentMood(val)}
            className={`mood-btn-circle ${currentMood === val ? 'active' : ''}`}
          >
            {val}
          </button>
        ))}
      </div>
      
      <button onClick={addMood} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
        Simpan Mood Hari Ini
      </button>

      {moods.length > 1 && (
        <div className="chart-container">
          <Line 
            data={data} 
            options={{ 
              maintainAspectRatio: false,
              scales: { y: { min: 0, max: 10 } }
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default MoodTracker;