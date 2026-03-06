import { useState, useEffect, useCallback } from 'react';
import { Smile, ClipboardList, TrendingUp, AlertCircle, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

const Dashboard = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState({ averageMood: 0, totalTasks: 0 });
  const [priorityTasks, setPriorityTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMood, setSavingMood] = useState(false);

  const moodOptions = [
    { emoji: '😢', score: 2, label: 'Sedih' },
    { emoji: '😐', score: 5, label: 'Biasa' },
    { emoji: '😊', score: 8, label: 'Senang' },
    { emoji: '🤩', score: 10, label: 'Hebat' },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Ambil Statistik Mood & Total Tugas
      const statsRes = await fetch(`http://localhost:5000/api/dashboard-stats/${user.id}`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Ambil Semua Tugas & Filter untuk Prioritas (Urgent & Penting)
      const tasksRes = await fetch(`http://localhost:5000/api/tasks/${user.id}`);
      const tasksData = await tasksRes.json();
      
      const urgentTasks = tasksData
        .filter(t => t.category === 'urgent-important' && !t.is_completed)
        .slice(0, 5); // Ambil maksimal 5 tugas teratas
      
      setPriorityTasks(urgentTasks);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user.id, fetchDashboardData]);

  const handleMoodClick = async (score) => {
    setSavingMood(true);
    try {
      const response = await fetch('http://localhost:5000/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, score: score }),
      });
      if (response.ok) fetchDashboardData();
    } catch (error) {
      console.error("Gagal menyimpan mood:", error);
    } finally {
      setSavingMood(false);
    }
  };

  if (loading) return <div className="main">Memuat Dashboard...</div>;

  return (
    <div className="main">
      {/* Welcome & Mood Tracker */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
        color: 'white',
        padding: '25px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginBottom: '5px' }}>Selamat Datang, {user.username}!</h2>
        <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '20px' }}>
          Bagaimana perasaanmu hari ini?
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          background: 'rgba(255,255,255,0.15)', 
          padding: '15px', 
          borderRadius: '16px',
          gap: '10px'
        }}>
          {moodOptions.map((m) => (
            <button
              key={m.score}
              onClick={() => handleMoodClick(m.score)}
              disabled={savingMood}
              style={{
                flex: 1, background: 'none', border: 'none', fontSize: '1.8rem',
                cursor: savingMood ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white'
              }}
            >
              <span>{m.emoji}</span>
              <span style={{ fontSize: '0.65rem', marginTop: '5px', opacity: 0.8 }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="card stat-card" style={{ borderLeft: '5px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '5px' }}>Rata-rata Mood</p>
              <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.averageMood} / 10</h3>
            </div>
            <Heart size={32} color="#10b981" style={{ opacity: 0.2 }} />
          </div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '5px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '5px' }}>Tugas Aktif</p>
              <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stats.totalTasks}</h3>
            </div>
            <ClipboardList size={32} color="#3b82f6" style={{ opacity: 0.2 }} />
          </div>
        </div>
      </div>

      {/* Prioritas Utama (Urgent & Penting) */}
      <div className="card" style={{ marginTop: '20px', borderLeft: '6px solid #ef4444' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.1rem', color: '#ef4444' }}>
            <AlertCircle size={20} /> Prioritas Utama
          </h3>
          <button 
            onClick={() => setActiveTab('matrix')} 
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            Matriks <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {priorityTasks.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>
              Tidak ada tugas mendesak hari ini. 🎉
            </p>
          ) : (
            priorityTasks.map(task => (
              <div key={task.id} style={{ 
                padding: '12px', background: '#fff5f5', borderRadius: '10px', 
                border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '10px' 
              }}>
                <CheckCircle2 size={16} color="#ef4444" style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: '500' }}>{task.title}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Analisis Personal */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', fontSize: '1.1rem' }}>
          <TrendingUp size={20} color="#3b82f6" /> Analisis Personal
        </h3>
        {stats.averageMood < 5 && stats.averageMood > 0 ? (
          <div style={{ padding: '15px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fecdd3', color: '#be123c' }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              Mood kamu sedang rendah. Coba ambil istirahat sejenak sebelum mengerjakan <strong>{stats.totalTasks} tugas</strong> yang ada.
            </p>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
            Kondisi mentalmu stabil (Skor: {stats.averageMood}). Fokuslah menyelesaikan prioritas di atas satu per satu.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;