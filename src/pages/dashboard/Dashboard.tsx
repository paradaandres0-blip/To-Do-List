import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Clock,
  MoreVertical
} from 'lucide-react';

// Datos simulados para las métricas
const STATS = [
  { title: 'Usuarios Activos', value: '1,248', icon: Users, trend: '+12%', color: 'text-secondary', bg: 'bg-secondary/10' },
  { title: 'Cursos Terminados', value: '342', icon: BookOpen, trend: '+5%', color: 'text-primary', bg: 'bg-primary/10' },
  { title: 'Tareas Aprobadas', value: '8,942', icon: CheckCircle2, trend: '+22%', color: 'text-green-600', bg: 'bg-green-100' },
  { title: 'Productividad', value: '94%', icon: TrendingUp, trend: '+2%', color: 'text-orange-600', bg: 'bg-orange-100' },
];

const RECENT_TASKS = [
  { id: 1, title: 'Implementar Auth', module: 'Backend Node.js', status: 'En revisión', time: 'Hace 2 horas' },
  { id: 2, title: 'Diseño de Base de Datos', module: 'Arquitectura', status: 'Aprobada', time: 'Hace 5 horas' },
  { id: 3, title: 'Maquetación UI', module: 'Frontend React', status: 'En desarrollo', time: 'Hace 1 día' },
];

export const Dashboard = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Dashboard General</h1>
          <p className="text-sm text-dark-gray/80 mt-1">
            Resumen de actividad y métricas de la organización.
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-saas-sm">
          Descargar Reporte
        </button>
      </div>

      {/* Grid de Estadísticas (Tarjetas Superiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white p-5 rounded-xl border border-light-gray/40 shadow-saas-sm flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-dark">{stat.value}</h3>
              <p className="text-sm font-medium text-dark-gray/70 mt-1">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sección Inferior: Gráficos y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Progreso de Cursos (Ocupa 2 columnas en Desktop) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-light-gray/40 shadow-saas-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark">Avance de Estudiantes</h2>
            <button className="p-1 text-light-gray hover:text-dark-gray transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          {/* Placeholder para futura gráfica (Recharts o Chart.js) */}
          <div className="w-full h-64 bg-background rounded-lg border border-dashed border-light-gray/60 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp size={32} className="mx-auto text-light-gray mb-2" />
              <p className="text-sm font-medium text-dark-gray">Área reservada para gráfica de rendimiento</p>
            </div>
          </div>
        </motion.div>

        {/* Tareas Recientes (Ocupa 1 columna) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl border border-light-gray/40 shadow-saas-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-dark">Actividad Reciente</h2>
          </div>
          
          <div className="space-y-5">
            {RECENT_TASKS.map((task) => (
              <div key={task.id} className="flex gap-4">
                <div className="mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-background border border-light-gray flex items-center justify-center">
                    <Clock size={14} className="text-dark-gray" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-dark">{task.title}</h4>
                  <p className="text-xs text-dark-gray/80 mt-0.5">{task.module}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      task.status === 'Aprobada' ? 'bg-green-100 text-green-700' :
                      task.status === 'En revisión' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.status}
                    </span>
                    <span className="text-xs text-light-gray font-medium">{task.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
            Ver toda la actividad
          </button>
        </motion.div>

      </div>
    </div>
  );
};