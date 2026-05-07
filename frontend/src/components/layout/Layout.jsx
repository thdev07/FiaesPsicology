import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#f8fafc' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
