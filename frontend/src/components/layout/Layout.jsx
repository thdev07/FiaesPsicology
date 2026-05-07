import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Layout() {
  const mobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fecha sidebar ao mudar de rota ou sair do mobile
  useEffect(() => { if (!mobile) setSidebarOpen(false); }, [mobile]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#f8fafc' }}>

      {/* Overlay escuro ao abrir sidebar no mobile */}
      {mobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <Sidebar
        mobile={mobile}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header
          mobile={mobile}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />
        <main style={{ flex: 1, padding: mobile ? '1rem' : '1.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
