import { Outlet } from 'react-router-dom';
import Sidebar from '../componets/layout/Sidebar/Sidebar';
import Navbar  from '../componets/layout/Navbar/Navbar';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f172a' }}>

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex md:flex-shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Navbar />

        {/* Contenido scrollable */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: '#f8fafc' }}
        >
          <div className="py-8 px-6 md:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
