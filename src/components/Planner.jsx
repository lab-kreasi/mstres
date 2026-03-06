import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from './Modal'; // Import komponen modal yang baru

const Planner = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Ambil data tugas dari Database saat pertama kali buka
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${user.id}`);
      const data = await response.json();
      
      // Sesuaikan format data dari DB ke format FullCalendar
      const formattedEvents = data.map(task => ({
        id: task.id,
        title: task.title,
        start: task.created_at, // Sesuaikan dengan kolom tanggal di DB kamu
        color: '#3b82f6'
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Gagal mengambil data tugas:", err);
    }
  };

  useEffect(() => {
    if (user?.id) fetchTasks();
  }, [user.id]);

  // 2. Fungsi saat tanggal diklik (Buka Modal)
  const handleDateClick = (arg) => {
    setSelectedDateStr(arg.dateStr);
    setIsModalOpen(true);
  };

  // 3. Fungsi Simpan Tugas ke Database
  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: newTaskTitle,
          category: 'urgent-important', // Default category untuk Matrix
          date: selectedDateStr
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewTaskTitle('');
        fetchTasks(); // Refresh kalender agar tugas baru muncul
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
            locale="id" // Menggunakan bahasa Indonesia jika tersedia
          />
        </div>
      </div>

      {/* INTEGRASI MODAL */}
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