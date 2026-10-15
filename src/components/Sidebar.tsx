import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Trophy, 
  PhoneCall, 
  Filter, 
  Target, 
  MessageSquareText, 
  Library, 
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export type ActiveModule = 
  | 'dashboard'
  | 'leads'
  | 'agenda'
  | 'top50'
  | 'perfil360'
  | 'historial'
  | 'embudo'
  | 'campañas'
  | 'plantillas'
  | 'catalogos'
  | 'base_depurada';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  leadsCount: number;
  overdueTasksCount: number;
  todayTasksCount: number;
  top50Count: number;
  interactionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  leadsCount,
  overdueTasksCount,
  todayTasksCount,
  top50Count,
  interactionsCount,
}) => {
  const principalNav = [
    {
      id: 'dashboard' as ActiveModule,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'leads' as ActiveModule,
      label: 'Base de Leads',
      icon: Users,
      badge: leadsCount,
      badgeColor: 'bg-[#DCE6EF] text-[#24445C] font-semibold',
    },
    {
      id: 'agenda' as ActiveModule,
      label: 'Agenda del Día',
      icon: CalendarClock,
      badge: overdueTasksCount > 0 ? `${overdueTasksCount} v.` : `${todayTasksCount} hoy`,
      badgeColor: overdueTasksCount > 0 ? 'bg-[#F6D7D7] text-[#9e1c1c] font-bold' : 'bg-[#FFF0C2] text-[#8a6508] font-bold',
    },
    {
      id: 'top50' as ActiveModule,
      label: 'Top 50 Prioridad',
      icon: Trophy,
      badge: top50Count,
      badgeColor: 'bg-[#FCE2CC] text-[#9e4400] font-bold',
    },
    {
      id: 'perfil360' as ActiveModule,
      label: 'Perfil 360° KAMU',
      icon: UserCheck,
      badge: 'Excel 360°',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
  ];

  const operacionNav = [
    {
      id: 'historial' as ActiveModule,
      label: 'Historial de Contactos',
      icon: PhoneCall,
      badge: interactionsCount,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'embudo' as ActiveModule,
      label: 'Embudo Comercial',
      icon: Filter,
      badge: 'Funnel',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'campañas' as ActiveModule,
      label: 'Campañas y Fuentes',
      icon: Target,
      badge: '2 Activas',
      badgeColor: 'bg-blue-100 text-blue-800 font-bold',
    },
    {
      id: 'plantillas' as ActiveModule,
      label: 'Plantillas',
      icon: MessageSquareText,
      badge: '11',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'catalogos' as ActiveModule,
      label: 'Catálogos',
      icon: Library,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'base_depurada' as ActiveModule,
      label: 'Base Depurada',
      icon: FileSpreadsheet,
      badge: '9 Col.',
      badgeColor: 'bg-[#DDEFE3] text-[#1b5e32] font-semibold',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none h-[calc(100vh-4rem)] sticky top-16 z-20">
      {/* Scrollable nav list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Section 1: Principal */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Principal</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <nav className="space-y-1">
            {principalNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#24445C] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFF0C2]' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 2: Operación */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Operación</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">6 Módulos</span>
          </div>
          <nav className="space-y-1">
            {operacionNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#24445C] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFF0C2]' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom KPI Widget */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 font-medium">Seguimientos Vencidos</span>
            <span className={`font-bold ${overdueTasksCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {overdueTasksCount}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${overdueTasksCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, (overdueTasksCount / (leadsCount || 1)) * 100 * 3)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Base Depurada Total:</span>
            <span className="font-semibold text-slate-700">{leadsCount} registros</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
