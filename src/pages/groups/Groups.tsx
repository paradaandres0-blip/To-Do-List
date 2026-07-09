import { useState } from 'react';
import { Plus, Search, Users, MoreVertical, BookOpen } from 'lucide-react';
import { Button } from '../../componets/common/Button/Button';
import { Input } from '../../componets/common/Input/Input';
import { Modal } from '../../componets/common/Modal/Modal';
import { useForm } from 'react-hook-form';

// Datos Simulados
const INITIAL_GROUPS = [
  { id: '1', name: 'Cohorte 2026 - Desarrollo Web', organization: 'Universidad Tecnológica', mentor: 'Carlos Ruiz', students: 45, status: 'En curso' },
  { id: '2', name: 'Fundamentos de Python', organization: 'Academia CodeCraft', mentor: 'Ana Gómez', students: 120, status: 'Inscripciones' },
  { id: '3', name: 'Ingeniería de Software Avanzada', organization: 'Universidad Tecnológica', mentor: 'Julián Parada', students: 32, status: 'En curso' },
  { id: '4', name: 'Diseño UX/UI Inicial', organization: 'Instituto de Desarrollo', mentor: 'Laura Silva', students: 25, status: 'Finalizado' },
];

interface NewGroupForm {
  name: string;
  organization: string;
  mentor: string;
}

export const Groups = () => {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewGroupForm>();

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: NewGroupForm) => {
    const newGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      organization: data.organization,
      mentor: data.mentor,
      students: 0,
      status: 'Inscripciones',
    };
    
    setGroups([newGroup, ...groups]);
    setIsModalOpen(false);
    reset(); // Limpia el formulario
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Grupos Académicos
          </h1>
          <p className="text-sm text-dark-gray/80 mt-1">
            Gestiona las cohortes, asigna mentores y controla los participantes.
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Nuevo Grupo
        </Button>
      </div>

      {/* Barra de Herramientas */}
      <div className="bg-white p-4 rounded-xl border border-light-gray/40 shadow-saas-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:max-w-md">
          <Input 
            placeholder="Buscar por grupo u organización..." 
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Tarjetas (Alternativa a la tabla para mostrar variedad UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl border border-light-gray/40 shadow-saas-sm p-5 hover:shadow-saas-md transition-shadow group relative">
            <div className="absolute top-4 right-4">
              <button className="p-1 text-light-gray hover:text-dark transition-colors rounded-md">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="mb-4 pr-6">
              <h3 className="text-lg font-bold text-dark leading-tight">{group.name}</h3>
              <p className="text-sm text-dark-gray/70 mt-1">{group.organization}</p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-dark-gray">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-[10px] font-bold">{group.mentor.charAt(0)}</span>
                </div>
                <span>Mentor: <span className="font-medium text-dark">{group.mentor}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-gray">
                <BookOpen size={16} className="text-light-gray" />
                <span>{group.students} Estudiantes inscritos</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-light-gray/30">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                group.status === 'En curso' ? 'bg-secondary/10 text-secondary' : 
                group.status === 'Finalizado' ? 'bg-dark-gray text-white' : 
                'bg-green-100 text-green-700'
              }`}>
                {group.status}
              </span>
              <Button variant="ghost" size="sm">Ver Detalles</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Creación */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nuevo Grupo"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Nombre del Grupo" 
            placeholder="Ej. Cohorte 2026 - Desarrollo Frontend"
            {...register('name', { required: 'El nombre es obligatorio' })}
            error={errors.name?.message}
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-dark-gray">Organización</label>
            <select 
              className="block w-full px-3 py-2.5 border border-light-gray/60 rounded-lg leading-5 bg-background text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"
              {...register('organization', { required: 'Selecciona una organización' })}
            >
              <option value="">Seleccionar...</option>
              <option value="Universidad Tecnológica">Universidad Tecnológica</option>
              <option value="Instituto de Desarrollo">Instituto de Desarrollo</option>
              <option value="Academia CodeCraft">Academia CodeCraft</option>
            </select>
            {errors.organization && <p className="text-sm text-red-500 font-medium">{errors.organization.message}</p>}
          </div>

          <Input 
            label="Mentor Asignado" 
            placeholder="Ej. Julián Parada"
            {...register('mentor', { required: 'El mentor es obligatorio' })}
            error={errors.mentor?.message}
          />

          <div className="pt-4 flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Grupo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};