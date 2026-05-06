import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import Patients from './pages/admin/Patients';
import Rooms from './pages/admin/Rooms';
import Appointments from './pages/admin/Appointments';
import Users from './pages/admin/Users';
import Convenios from './pages/admin/Convenios';
import PsychologistDashboard from './pages/psychologist/Dashboard';
import PatientDashboard from './pages/patient/Dashboard';

function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>403 — Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <a href="/login">Voltar ao login</a>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h1>404 — Página não encontrada</h1>
      <a href="/login">Voltar ao início</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            <Route path="/admin/financeiro" element={<div>Financeiro — em breve</div>} />
            <Route path="/admin/convenios" element={<Convenios />} />
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
            <Route path="/psicologo/agenda" element={<div>Agenda — em breve</div>} />
            <Route path="/psicologo/pacientes" element={<div>Pacientes — em breve</div>} />
            <Route path="/psicologo/prontuarios" element={<div>Prontuários — em breve</div>} />
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
            <Route path="/paciente/agendamentos" element={<div>Agendamentos — em breve</div>} />
            <Route path="/paciente/documentos" element={<div>Documentos — em breve</div>} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
