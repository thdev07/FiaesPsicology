import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import { BrainCircuit, ArrowLeft, ShieldOff, Search } from 'lucide-react';

import Login from './pages/auth/Login';

import AdminDashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import Rooms from './pages/admin/Rooms';
import Appointments from './pages/admin/Appointments';
import Users from './pages/admin/Users';
import Convenios from './pages/admin/Convenios';
import Financial from './pages/admin/Financial';
import Reports from './pages/admin/Reports';
import PsychologistDashboard from './pages/psychologist/Dashboard';
import PsychologistAgenda from './pages/psychologist/Agenda';
import PsychologistPatients from './pages/psychologist/Patients';
import Records from './pages/psychologist/Records';
import ProntuariosList from './pages/psychologist/ProntuariosList';
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientDocuments from './pages/patient/Documents';
import PatientProfile from './pages/patient/Profile';
import NovoAgendamento from './pages/patient/NovoAgendamento';
import PaymentSuccess from './pages/patient/PaymentSuccess';
import LandingPage from './pages/LandingPage';

function ErrorPage({ icon: Icon, title, message, actions }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <Icon size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem' }}>{title}</h1>
        <p style={{ color: '#64748b', margin: '0 0 2rem', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {actions}
        </div>
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={16} color="#94a3b8" />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>FiaesPsychology</span>
        </div>
      </div>
    </div>
  );
}

function Unauthorized() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      icon={ShieldOff}
      title="Acesso negado"
      message="Você não tem permissão para acessar esta página. Se acredita que isso é um erro, entre em contato com a administração."
      actions={
        <>
          <button
            onClick={() => navigate(-1)}
            style={btnGhost}
          >
            <ArrowLeft size={15} />
            Voltar
          </button>
          <button
            onClick={() => navigate('/login')}
            style={btnPrimary}
          >
            Ir para o login
          </button>
        </>
      }
    />
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <ErrorPage
      icon={Search}
      title="Página não encontrada"
      message="A página que você procura não existe ou foi movida. Verifique o endereço ou volte para o início."
      actions={
        <>
          <button
            onClick={() => navigate(-1)}
            style={btnGhost}
          >
            <ArrowLeft size={15} />
            Voltar
          </button>
          <button
            onClick={() => navigate('/login')}
            style={btnPrimary}
          >
            Ir para o início
          </button>
        </>
      }
    />
  );
}

const btnPrimary = {
  padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
  background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer',
  fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  fontFamily: 'inherit',
};
const btnGhost = {
  padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0',
  background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer',
  fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  fontFamily: 'inherit',
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rotas Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/pacientes" element={<Patients />} />
              <Route path="/admin/salas" element={<Rooms />} />
              <Route path="/admin/agendamentos" element={<Appointments />} />
              <Route path="/admin/usuarios" element={<Users />} />
              <Route path="/admin/financeiro" element={<Financial />} />
              <Route path="/admin/convenios" element={<Convenios />} />
              <Route path="/admin/relatorios" element={<Reports />} />
            </Route>

            {/* Rotas Psicólogo */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['psicologo']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/psicologo" element={<PsychologistDashboard />} />
              <Route path="/psicologo/agenda" element={<PsychologistAgenda />} />
              <Route path="/psicologo/pacientes" element={<PsychologistPatients />} />
              <Route path="/psicologo/prontuarios" element={<ProntuariosList />} />
              <Route path="/psicologo/prontuario/:consultaId" element={<Records />} />
            </Route>

            {/* Rotas Paciente */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['paciente']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/paciente" element={<PatientDashboard />} />
              <Route path="/paciente/agendamentos" element={<PatientAppointments />} />
              <Route path="/paciente/documentos" element={<PatientDocuments />} />
              <Route path="/paciente/perfil" element={<PatientProfile />} />
              <Route path="/paciente/novo-agendamento" element={<NovoAgendamento />} />
              <Route path="/paciente/pagamento/sucesso" element={<PaymentSuccess />} />
            </Route>

            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
