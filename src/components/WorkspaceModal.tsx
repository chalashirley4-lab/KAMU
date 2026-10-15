import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  HardDrive, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Lead } from '../types';
import { 
  exportLeadsToGoogleSheets, 
  backupToGoogleDrive, 
  fetchGoogleFormResponses, 
  googleSignIn,
  logout
} from '../services/googleWorkspace';
import { getCSVString } from '../utils/helpers';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onImportLeadsFromForm?: (newLeads: Partial<Lead>[]) => void;
  googleUser: User | null;
  onUserAuthChange: (user: User | null) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  leads,
  onImportLeadsFromForm,
  googleUser,
  onUserAuthChange,
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'drive' | 'forms'>('sheets');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; link?: string } | null>(null);
  
  // Pending Confirmation state for destructive/mutating operations
  const [pendingAction, setPendingAction] = useState<{
    actionType: 'export_sheets' | 'backup_drive' | 'import_forms';
    title: string;
    description: string;
    itemCount?: number;
  } | null>(null);

  // Forms test ID input
  const [formIdInput, setFormIdInput] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      const res = await googleSignIn();
      if (res) {
        onUserAuthChange(res.user);
        setStatusMessage({
          type: 'success',
          text: `Sesión iniciada con éxito como ${res.user.displayName || res.user.email}.`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al iniciar sesión con Google.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onUserAuthChange(null);
    setStatusMessage({
      type: 'info',
      text: 'Sesión de Google cerrada.'
    });
  };

  // 1. Trigger Sheets Export Confirmation
  const promptExportSheets = () => {
    if (!googleUser) {
      setStatusMessage({ type: 'error', text: 'Debes iniciar sesión con Google antes de exportar.' });
      return;
    }
    setPendingAction({
      actionType: 'export_sheets',
      title: 'Crear Hoja de Cálculo en Google Sheets',
      description: `Se creará una nueva hoja de cálculo en tu Google Drive titulada "KAMU CRM - Base Depurada (${new Date().toLocaleDateString('es-CO')})" con los ${leads.length} leads actuales y sus 9 columnas originales + campos comerciales.`,
      itemCount: leads.length
    });
  };

  // 2. Trigger Drive Backup Confirmation
  const promptBackupDrive = () => {
    if (!googleUser) {
      setStatusMessage({ type: 'error', text: 'Debes iniciar sesión con Google antes de respaldar.' });
      return;
    }
    setPendingAction({
      actionType: 'backup_drive',
      title: 'Guardar Respaldo CSV en Google Drive',
      description: `Se subirá un archivo de respaldo titulado "KAMU_CRM_Respaldo_${new Date().toISOString().slice(0, 10)}.csv" directamente a tu cuenta de Google Drive para preservación histórica.`,
      itemCount: leads.length
    });
  };

  // 3. Trigger Form Import Confirmation
  const promptImportForms = () => {
    if (!googleUser) {
      setStatusMessage({ type: 'error', text: 'Debes iniciar sesión con Google antes de importar.' });
      return;
    }
    if (!formIdInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor ingresa un ID válido de Google Form.' });
      return;
    }
    setPendingAction({
      actionType: 'import_forms',
      title: 'Consultar e Importar Respuestas de Google Forms',
      description: `La aplicación se conectará al formulario con ID "${formIdInput}" para leer las respuestas de los prospectos y cruzarlas con la base de datos comercial.`,
    });
  };

  // Execute confirmed action
  const executeConfirmedAction = async () => {
    if (!pendingAction) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      if (pendingAction.actionType === 'export_sheets') {
        const result = await exportLeadsToGoogleSheets(leads);
        setStatusMessage({
          type: 'success',
          text: `¡Hoja de cálculo creada exitosamente con ${leads.length} leads!`,
          link: result.spreadsheetUrl
        });
      } else if (pendingAction.actionType === 'backup_drive') {
        const csvContent = getCSVString(leads);
        const result = await backupToGoogleDrive(csvContent);
        setStatusMessage({
          type: 'success',
          text: '¡Respaldo CSV guardado con éxito en tu Google Drive!',
          link: result.fileUrl
        });
      } else if (pendingAction.actionType === 'import_forms') {
        const data = await fetchGoogleFormResponses(formIdInput.trim());
        const count = data.responses?.length || 0;
        setStatusMessage({
          type: 'success',
          text: `Se encontraron ${count} respuestas en el formulario de Google. Sincronización completada.`
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Ocurrió un error al ejecutar la operación con Google Workspace.'
      });
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#24445C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20">
              <HardDrive className="w-5 h-5 text-[#FFF0C2]" />
            </div>
            <div>
              <h2 className="text-base font-bold">Google Workspace Sync Hub</h2>
              <p className="text-xs text-[#DCE6EF]/80">Integración en tiempo real con Google Sheets, Drive y Forms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          {googleUser ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-xs">
                {googleUser.displayName?.charAt(0) || 'G'}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-800">{googleUser.displayName || 'Usuario Google'}</span>
                <span className="text-slate-500 block">{googleUser.email}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Conecta tu cuenta institucional para sincronizar hojas y archivos.</span>
            </div>
          )}

          <div>
            {googleUser ? (
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-600 hover:text-red-600 font-medium px-2.5 py-1 rounded hover:bg-slate-200/60 transition"
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Conectar con Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Toast / Alert */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3.5 rounded-xl border flex items-start justify-between text-xs ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : statusMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{statusMessage.text}</p>
                {statusMessage.link && (
                  <a
                    href={statusMessage.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-900 underline mt-1 hover:text-emerald-950"
                  >
                    <span>Abrir documento creado</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Confirmation Modal Overlay if pending action */}
        {pendingAction ? (
          <div className="p-6 bg-slate-50 border-t border-slate-200 m-6 rounded-2xl border">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>Confirmar acción en Google Workspace</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-800 mb-1">{pendingAction.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{pendingAction.description}</p>
            {pendingAction.itemCount && (
              <div className="mb-4 text-xs font-semibold bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                Registros a procesar: <span className="text-[#24445C]">{pendingAction.itemCount} leads comerciales</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={executeConfirmedAction}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#24445C] text-white hover:bg-[#1b364a] text-sm font-bold rounded-lg shadow-sm transition"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirmar y Ejecutar</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-3 gap-4">
              <button
                onClick={() => setActiveTab('sheets')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'sheets'
                    ? 'border-[#24445C] text-[#24445C]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets</span>
              </button>

              <button
                onClick={() => setActiveTab('drive')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'drive'
                    ? 'border-[#24445C] text-[#24445C]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span>Google Drive</span>
              </button>

              <button
                onClick={() => setActiveTab('forms')}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'forms'
                    ? 'border-[#24445C] text-[#24445C]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Google Forms</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-4">
              {activeTab === 'sheets' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <h3 className="font-bold text-sm text-emerald-950 mb-1">Exportar a Nueva Hoja de Cálculo</h3>
                    <p className="text-xs text-emerald-800 mb-3">
                      Genera automáticamente una hoja de cálculo con formato institucional que incluye la Base Depurada completa (281 leads) con las 9 columnas originales de KAMU y datos de campañas.
                    </p>
                    <button
                      onClick={promptExportSheets}
                      disabled={loading || !googleUser}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                      <span>Crear Google Sheet con {leads.length} Leads</span>
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">Columnas sincronizadas:</p>
                    <p>ID Lead, Nombre / Empresa, Teléfono, Email, Ciudad, Fase Comercial, Prioridad, Último Contacto, Próxima Acción, Campaña, Formulario y Tipo de Negocio.</p>
                  </div>
                </div>
              )}

              {activeTab === 'drive' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                    <h3 className="font-bold text-sm text-blue-950 mb-1">Copia de Seguridad en Google Drive</h3>
                    <p className="text-xs text-blue-800 mb-3">
                      Sube un archivo de respaldo codificado en CSV UTF-8 con la fecha de hoy directamente a la raíz de tu Google Drive para auditoría comercial y cumplimiento.
                    </p>
                    <button
                      onClick={promptBackupDrive}
                      disabled={loading || !googleUser}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                      <span>Guardar Respaldo CSV en Google Drive</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                    <span className="font-semibold block mb-0.5 text-slate-700">Políticas de Privacidad y Permisos:</span>
                    La aplicación sólo accede a los archivos que ella misma genera (`drive.file`) cumpliendo con el principio de mínimo privilegio.
                  </div>
                </div>
              )}

              {activeTab === 'forms' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
                    <h3 className="font-bold text-sm text-purple-950 mb-1">Vincular Formulario de Google</h3>
                    <p className="text-xs text-purple-800 mb-3">
                      Ingresa el ID del Google Form (código alfanumérico que aparece en la URL del formulario) para consultar y traer las nuevas respuestas comerciales directamente a KAMU.
                    </p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Ejemplo: 1FAIpQLScXy..."
                        value={formIdInput}
                        onChange={(e) => setFormIdInput(e.target.value)}
                        className="flex-1 text-xs border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={promptImportForms}
                        disabled={loading || !googleUser}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition"
                      >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        <span>Consultar Respuestas</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
                    <p className="font-semibold text-slate-700 mb-1">Formularios de Campañas Mapeados:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                      <li>Retail B2B: Form neg 1, neg 2, neg 3, neg 4</li>
                      <li>Colegios Institucional: Form COL1, COL2, COL3, COL4</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>KAMU CRM v2.4 • Conexión Oficial Google Workspace</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
