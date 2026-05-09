import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarDays, Users, Clock, FileText, CheckCircle, Wallet, TrendingUp, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

const pageAnim = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const STATUS_COLORS = {
  confirmado: { background: '#dcfce7', color: '#166534' },
  pendente:   { background: '#fef9c3', color: '#854d0e' },
  cancelado:  { background: '#fee2e2', color: '#991b1b' },
  concluido:  { background: '#ede9fe', color: '#5b21b6' },
};

const PGTO_COLORS = {
  pago:     { background: '#dcfce7', color: '#166534' },
  pendente: { background: '#fef9c3', color: '#854d0e' },
};

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function StatCard({ label, value, color, Icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{ background: '#fff', borderRadius: 8, padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem' }}>
        <Icon size={17} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</div>
    </motion.div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <motion.div
        style={modalBox}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
        </div>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={s.btnGhost}>Cancelar</button>
          <button onClick={onConfirm} style={s.btnPrimary}>{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PsychologistDashboard() {
  const { show: toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [repasse, setRepasse] = useState({ list: [], totalPendente: 0, totalPago: 0 });
  const [loading, setLoading] = useState(true);
  const [concludeTarget, setConcludeTarget] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(() => {
    Promise.all([
      api.get('/appointments').catch(() => []),
      api.get('/financial/my-repasse').catch(() => ({ list: [], totalPendente: 0, totalPago: 0 })),
    ]).then(([appts, rep]) => {
      setAppointments(Array.isArray(appts) ? appts : []);
      setRepasse(rep ?? { list: [], totalPendente: 0, totalPago: 0 });
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleConclude() {
    if (!concludeTarget) return;
    try {
      await api.patch(`/appointments/${concludeTarget.id}/conclude`);
      toast('Sessão marcada como concluída.', 'success');
      fetchData();
    } catch (err) {
      toast(err?.error ?? 'Erro ao concluir sessão.', 'error');
    } finally {
      setConcludeTarget(null);
    }
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nextWeekDate = new Date(now); nextWeekDate.setDate(now.getDate() + 7);
  const nextWeek = `${nextWeekDate.getFullYear()}-${pad(nextWeekDate.getMonth() + 1)}-${pad(nextWeekDate.getDate())}`;

  const sessionsToday = appointments.filter((a) => a.data === today && a.status !== 'cancelado');
  const sessionsWeek = appointments.filter((a) => a.data >= today && a.data <= nextWeek && a.status !== 'cancelado');
  const uniquePatients = new Set(appointments.map((a) => a.paciente_id)).size;
  const upcoming = appointments
    .filter((a) => a.data >= today && a.status !== 'cancelado')
    .sort((a, b) => (`${a.data}T${a.hora}` > `${b.data}T${b.hora}` ? 1 : -1))
    .slice(0, 10);

  if (loading) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <LayoutDashboard size={22} color="#3b82f6" />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Meu Painel</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} height="3rem" />)}
      </div>
      <SkeletonTable rows={5} cols={5} />
    </div>
  );

  return (
    <motion.div {...pageAnim}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <LayoutDashboard size={22} color="#3b82f6" />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Meu Painel</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Sessões hoje" value={sessionsToday.length} color="#3b82f6" Icon={CalendarDays} />
        <StatCard label="Próximos 7 dias" value={sessionsWeek.length} color="#8b5cf6" Icon={Clock} />
        <StatCard label="Total de pacientes" value={uniquePatients} color="#10b981" Icon={Users} />
        <StatCard label="Repasse a receber" value={fmt(repasse.totalPendente)} color="#f59e0b" Icon={Wallet} />
        <StatCard label="Repasse recebido" value={fmt(repasse.totalPago)} color="#22c55e" Icon={TrendingUp} />
      </div>

      {/* Próximas sessões */}
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <CalendarDays size={16} color="#64748b" />
          <span style={s.panelTitle}>Próximas sessões</span>
        </div>
        {upcoming.length === 0 ? (
          <div style={s.empty}>
            <CalendarDays size={32} color="#e2e8f0" />
            <p style={{ color: '#9ca3af', margin: '0.5rem 0 0' }}>Nenhuma sessão agendada.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Paciente', 'Data', 'Hora', 'Status', 'Ações'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={s.td}><span style={{ fontWeight: 500, color: '#111827' }}>{a.patients?.nome ?? '—'}</span></td>
                    <td style={s.td}>{new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style={s.td}>{a.hora?.slice(0, 5)}</td>
                    <td style={s.td}>
                      <span style={{ ...STATUS_COLORS[a.status], padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ ...s.td }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => navigate(`/psicologo/prontuario/${a.id}`)}
                          style={s.btnBlue}
                        >
                          <FileText size={12} />
                          Prontuário
                        </button>
                        {a.status !== 'concluido' && (
                          <button
                            onClick={() => setConcludeTarget(a)}
                            style={s.btnPurple}
                          >
                            <CheckCircle size={12} />
                            Concluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Meus repasses */}
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <Wallet size={16} color="#64748b" />
          <span style={s.panelTitle}>Meus repasses</span>
        </div>
        {repasse.list.length === 0 ? (
          <div style={s.empty}>
            <Wallet size={32} color="#e2e8f0" />
            <p style={{ color: '#9ca3af', margin: '0.5rem 0 0' }}>Nenhum repasse registrado.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Paciente', 'Data', 'Hora', 'Valor', 'Status'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repasse.list.map((t) => (
                  <tr key={t.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={s.td}><span style={{ fontWeight: 500, color: '#111827' }}>{t.appointments?.patients?.nome ?? '—'}</span></td>
                    <td style={s.td}>{t.appointments?.data ? new Date(t.appointments.data + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td style={s.td}>{t.appointments?.hora?.slice(0, 5) ?? '—'}</td>
                    <td style={{ ...s.td, fontWeight: 700 }}>{fmt(t.valor)}</td>
                    <td style={s.td}>
                      <span style={{ ...(PGTO_COLORS[t.status_pagamento] ?? {}), padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                        {t.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {concludeTarget && (
        <ConfirmModal
          title="Concluir sessão"
          message={`Marcar como concluída a sessão de ${concludeTarget.patients?.nome ?? 'paciente'} em ${new Date(concludeTarget.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${concludeTarget.hora?.slice(0, 5)}?`}
          confirmLabel="Concluir sessão"
          onConfirm={handleConclude}
          onCancel={() => setConcludeTarget(null)}
        />
      )}
    </motion.div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 50, padding: '1rem',
};
const modalBox = {
  background: '#fff', borderRadius: '12px', padding: '1.75rem',
  width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
};

const s = {
  panel: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 },
  panelHeader: { padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  panelTitle: { fontWeight: 700, color: '#374151', fontSize: '0.95rem' },
  empty: { padding: '2.5rem 1rem', textAlign: 'center' },
  th: { padding: '0.6rem 1rem', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f0f0f0' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#374151' },
  btnBlue: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'inherit' },
  btnPurple: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.75rem', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'inherit' },
  btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' },
};
