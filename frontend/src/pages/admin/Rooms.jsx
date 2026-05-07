import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DoorOpen, Plus, X } from 'lucide-react';
import { api } from '../../services/api';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const EMPTY_FORM = { nome: '', recursos: '' };

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRooms(); }, []);

  async function fetchRooms() {
    setLoading(true);
    try {
      const data = await api.get('/rooms');
      setRooms(data);
    } catch (err) {
      setError(err?.error ?? 'Erro ao carregar salas.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(room) {
    setEditing(room);
    setForm({
      nome: room.nome ?? '',
      recursos: (room.recursos ?? []).join(', '),
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      nome: form.nome,
      recursos: form.recursos ? form.recursos.split(',').map((r) => r.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) {
        await api.put(`/rooms/${editing.id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      setError(err?.error ?? 'Erro ao salvar sala.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta sala?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err) {
      setError(err?.error ?? 'Erro ao remover sala.');
    }
  }

  return (
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <DoorOpen size={22} color="#3b82f6" />
          <h1 style={s.title}>Salas</h1>
        </div>
        <button onClick={openCreate} style={s.btnPrimary}>
          <Plus size={15} />
          Nova sala
        </button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : rooms.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhuma sala cadastrada.</p>
      ) : (
        <div style={s.grid}>
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              style={s.card}
            >
              <div style={s.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DoorOpen size={18} color="#3b82f6" />
                  </div>
                  <span style={s.cardName}>{room.nome}</span>
                </div>
                <div style={s.cardActions}>
                  <button onClick={() => openEdit(room)} style={s.btnEdit}>Editar</button>
                  <button onClick={() => handleDelete(room.id)} style={s.btnDelete}>Remover</button>
                </div>
              </div>
              {room.recursos?.length > 0 && (
                <div style={s.tags}>
                  {room.recursos.map((r) => (
                    <span key={r} style={s.tag}>{r}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={s.overlay}>
          <motion.div
            style={s.modal}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editing ? 'Editar sala' : 'Nova sala'}</h2>
              <button onClick={() => setShowModal(false)} style={s.modalClose}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} style={s.form}>
              <label style={s.label}>Nome da sala *</label>
              <input
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Sala 01"
                style={s.input}
              />

              <label style={s.label}>Recursos (separados por vírgula)</label>
              <input
                value={form.recursos}
                onChange={(e) => setForm({ ...form, recursos: e.target.value })}
                placeholder="Ex: Ar condicionado, Sofá, TV"
                style={s.input}
              />

              {error && <p style={s.error}>{error}</p>}

              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.btnSecondary}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={s.btnPrimary}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  error: { color: '#dc2626', fontSize: '0.875rem', margin: '0.5rem 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'default' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  cardName: { fontWeight: 700, fontSize: '1rem', color: '#1e293b' },
  cardActions: { display: 'flex', gap: '0.4rem' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  tag: { background: '#eff6ff', color: '#3b82f6', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 500 },
  btnPrimary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
  btnSecondary: { padding: '0.5rem 1.1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  btnEdit: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' },
  btnDelete: { padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: '12px', padding: '1.75rem', width: '100%', maxWidth: '440px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '0.25rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.4rem' },
  input: { padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' },
};
