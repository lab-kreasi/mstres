import { useState, useEffect } from 'react';
import { Home, Calendar, Heart, LayoutGrid, Brain, LogOut } from 'lucide-react';

// Import Komponen Fitur
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import WellnessHub from './components/WellnessHub';
import BrainDump from './components/BrainDump';

// Import Komponen Pendukung
import Auth from './components/Auth.jsx';
import Modal from './components/Modal'; // WAJIB DIIMPORT

const tabs = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'planner', icon: Calendar, label: 'Planner' },
  { id: 'eisenhower', icon: LayoutGrid, label: 'Matrix' },
  { id: 'braindump', icon: Brain, label: 'Journal' },
  { id: 'wellness', icon: Heart, label: 'Wellness' }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tambahkan state loading
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1. Cek Auth saat pertama kali muat
  useEffect(() => {
    const savedUser = localStorage.getItem('logged-in-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('logged-in-user');
      }
    }
    setLoading(false); // Selesai mengecek, baru tampilkan UI
  }, []);

  // 2. Efek scroll ke atas otomatis saat ganti tab
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('logged-in-user', JSON.stringify(userData));
  };

  const executeLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('logged-in-user'); // Samakan kunci dengan handleLogin
    setUser(null);
    setShowLogoutModal(false);
    // window.location.reload(); // Opsional, setUser(null) sudah cukup untuk reset UI
  };

  const renderContent = () => {
    // Gunakan switch atau object mapping untuk keamanan
    const content = {
      dashboard: <Dashboard user={user} />,
      planner: <Planner user={user} />,
      eisenhower: <EisenhowerMatrix user={user} />,
      braindump: <BrainDump user={user} />,
      wellness: <WellnessHub user={user} />
    };
    return content[activeTab] || <Dashboard user={user} />;
  };

  // --- STATE LOADING: Mencegah UI "Glitched" ---
  if (loading) {
    return <div className="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Memuat Aplikasi...</div>;
  }

  // --- GATEKEEPER: JIKA BELUM LOGIN ---
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // --- APLIKASI UTAMA: JIKA SUDAH LOGIN ---
  return (
    <div className="container">
      {/* Modal diletakkan di luar struktur z-index yang rumit */}
      <Modal 
        isOpen={showLogoutModal}
        type="confirm"
        title="Keluar Aplikasi"
        message="Apakah kamu yakin ingin mengakhiri sesi ini?"
        confirmText="Keluar"
        onClose={() => setShowLogoutModal(false)}
        onSubmit={executeLogout}
      />

      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Stress Planner</h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            Halo, <strong>{user.username}</strong>!
          </p>
        </div>
        <button 
          onClick={() => setShowLogoutModal(true)} 
          className="btn-icon"
          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="main" style={{ paddingBottom: '100px' }}>
        {renderContent()}
      </main>

      <nav className="nav">
        <div className="nav-grid">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="nav-icon" size={24} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;