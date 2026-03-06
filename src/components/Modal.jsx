import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  message, // Tambahan untuk pesan singkat
  children, 
  confirmText = "Simpan", 
  type = "primary", // primary, danger, success, info
  showCancel = true 
}) => {
  
  // Efek keyboard ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  // Konfigurasi Tema berdasarkan Type
  const themes = {
    primary: { color: '#3b82f6', bg: '#eff6ff', Icon: Info },
    danger: { color: '#ef4444', bg: '#fee2e2', Icon: AlertTriangle },
    success: { color: '#10b981', bg: '#dcfce7', Icon: CheckCircle },
    info: { color: '#0ea5e9', bg: '#e0f2fe', Icon: Info },
    confirm: { color: '#f59e0b', bg: '#fef3c7', Icon: HelpCircle }
  };

  const activeTheme = themes[type] || themes.primary;

  return (
    <div 
      style={styles.overlay} 
      onClick={onClose}
    >
      <div 
        className="card" 
        style={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Close Pojok Atas */}
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} />
        </button>

        {/* Bagian Visual Ikon (Opsional, muncul jika type bukan primary) */}
        {type !== 'primary' && (
          <div style={{ ...styles.iconWrapper, backgroundColor: activeTheme.bg }}>
            <activeTheme.Icon color={activeTheme.color} size={32} />
          </div>
        )}

        {/* Header Modal */}
        <div style={{ textAlign: type === 'primary' ? 'left' : 'center', marginBottom: '15px' }}>
          <h3 style={styles.title}>{title}</h3>
          {message && <p style={styles.message}>{message}</p>}
        </div>

        {/* Konten Modal (Children) */}
        {children && (
          <div style={{ marginBottom: '25px', width: '100%' }}>
            {children}
          </div>
        )}

        {/* Footer / Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          {showCancel && (
            <button onClick={onClose} style={styles.btnSecondary}>
              Batal
            </button>
          )}
          <button 
            onClick={onSubmit} 
            className="btn" 
            style={{ 
              ...styles.btnPrimary, 
              backgroundColor: activeTheme.color,
              flex: showCancel ? 2 : 1 
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { transform: translateY(20px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
      `}</style>
    </div>
  );
};

// Styling Object
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px', animation: 'fadeIn 0.2s ease-out'
  },
  modalContent: {
    width: '100%', maxWidth: '400px', padding: '30px',
    position: 'relative', borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.3s ease-out',
    display: 'flex', flexDirection: 'column', alignItems: 'center'
  },
  closeBtn: {
    position: 'absolute', top: '15px', right: '15px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#94a3b8', padding: '5px'
  },
  iconWrapper: {
    width: '64px', height: '64px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '20px'
  },
  title: { margin: '0 0 10px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: '700' },
  message: { margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' },
  btnSecondary: {
    flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0',
    background: '#f8fafc', color: '#64748b', fontWeight: '600',
    cursor: 'pointer', fontSize: '0.9rem'
  },
  btnPrimary: {
    padding: '12px', borderRadius: '12px', border: 'none',
    color: 'white', fontWeight: '600', cursor: 'pointer',
    fontSize: '0.9rem', display: 'flex', justifyContent: 'center'
  }
};

export default Modal;