import { useState, useEffect, useCallback } from 'react';
import { Brain, Trash2, Save, Sparkles, Heart, Loader2 } from 'lucide-react';

const BrainDump = ({ user }) => {
  const [note, setNote] = useState('');
  const [type, setType] = useState('dump'); // 'dump' atau 'gratitude'
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- DEFINISIKAN SEKALI DI SINI ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 1. Ambil Riwayat Jurnal dari Database
  const fetchJournals = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/journals/${user.id}`);
      const data = await response.json();
      setSavedNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil riwayat jurnal:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, API_URL]);

  useEffect(() => {
    if (user?.id) fetchJournals();
  }, [user.id, fetchJournals]);

  // 2. Fungsi Simpan
  const handleSave = async () => {
    if (!note.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/journals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          content: note,
          entry_type: type
        }),
      });

      if (response.ok) {
        setNote(''); 
        fetchJournals(); 
      }
    } catch (err) {
      console.error("Gagal menyimpan jurnal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Fungsi Hapus
  const deleteNote = async (id) => {
    if (!window.confirm("Hapus catatan ini?")) return;
    try {
      const response = await fetch(`${API_URL}/api/journals/${id}`, { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        setSavedNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
    }
  };

  if (loading) return <div className="main">Memuat jurnal...</div>;

  return (
    <div className="main" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Input Area */}
      <div className="card" style={{ 
        borderTop: type === 'gratitude' ? '6px solid #ec4899' : '6px solid #8b5cf6',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {type === 'dump' ? <Brain size={28} color="#8b5cf6" /> : <Heart size={28} color="#ec4899" />}
            <h2 style={{ margin: 0 }}>{type === 'dump' ? 'Brain Dump' : 'Jurnal Syukur'}</h2>
          </div>
          
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setType('dump')}
              style={{ 
                padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                background: type === 'dump' ? 'white' : 'transparent',
                boxShadow: type === 'dump' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                fontWeight: type === 'dump' ? '600' : '400'
              }}
            >Dump</button>
            <button 
              onClick={() => setType('gratitude')}
              style={{ 
                padding: '6px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                background: type === 'gratitude' ? 'white' : 'transparent',
                boxShadow: type === 'gratitude' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                fontWeight: type === 'gratitude' ? '600' : '400'
              }}
            >Syukur</button>
          </div>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '15px' }}>
          {type === 'dump' 
            ? 'Keluarkan beban pikiranmu tanpa ragu.' 
            : 'Tuliskan hal kecil yang membuatmu tersenyum hari ini.'}
        </p>
        
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === 'dump' ? "Apa yang mengganggumu?" : "Aku bersyukur karena..."}
          style={{
            width: '100%', height: '150px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0',
            fontFamily: 'inherit', fontSize: '1rem', resize: 'none', marginBottom: '10px', outline: 'none',
            backgroundColor: '#f8fafc'
          }}
        />
        
        <button 
          onClick={handleSave}
          disabled={isSaving || !note.trim()}
          className="btn btn-primary"
          style={{ 
            width: '100%', 
            justifyContent: 'center', 
            background: type === 'gratitude' ? '#ec4899' : '',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} style={{marginRight: '8px'}} />}
          {isSaving ? ' Menyimpan...' : ' Simpan ke Riwayat'}
        </button>
      </div>

      {/* List Riwayat */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <Sparkles size={18} color="#f59e0b" /> Riwayat Jurnal
        </h3>
        
        {savedNotes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada catatan di database.</p>
        ) : (
          savedNotes.map((item) => (
            <div key={item.id} className="card" style={{ 
              padding: '15px', position: 'relative',
              borderLeft: item.entry_type === 'gratitude' ? '6px solid #ec4899' : '6px solid #8b5cf6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {new Date(item.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ 
                  fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px',
                  background: item.entry_type === 'gratitude' ? '#fdf2f8' : '#f5f3ff',
                  color: item.entry_type === 'gratitude' ? '#ec4899' : '#8b5cf6'
                }}>
                  {item.entry_type === 'gratitude' ? '💖 Syukur' : '🧠 Dump'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap', paddingRight: '25px' }}>
                {item.content}
              </p>
              <button 
                onClick={() => deleteNote(item.id)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
      <div style={{ height: '40px' }}></div>
    </div>
  );
};

export default BrainDump;