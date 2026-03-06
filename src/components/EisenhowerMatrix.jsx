import { useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, X, ChevronRight, Circle, CheckCircle2, AlertTriangle } from 'lucide-react';

const quadrants = [
  { id: 'urgent-important', title: 'Urgent & Penting', color: '#ef4444' },
  { id: 'important-not-urgent', title: 'Penting, Tak Urgent', color: '#10b981' },
  { id: 'urgent-not-important', title: 'Urgent, Tak Penting', color: '#f59e0b' },
  { id: 'not-urgent-not-important', title: 'Tak Urgent & Tak Penting', color: '#64748b' }
];

const EisenhowerMatrix = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Kustom
  const [modal, setModal] = useState({ isOpen: false, taskId: null });

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${user.id}`);
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      // Pastikan data yang diterima adalah array
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat Matrix:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) fetchTasks();
  }, [user.id, fetchTasks]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: newTask.trim(),
          category: 'urgent-important', // Default quadrant
          date: new Date().toISOString().split('T')[0]
        }),
      });
      
      if (response.ok) {
        const addedTask = await response.json();
        // Update state secara lokal agar langsung muncul tanpa reload full
        setTasks(prev => [...prev, addedTask]);
        setNewTask('');
      }
    } catch (err) {
      console.error("Gagal menambah tugas");
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        ));
      }
    } catch (err) {
      console.error("Gagal update status");
    }
  };

  const moveTask = async (taskId, currentCategory) => {
    const categories = quadrants.map(q => q.id);
    const currentIndex = categories.indexOf(currentCategory);
    const nextCategory = categories[(currentIndex + 1) % 4];

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: nextCategory }),
      });
      if (response.ok) fetchTasks();
    } catch (err) {
      console.error("Gagal memindahkan tugas");
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${modal.taskId}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== modal.taskId));
      }
    } catch (err) {
      console.error("Gagal menghapus");
    } finally {
      setModal({ isOpen: false, taskId: null });
    }
  };

  if (loading) return <div className="main">Memuat prioritas...</div>;

  return (
    <div className="main">
      {/* Modal Popup Kustom */}
      {modal.isOpen && (
        <div style={modalOverlayStyle}>
          <div className="card" style={modalCardStyle}>
            <AlertTriangle size={40} color="#ef4444" />
            <h3>Hapus Tugas?</h3>
            <p>Tugas yang dihapus tidak dapat dikembalikan.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%' }}>
              <button className="btn" style={{ flex: 1, background: '#f1f5f9' }} onClick={() => setModal({ isOpen: false, taskId: null })}>Batal</button>
              <button className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }} onClick={confirmDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <ArrowUpRight size={28} color="#3b82f6" /> Eisenhower Matrix
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            className="card" 
            style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
            placeholder="Tulis tugas mendesak hari ini..."
          />
          <button onClick={addTask} className="btn btn-primary">Tambah</button>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {quadrants.map(q => (
          <div key={q.id} className="card" style={{ borderTop: `6px solid ${q.color}`, minHeight: '200px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: q.color, fontWeight: '700' }}>{q.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.filter(t => t.category === q.id).map(task => (
                <div key={task.id} className="card" style={{ 
                  padding: '12px', 
                  background: task.is_completed ? '#f1f5f9' : '#ffffff', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  opacity: task.is_completed ? 0.6 : 1,
                  border: '1px solid #f1f5f9'
                }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer' }}
                    onClick={() => toggleTask(task.id)}
                  >
                    {task.is_completed ? <CheckCircle2 size={18} color="#10b981" /> : <Circle size={18} color="#cbd5e1" />}
                    <span style={{ 
                      fontSize: '0.9rem', 
                      color: task.is_completed ? '#94a3b8' : '#334155',
                      textDecoration: task.is_completed ? 'line-through' : 'none' 
                    }}>
                      {task.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => moveTask(task.id, task.category)} style={actionBtnStyle}>
                      <ChevronRight size={18} />
                    </button>
                    <button onClick={() => setModal({ isOpen: true, taskId: task.id })} style={{ ...actionBtnStyle, color: '#ef4444' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles
const actionBtnStyle = { border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalCardStyle = { width: '90%', maxWidth: '350px', padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' };

export default EisenhowerMatrix;