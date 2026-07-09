import { Outlet } from 'react-router-dom';
// Nota: Comentaremos las importaciones de Sidebar y Navbar hasta crearlos en los siguientes pasos
// import { Sidebar } from '../components/layout/Sidebar/Sidebar';
// import { Navbar } from '../components/layout/Navbar/Navbar';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden text-dark">
      {/* Sidebar - Menú Lateral */}
      <aside className="hidden md:flex md:flex-shrink-0">
        {/* <Sidebar /> */}
        {/* Placeholder temporal */}
        <div className="w-64 bg-dark-gray text-white flex items-center justify-center border-r border-light-gray/20">
          Sidebar Placeholder
        </div>
      </aside>

      {/* Contenedor Principal (Navbar + Contenido) */}
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        {/* Navbar Superior */}
        <header className="flex-shrink-0">
          {/* <Navbar /> */}
          {/* Placeholder temporal */}
          <div className="h-16 bg-white border-b border-light-gray/50 flex items-center px-4 shadow-saas-sm">
            Navbar Placeholder
          </div>
        </header>

        {/* Área de Contenido Principal (Scrollable) */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {/* Aquí se inyectarán las páginas: Dashboard, Courses, Tasks, etc. */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};