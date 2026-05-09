import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CreditCard, X, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { SkeletonTable } from '../../components/ui/Skeleton';
import PaymentModal from '../../components/PaymentModal';

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

const TIPO_LABELS = { particular: 'Particular', convenio: 'Convênio' };

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Badge({ label, colors }) {
  return <span style={{ ...s.badge, ...colors }}>{label}</span>;
}

// Modal de confirmação genérico
function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }) {
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...modalBox, maxWidth: 360 }}>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.95rem', color: '#374151', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={s.btnGhost}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{ ...s.btnPrimary, background: danger ? '#dc2626' : '#3b82f6' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de reagendamento
function RescheduleModal({ appointment, onClose, onRescheduled }) {
  const { show: toast } = useToast();
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!date || !appointment.psicologo_id) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    api.get(`/appointments/available-slots?psicologoId=${appointment.psicologo_id}&date=${date}`)
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots(TIME_SLOTS.map((h) => ({ hora: h, disponivel: true }))))
      .finally(() => setLoadingSlots(false));
  }, [date, appointment.psicologo_id]);

  async function handleSave() {
    if (!date || !selectedSlot) return toast('Selecione data e horário', 'error');
    setSaving(true);
    try {
      await api.patch(`/appointments/${appointment.id}/reschedule`, { data: date, hora: selectedSlot + ':00' });
      toast('Reagendamento solicitado! Aguarde confirmação.', 'success');
      onRescheduled();
      onClose();
    } catch (err) {
      toast(err?.error ?? 'Erro ao reagendar', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Reagendar consulta</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
        </div>

        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Psicólogo: <strong>{appointment.users?.nome ?? '—'}</strong>
        </p>

        <label style={s.label}>Nova data</label>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={s.input}
        />

        {date && (
          <>
            <label style={{ ...s.label, marginTop: '1rem' }}>Horário</label>
            {loadingSlots ? (
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Carregando horários...</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(slots.length ? slots : TIME_SLOTS.map((h) => ({ hora: h, disponivel: true }))).map(({ hora, disponivel }) => {
                  const h = hora.slice(0, 5);
                  const active = selectedSlot === h;
                  return (
                    <button
                      key={h}
                      disabled={!disponivel}
                      onClick={() => disponivel && setSelectedSlot(h)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.375rem',
                        border: `1px solid ${active ? '#3b82f6' : disponivel ? '#e5e7eb' : '#f3f4f6'}`,
                        background: active ? '#3b82f6' : disponivel ? '#fff' : '#f3f4f6',
                        color: active ? '#fff' : disponivel ? '#374151' : '#d1d5db',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: disponivel ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={s.btnGhost}>Cancelar</button>
          <button onClick={handleSave} disabled={saving || !date || !selectedSlot} style={s.btnPrimary}>
            {saving ? 'Salvando...' : 'Confirmar reagendamento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointments() {
  const { show: toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [payingTransaction, setPayingTransaction] = useState(null);

  const load = useCallback(() => {
    Promise.all([
      api.get('/appointments').catch(() => []),
      api.get('/financial/my-debts').catch(() => []),
    ]).then(([appts, myDebts]) => {
      setAppointments(Array.isArray(appts) ? appts : []);
      setDebts(Array.isArray(myDebts) ? myDebts : []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function getDebtForAppointment(apptId) {
    return debts.find((d) => d.consulta_id === apptId && d.tipo === 'receita');
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    try {
      await api.patch(`/appointments/${cancelTarget.id}/cancel`);
      toast('Consulta cancelada.', 'info');
      load();
    } catch (err) {
      toast(err?.error ?? 'Erro ao cancelar', 'error');
    } finally {
      setCancelTarget(null);
    }
  }

  const filtered = filterStatus
    ? appointments.filter((a) => a.status === filterStatus)
    : appointments;

  const upcoming = filtered.filter((a) => {
    const d = new Date(`${a.data}T${a.hora}`);
    return d >= new Date() && a.status !== 'cancelado';
  });
  const past = filtered.filter((a) => {
    const d = new Date(`${a.data}T${a.hora}`);
    return d < new Date() || a.status === 'cancelado' || a.status === 'concluido';
  });

  return (
    <motion.div {...pageAnim}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CalendarDays size={22} color="#3b82f6" />
          <h1 style={s.title}>Minhas consultas</h1>
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={s.select}>
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {loading ? <SkeletonTable rows={6} cols={7} /> : (
        <>
          {upcoming.length > 0 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Próximas ({upcoming.length})</h2>
              <AppointmentTable
                rows={upcoming}
                getDebt={getDebtForAppointment}
                showActions
                onCancel={setCancelTarget}
                onReschedule={setRescheduleTarget}
                onPay={setPayingTransaction}
              />
            </div>
          )}

          <div style={s.section}>
            <h2 style={s.sectionTitle}>Histórico ({past.length})</h2>
            {past.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>Nenhuma consulta no histórico.</p>
            ) : (
              <AppointmentTable rows={past} getDebt={getDebtForAppointment} />
            )}
          </div>
        </>
      )}

      {cancelTarget && (
        <ConfirmModal
          message={`Deseja cancelar a consulta do dia ${new Date(`${cancelTarget.data}T00:00:00`).toLocaleDateString('pt-BR')} às ${cancelTarget.hora?.slice(0, 5)}?`}
          confirmLabel="Sim, cancelar"
          danger
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={load}
        />
      )}

      {payingTransaction && (
        <PaymentModal
          transaction={payingTransaction}
          onClose={() => setPayingTransaction(null)}
          onPaid={() => { load(); setPayingTransaction(null); }}
        />
      )}
    </motion.div>
  );
}

function AppointmentTable({ rows, getDebt, showActions = false, onCancel, onReschedule, onPay }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['Data', 'Hora', 'Psicólogo', 'Sala', 'Tipo', 'Status', 'Pagamento', ...(showActions ? ['Ações'] : [])].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const debt = getDebt?.(a.id);
            const canAct = showActions && (a.status === 'pendente' || a.status === 'confirmado');
            return (
              <tr key={a.id} style={s.tr}>
                <td style={s.td}>
                  {a.data
                    ? new Date(`${a.data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </td>
                <td style={s.td}>{a.hora?.slice(0, 5) ?? '—'}</td>
                <td style={s.td}>{a.users?.nome ?? '—'}</td>
                <td style={s.td}>{a.rooms?.nome ?? '—'}</td>
                <td style={s.td}>{TIPO_LABELS[a.tipo] ?? a.tipo}</td>
                <td style={s.td}>
                  <Badge label={a.status} colors={STATUS_COLORS[a.status] ?? {}} />
                </td>
                <td style={s.td}>
                  {debt ? (
                    debt.status_pagamento === 'pendente' && showActions ? (
                      <button onClick={() => onPay?.(debt)} style={s.payBtn}>
                        <CreditCard size={12} />
                        Pagar {Number(debt.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </button>
                    ) : (
                      <Badge label={debt.status_pagamento} colors={PGTO_COLORS[debt.status_pagamento] ?? {}} />
                    )
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>
                {showActions && (
                  <td style={s.td}>
                    {canAct ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => onReschedule?.(a)} style={s.btnAction} title="Reagendar">
                          <RotateCcw size={13} />
                        </button>
                        <button onClick={() => onCancel?.(a)} style={{ ...s.btnAction, color: '#dc2626', borderColor: '#fecaca' }} title="Cancelar">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '1rem',
};
const modalBox = {
  background: '#fff', borderRadius: '1rem', padding: '1.75rem',
  width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const s = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 },
  select: { padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
  tr: { borderTop: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#334155' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  payBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnAction: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.35rem', cursor: 'pointer', color: '#374151' },
  btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' },
  btnGhost: { background: 'none', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
};
