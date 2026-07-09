import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Building2, MoreHorizontal } from 'lucide-react';
import { Button } from '../../componets/common/Button/Button';
import { Input } from '../../componets/common/Input/Input';

// 1. Datos Simulados (Mock Data)
// Esto simula lo que recibiremos de la API en Node.js a futuro
const INITIAL_ORGS = [
  { id: '1', name: 'Universidad Tecnológica', domain: 'utec.edu.co', users: 1250, status: 'Activo' },
  { id: '2', name: 'Instituto de Desarrollo', domain: 'idesarrollo.com', users: 430, status: 'Activo' },
  { id: '3', name: 'Academia CodeCraft', domain: 'codecraft.io', users: 85, status: 'Inactivo' },
  { id: '4', name: 'Fundación Educativa', domain: 'feducativa.org', users: 210, status: 'Activo' },
];

export const Organizations = () => {
  // 2. Estados locales
  const [organizations, setOrganizations] = useState(INITIAL_ORGS);
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Lógica de Filtrado (Buscador)
  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. Funciones de acción (Simuladas)
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta organización?')) {
      setOrganizations(prev => prev.filter(org => org.id !== id));
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado del CRUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Building2 size={24} className="text-primary" />
            Organizaciones
          </h1>
          <p className="text-sm text-dark-gray/80 mt-1">
            Administra las instituciones y su acceso a la plataforma.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />}>
          Nueva Organización
        </Button>
      </div>

      {/* Barra de Herramientas (Filtros y Búsqueda) */}
      <div className="bg-white p-4 rounded-xl border border-light-gray/40 shadow-saas-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:max-w-md">
          {/* Aquí utilizamos nuestro Input reutilizable */}
          <Input 
            placeholder="Buscar por nombre o dominio..." 
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">Filtrar</Button>
          <Button variant="outline" size="sm">Exportar</Button>
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white border border-light-gray/40 rounded-xl shadow-saas-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-light-gray/50 text-dark-gray text-sm">
                <th className="py-3 px-4 font-semibold">Nombre</th>
                <th className="py-3 px-4 font-semibold">Dominio</th>
                <th className="py-3 px-4 font-semibold">Usuarios</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/30 text-sm">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-background/50 transition-colors group">
                    <td className="py-3 px-4 font-medium text-dark">{org.name}</td>
                    <td className="py-3 px-4 text-dark-gray">{org.domain}</td>
                    <td className="py-3 px-4 text-dark-gray">{org.users}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button className="p-1.5 text-light-gray hover:text-secondary hover:bg-secondary/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(org.id)}
                        className="p-1.5 text-light-gray hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-light-gray hover:text-dark rounded-md transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-dark-gray">
                    No se encontraron organizaciones con el término "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación (Visual) */}
        <div className="bg-background border-t border-light-gray/50 p-4 flex items-center justify-between text-sm text-dark-gray">
          <span>Mostrando {filteredOrgs.length} de {organizations.length} resultados</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled>Anterior</Button>
            <Button variant="ghost" size="sm">Siguiente</Button>
          </div>
        </div>
      </div>
    </div>
  );
};