import React from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Upload,
  FileSpreadsheet, 
  HardDrive, 
  FileText, 
  LogOut, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onOpenNewLead: () => void;
  onOpenImportModal: () => void;
  onOpenWorkspaceModal: () => void;
  googleUser: User | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOpenNewLead,
  onOpenImportModal,
  onOpenWorkspaceModal,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut
}) => {
  return (
    <header className="h-16 bg-[#24445C] text-white flex items-center justify-between px-6 shadow-md border-b border-[#1b364a] sticky top-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
          <Building2 className="w-6 h-6 text-[#FFF0C2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wide">KAMU</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#DCE6EF]/20 text-[#DCE6EF] font-medium border border-[#DCE6EF]/30">
              CRM Comercial B2B
            </span>
          </div>
          <p className="text-[11px] text-[#DCE6EF]/80 font-normal">
            Gestión Integral de Leads & Campañas
          </p>
        </div>
      </div>

      {/* Center Search & Date */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Buscar por lead, empresa, teléfono o ciudad..."
            value={searchTerm || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-black/20 text-white placeholder-white/50 text-sm rounded-lg pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FFF0C2] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Actions & Google Workspace */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#DCE6EF]/80 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <CalendarDays className="w-3.5 h-3.5 text-[#FFF0C2]" />
          <span>Jueves, 15 Oct 2026</span>
        </div>

        {/* Google Workspace Integration Button */}
        {googleUser ? (
          <div className="flex items-center gap-2 bg-[#DDEFE3]/20 border border-[#DDEFE3]/40 rounded-lg px-2.5 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs text-left leading-tight">
              <span className="block text-[10px] text-[#DDEFE3] uppercase font-bold tracking-wider">Workspace Activo</span>
              <span className="font-medium text-white truncate max-w-[110px] block">{googleUser.displayName || googleUser.email}</span>
            </div>
            <button
              onClick={onOpenWorkspaceModal}
              title="Abrir panel de Google Workspace"
              className="p-1 hover:bg-white/10 rounded text-[#FFF0C2] transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={onGoogleSignOut}
              title="Cerrar sesión de Google"
              className="p-1 hover:bg-white/10 rounded text-red-200 hover:text-red-100 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-slate-300 transition-all hover:shadow active:scale-95"
          >
            {/* Google G icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Conectar Google Workspace</span>
          </button>
        )}

        {/* Sync Center Quick trigger */}
        <button
          onClick={onOpenWorkspaceModal}
          className="flex items-center gap-1.5 bg-[#DCE6EF]/20 hover:bg-[#DCE6EF]/30 text-[#DCE6EF] hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 transition"
        >
          <HardDrive className="w-3.5 h-3.5 text-[#FFF0C2]" />
          <span className="hidden sm:inline">Drive & Sheets</span>
        </button>

        {/* Import Leads Button */}
        <button
          onClick={onOpenImportModal}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-white/20 transition active:scale-95"
          title="Importar leads desde Excel (.xlsx) o CSV"
        >
          <Upload className="w-3.5 h-3.5 text-[#FFF0C2]" />
          <span className="hidden sm:inline">Importar Leads</span>
        </button>

        {/* New Lead Button */}
        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 bg-[#FFF0C2] hover:bg-[#ffe699] text-[#24445C] font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo Lead</span>
        </button>
      </div>
    </header>
  );
};
