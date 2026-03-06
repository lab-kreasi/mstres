import { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn, Phone } from 'lucide-react';
import Modal from './Modal'; // Pastikan path import sesuai

const Auth = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk mengontrol Modal Sukses Register
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    phone_number: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegister ? '/api/register' : '/api/login';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem');
      }

      if (isRegister) {
        // Ganti alert() dengan membuka Modal
        setIsSuccessModalOpen(true);
      } else {
        if (data.token) localStorage.setItem('token', data.token);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi yang dipanggil saat tombol di Modal Sukses diklik
  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    setIsRegister(false);
    setFormData({ phone_number: '', username: '', password: '' });
  };

  return (
    <div className="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      
      {/* MODAL REGISTRASI BERHASIL */}
      <Modal 
        isOpen={isSuccessModalOpen}
        type="success"
        title="Registrasi Berhasil!"
        message="Akun kamu telah dibuat. Silakan masuk menggunakan nomor HP dan password terdaftar."
        confirmText="Masuk Sekarang"
        showCancel={false} // Sembunyikan tombol batal agar user fokus login
        onClose={() => setIsSuccessModalOpen(false)}
        onSubmit={handleSuccessConfirm}
      />

      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: isRegister ? '#f0fdf4' : '#eff6ff', 
            width: '60px', height: '60px', borderRadius: '20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' 
          }}>
            {isRegister ? <UserPlus color="#22c55e" size={32} /> : <LogIn color="#3b82f6" size={32} />}
          </div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>
            {isRegister ? 'Daftar Akun' : 'Masuk Aplikasi'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px' }}>
            {isRegister ? 'Gunakan nomor HP aktifmu' : 'Masuk dengan nomor HP terdaftar'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '10px', 
            fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #fee2e2'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
            <input
              type="tel"
              name="phone_number"
              placeholder="Nomor HP (Contoh: 0812...)"
              required
              value={formData.phone_number}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {isRegister && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
              <input
                type="text"
                name="username"
                placeholder="Nama Lengkap"
                required={isRegister}
                value={formData.username}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ 
              width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px',
              background: isRegister ? '#22c55e' : '#3b82f6', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Memproses...' : (isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi')}
            {!loading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: '#64748b' }}>
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} {' '}
          <span 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: '#3b82f6', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Login di sini' : 'Daftar gratis'}
          </span>
        </p>
      </div>
    </div>
  );
};

// Reusable input style
const inputStyle = {
  width: '100%', 
  padding: '12px 12px 12px 40px', 
  borderRadius: '12px', 
  border: '1px solid #e2e8f0',
  fontSize: '1rem',
  outline: 'none'
};

export default Auth;