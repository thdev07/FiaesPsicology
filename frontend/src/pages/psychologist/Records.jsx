import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, FilePlus, X } from 'lucide-react';
import RichTextEditor from '../../components/medical-records/RichTextEditor';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const TIPOS = ['laudo', 'atestado', 'relatorio', 'declaracao'];
const TIPO_LABELS = { laudo: 'Laudo', atestado: 'Atestado', relatorio: 'Relatório', declaracao: 'Declaração' };
const EMPTY_DOC = { titulo: '', tipo: 'laudo', conteudo: '' };

export default function Records() {
  const { consultaId } = useParams();
  const navigate = useNavigate();
  const { show: toast } = useToast();

  const [record, setRecord] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [evolucao, setEvolucao] = useState('');
  const [anamnese, setAnamnese] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('evolucao');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Documentos
  const [documents, setDocuments] = useState([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docForm, setDocForm] = useState(EMPTY_DOC);
  const [savingDoc, setSavingDoc] = useState(false);

  const isNew = !record;

  useEffect(() => {
    async function load() {
      try {
        const [rec, apt] = await Promise.allSettled([
          api.get(`/medical-records/${consultaId}`),
          api.get(`/appointments/${consultaId}`),
        ]);
        if (apt.status === 'fulfilled') setAppointment(apt.value);
        if (rec.status === 'fulfilled' && rec.value) {
          setRecord(rec.value);
          setEvolucao(rec.value.evolucao ?? '');
          setAnamnese(rec.value.anamnese ?? '');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [consultaId]);

  const loadDocs = useCallback(async () => {
    try {
      const data = await api.get(`/documents/consulta/${consultaId}`);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (_) {}
  }, [consultaId]);

  useEffect(() => { if (abaAtiva === 'documentos') loadDocs(); }, [abaAtiva, loadDocs]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = { consulta_id: consultaId, evolucao, anamnese };
      const saved = isNew
        ? await api.post('/medical-records', payload)
        : await api.put(`/medical-records/${record.id}`, payload);
      setRecord(saved);
      setLastSaved(new Date());
      toast('Prontuário salvo.', 'success');
    } catch (err) {
      toast(err?.error ?? 'Erro ao salvar prontuário.', 'error');
    } finally {
      setSaving(false);
    }
  }, [consultaId, evolucao, anamnese, isNew, record, toast]);

  async function handleSaveDoc(e) {
    e.preventDefault();
    if (!appointment?.paciente_id) return toast('Paciente não identificado.', 'error');
    setSavingDoc(true);
    try {
      const payload = { ...docForm, consulta_id: consultaId, patient_id: appointment.paciente_id };
      if (editingDoc) {
        await api.put(`/documents/${editingDoc.id}`, payload);
        toast('Documento atualizado.', 'success');
      } else {
        await api.post('/documents', payload);
        toast('Documento criado.', 'success');
      }
      setShowDocForm(false);
      setEditingDoc(null);
      setDocForm(EMPTY_DOC);
      loadDocs();
    } catch (err) {
      toast(err?.error ?? 'Erro ao salvar documento.', 'error');
    } finally {
      setSavingDoc(false);
    }
  }

  async function toggleLiberado(doc) {
    try {
      await api.put(`/documents/${doc.id}`, { liberado: !doc.liberado });
      toast(doc.liberado ? 'Documento ocultado do paciente.' : 'Documento liberado para o paciente.', 'success');
      loadDocs();
    } catch (err) {
      toast(err?.error ?? 'Erro ao alterar visibilidade.', 'error');
    }
  }

  async function handleDeleteDoc(doc) {
    try {
      await api.delete(`/documents/${doc.id}`);
      toast('Documento excluído.', 'info');
      loadDocs();
    } catch (err) {
      toast(err?.error ?? 'Erro ao excluir.', 'error');
    }
  }

  function openEditDoc(doc) {
    setEditingDoc(doc);
    setDocForm({ titulo: doc.titulo, tipo: doc.tipo, conteudo: doc.conteudo });
    setShowDocForm(true);
  }

  function openNewDoc() {
    setEditingDoc(null);
    setDocForm(EMPTY_DOC);
    setShowDocForm(true);
  }

  if (loading) return <div style={{ padding: 32, color: '#6b7280' }}>Carregando prontuário...</div>;

  const pacienteNome = appointment?.patients?.nome ?? 'Paciente';
  const dataConsulta = appointment ? `${appointment.data} às ${appointment.hora?.slice(0, 5)}` : '';

  const abaStyle = (aba) => ({
    padding: '8px 20px',
    border: 'none',
    borderBottom: abaAtiva === aba ? '2px solid #3b82f6' : '2px solid transparent',
    background: 'none',
    color: abaAtiva === aba ? '#3b82f6' : '#6b7280',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit',
  });

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16, fontSize: 14, fontFamily: 'inherit' }}>
        ← Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{pacienteNome}</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{dataConsulta}</div>
        </div>
        {abaAtiva !== 'documentos' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastSaved && (
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {record && ` · v${record.versao}`}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}
            >
              {saving ? 'Salvando...' : isNew ? 'Criar prontuário' : 'Salvar'}
            </button>
          </div>
        )}
        {abaAtiva === 'documentos' && (
          <button onClick={openNewDoc} style={{ ...s.btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FilePlus size={15} />
            Novo documento
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button style={abaStyle('evolucao')} onClick={() => setAbaAtiva('evolucao')}>Evolução</button>
          <button style={abaStyle('anamnese')} onClick={() => setAbaAtiva('anamnese')}>Anamnese</button>
          <button style={abaStyle('documentos')} onClick={() => setAbaAtiva('documentos')}>
            Documentos {documents.length > 0 && `(${documents.length})`}
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {abaAtiva === 'evolucao' && <RichTextEditor value={evolucao} onChange={setEvolucao} />}
          {abaAtiva === 'anamnese' && <RichTextEditor value={anamnese} onChange={setAnamnese} />}
          {abaAtiva === 'documentos' && (
            <DocumentsTab
              documents={documents}
              showForm={showDocForm}
              editingDoc={editingDoc}
              docForm={docForm}
              setDocForm={setDocForm}
              savingDoc={savingDoc}
              onNew={openNewDoc}
              onEdit={openEditDoc}
              onDelete={handleDeleteDoc}
              onToggle={toggleLiberado}
              onSave={handleSaveDoc}
              onCancel={() => { setShowDocForm(false); setEditingDoc(null); setDocForm(EMPTY_DOC); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ documents, showForm, editingDoc, docForm, setDocForm, savingDoc, onEdit, onDelete, onToggle, onSave, onCancel }) {
  return (
    <div>
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={s.docForm}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
              {editingDoc ? 'Editar documento' : 'Novo documento'}
            </h3>
            <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={18} />
            </button>
          </div>
          <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
              <div>
                <label style={s.label}>Título *</label>
                <input
                  required
                  value={docForm.titulo}
                  onChange={(e) => setDocForm({ ...docForm, titulo: e.target.value })}
                  placeholder="Ex: Atestado de comparecimento"
                  style={s.input}
                />
              </div>
              <div>
                <label style={s.label}>Tipo *</label>
                <select
                  value={docForm.tipo}
                  onChange={(e) => setDocForm({ ...docForm, tipo: e.target.value })}
                  style={s.input}
                >
                  {TIPOS.map((t) => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={s.label}>Conteúdo *</label>
              <textarea
                required
                value={docForm.conteudo}
                onChange={(e) => setDocForm({ ...docForm, conteudo: e.target.value })}
                rows={8}
                placeholder="Escreva o conteúdo do documento..."
                style={{ ...s.input, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={onCancel} style={s.btnGhost}>Cancelar</button>
              <button type="submit" disabled={savingDoc} style={s.btnPrimary}>
                {savingDoc ? 'Salvando...' : 'Salvar documento'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {documents.length === 0 && !showForm ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          <Plus size={28} color="#e2e8f0" style={{ marginBottom: 8 }} />
          <p style={{ margin: 0 }}>Nenhum documento criado para esta consulta.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: showForm ? 16 : 0 }}>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...s.docCard, borderLeft: `3px solid ${doc.liberado ? '#16a34a' : '#e2e8f0'}` }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ ...s.tipoBadge }}>{TIPO_LABELS[doc.tipo] ?? doc.tipo}</span>
                  {doc.liberado && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 8px', borderRadius: 999 }}>
                      Visível ao paciente
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{doc.titulo}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => onToggle(doc)}
                  title={doc.liberado ? 'Ocultar do paciente' : 'Liberar para o paciente'}
                  style={{ ...s.iconBtn, color: doc.liberado ? '#16a34a' : '#94a3b8', borderColor: doc.liberado ? '#bbf7d0' : '#e2e8f0' }}
                >
                  {doc.liberado ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => onEdit(doc)} style={s.iconBtn} title="Editar">
                  Editar
                </button>
                <button onClick={() => onDelete(doc)} style={{ ...s.iconBtn, color: '#dc2626', borderColor: '#fecaca' }} title="Excluir">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
  btnGhost: { background: 'none', color: '#6b7280', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
  docForm: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 16 },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  docCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 8, padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  tipoBadge: { fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 999 },
  iconBtn: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#374151', fontFamily: 'inherit' },
};
