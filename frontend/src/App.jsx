import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/psicologo/*"
            element={
              <ProtectedRoute allowedRoles={['psicologo']}>
                <PsychologistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paciente/*"
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
