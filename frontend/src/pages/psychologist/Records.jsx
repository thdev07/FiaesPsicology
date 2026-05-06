import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from '../../components/medical-records/RichTextEditor';
import { api } from '../../services/api';

export default function Records() {
  const { consultaId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [evolucao, setEvolucao] = useState('');
  const [anamnese, setAnamnese] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('evolucao');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [consultaId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = { consulta_id: consultaId, evolucao, anamnese };
      const saved = isNew
        ? await api.post('/medical-records', payload)
        : await api.put(`/medical-records/${record.id}`, payload);
      setRecord(saved);
      setLastSaved(new Date());
    } catch (err) {
      alert(err?.error ?? 'Erro ao salvar prontuário.');
    } finally {
      setSaving(false);
    }
  }, [consultaId, evolucao, anamnese, isNew, record]);

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
  });

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
        ← Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{pacienteNome}</h1>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{dataConsulta}</div>
        </div>
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
            style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Salvando...' : isNew ? 'Criar prontuário' : 'Salvar'}
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button style={abaStyle('evolucao')} onClick={() => setAbaAtiva('evolucao')}>Evolução</button>
          <button style={abaStyle('anamnese')} onClick={() => setAbaAtiva('anamnese')}>Anamnese</button>
        </div>
        <div style={{ padding: 16 }}>
          {abaAtiva === 'evolucao' && (
            <RichTextEditor value={evolucao} onChange={setEvolucao} />
          )}
          {abaAtiva === 'anamnese' && (
            <RichTextEditor value={anamnese} onChange={setAnamnese} />
          )}
        </div>
      </div>
    </div>
  );
}
