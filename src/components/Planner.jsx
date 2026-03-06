import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './Modal'; 

const Planner = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [loading, setLoading] = useState(false);

  // KONFIGURASI URL DINAMIS
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 1. Ambil data tugas dari Database
  const fetchTasks = async () => {
    try {
      // PERBAIKAN: Menggunakan API_URL
      const response = await fetch(`${API_URL}/api/tasks/${user.id}`);
      const data = await response.json();
      
      const formattedEvents = Array.isArray(data) ? data.map(task => ({
        id: task.id,
        title: task.title,
        start: task.start || task.created_at, 
        color: '#3b82f6'
      })) : [];
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchTasks();
  }, [user.id]);

  const handleDateClick = (arg) => {
    setSelectedDateStr(arg.dateStr);
    setIsModalOpen(true);
  };

  // 3. Fungsi Simpan Tugas ke Database
  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setLoading(true);
    try {
      // PERBAIKAN: Menggunakan API_URL
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: newTaskTitle,
          category: 'urgent-important', 
          date: selectedDateStr
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewTaskTitle('');
        fetchTasks(); 
      }
    } catch (err) {
      alert("Gagal menyimpan rencana");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="card">
        <h2 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Kalender Belajar</h2>
        <div className="calendar-container" style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            headerToolbar={{ left: 'prev,next', center: 'title', right: 'today' }}
            height="auto"
            eventBackgroundColor="#3b82f6"
            eventBorderColor="transparent"
            locale="id" 
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        title="Buat Rencana Baru"
        confirmText={loading ? "Menyimpan..." : "Tambahkan"}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Rencana untuk tanggal: <strong>{selectedDateStr}</strong>
          </p>
          <input
            type="text"
            placeholder="Contoh: Kerjakan Tugas Matematika Hal. 10"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '1rem'
            }}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

export default Planner;