import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  Lead, 
  Interaction, 
  LeadPhase 
} from './types';
import { 
  INITIAL_LEADS, 
  INITIAL_INTERACTIONS 
} from './data/initialData';
import { 
  initAuth, 
  googleSignIn, 
  logout 
} from './services/googleWorkspace';
import { Header } from './components/Header';
import { Sidebar, ActiveModule } from './components/Sidebar';
import { LeadDetailModal } from './components/LeadDetailModal';
import { NewLeadModal } from './components/NewLeadModal';
import { NewInteractionModal } from './components/NewInteractionModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { ImportLeadsModal } from './components/ImportLeadsModal';

// Views
import { DashboardView } from './views/DashboardView';
import { LeadsView } from './views/LeadsView';
import { AgendaView } from './views/AgendaView';
import { Top50View } from './views/Top50View';
import { Perfil360View } from './views/Perfil360View';
import { InteractionsView } from './views/InteractionsView';
import { FunnelView } from './views/FunnelView';
import { CampaignsView } from './views/CampaignsView';
import { TemplatesView } from './views/TemplatesView';
import { CatalogsView } from './views/CatalogsView';
import { BaseDepuradaView } from './views/BaseDepuradaView';

import { CURRENT_DATE_STRING } from './utils/helpers';

export default function App() {
  // Main Data States
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [interactions, setInteractions] = useState<Interaction[]>(INITIAL_INTERACTIONS);
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [leadsFaseFilter, setLeadsFaseFilter] = useState('Todas');

  // Modals
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewInteractionOpen, setIsNewInteractionOpen] = useState(false);
  const [interactionPreselectedLead, setInteractionPreselectedLead] = useState<Lead | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Perfil 360 lead selection
  const [currentPerfilLeadId, setCurrentPerfilLeadId] = useState<string>(INITIAL_LEADS[0]?.id || '');

  // Notifications / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Workspace Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for Firebase Auth changes without storing access token in storage
    const unsubscribe = initAuth(
      (user) => {
        setGoogleUser(user);
      },
      () => {
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handlers for Google Workspace Auth
  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        showToast(`Conectado a Google Workspace como ${res.user.displayName || res.user.email}`);
      }
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    await logout();
    setGoogleUser(null);
    showToast('Sesión de Google cerrada.');
  };

  // Lead selection
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadDetailOpen(true);
  };

  const handleSelectLeadById = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setIsLeadDetailOpen(true);
    }
  };

  // Open Perfil 360 for lead
  const handleOpenPerfil360 = (lead: Lead) => {
    setCurrentPerfilLeadId(lead.id);
    setActiveModule('perfil360');
  };

  // Update lead
  const handleUpdateLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    if (selectedLead?.id === updated.id) {
      setSelectedLead(updated);
    }
    showToast(`Lead ${updated.id} actualizado con éxito.`);
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    if (selectedLead?.id === leadId) {
      setIsLeadDetailOpen(false);
      setSelectedLead(null);
    }
    if (currentPerfilLeadId === leadId) {
      const remaining = leads.filter(l => l.id !== leadId);
      setCurrentPerfilLeadId(remaining[0]?.id || '');
    }
    showToast(`Lead ${leadId} eliminado de la base comercial.`);
  };

  // Delete multiple leads (Mass delete)
  const handleDeleteMultipleLeads = (leadIds: string[]) => {
    if (!leadIds || leadIds.length === 0) return;
    const idsSet = new Set(leadIds);
    setLeads(prev => prev.filter(l => !idsSet.has(l.id)));
    if (selectedLead && idsSet.has(selectedLead.id)) {
      setIsLeadDetailOpen(false);
      setSelectedLead(null);
    }
    if (idsSet.has(currentPerfilLeadId)) {
      const remaining = leads.filter(l => !idsSet.has(l.id));
      setCurrentPerfilLeadId(remaining[0]?.id || '');
    }
    showToast(`Se eliminaron masivamente ${leadIds.length} leads de la base comercial.`);
  };

  // Import leads
  const handleImportLeads = (newLeads: Lead[]) => {
    setLeads(prev => [...newLeads, ...prev]);
    showToast(`¡Se importaron ${newLeads.length} leads exitosamente!`);
    setActiveModule('leads');
  };

  // Toggle task complete in Agenda
  const handleToggleTaskComplete = (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const newCompleted = !l.accion_completada;
        return {
          ...l,
          accion_completada: newCompleted,
          notas: newCompleted 
            ? `${l.notas} [Acción completada el ${CURRENT_DATE_STRING}]`
            : l.notas
        };
      }
      return l;
    }));
  };

  // Open interaction modal for a specific lead
  const handleOpenInteractionForLead = (lead: Lead) => {
    setInteractionPreselectedLead(lead);
    setIsNewInteractionOpen(true);
  };

  // Save new interaction
  const handleSaveInteraction = (newInt: Interaction, updatedLeadData?: Partial<Lead>) => {
    setInteractions(prev => [newInt, ...prev]);

    if (updatedLeadData && newInt.leadId) {
      setLeads(prev => prev.map(l => {
        if (l.id === newInt.leadId) {
          return {
            ...l,
            ...updatedLeadData,
          };
        }
        return l;
      }));
    }
    showToast('Nueva interacción registrada en la bitácora.');
  };

  // Create new manual lead
  const handleCreateLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
    showToast(`Lead ${newLead.id} creado con éxito.`);
  };

  // Quick navigation helpers
  const handleNavigateToLeads = (fase?: string) => {
    if (fase) {
      setLeadsFaseFilter(fase);
    } else {
      setLeadsFaseFilter('Todas');
    }
    setActiveModule('leads');
  };

  const handleFilterCampaignLeads = (campaignName: string) => {
    setActiveModule('leads');
  };

  // Counts for sidebar badges
  const overdueTasksCount = leads.filter(
    l => !l.accion_completada && l.fecha_proxima_accion < CURRENT_DATE_STRING
  ).length;

  const todayTasksCount = leads.filter(
    l => !l.accion_completada && l.fecha_proxima_accion === CURRENT_DATE_STRING
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#24445C] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <Header
        searchTerm={globalSearch}
        onSearchChange={(val) => {
          setGlobalSearch(val);
          if (val.trim() && activeModule !== 'leads') {
            setActiveModule('leads');
          }
        }}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        googleUser={googleUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          leadsCount={leads.length}
          overdueTasksCount={overdueTasksCount}
          todayTasksCount={todayTasksCount}
          top50Count={50}
          interactionsCount={interactions.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && (
              <DashboardView
                leads={leads}
                onSelectLead={handleSelectLead}
                onNavigateToLeads={handleNavigateToLeads}
                onNavigateToAgenda={() => setActiveModule('agenda')}
              />
            )}

            {activeModule === 'leads' && (
              <LeadsView
                leads={leads}
                onSelectLead={handleSelectLead}
                onOpenNewLead={() => setIsNewLeadOpen(true)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onDeleteLead={handleDeleteLead}
                onDeleteMultipleLeads={handleDeleteMultipleLeads}
                onOpenPerfil360={handleOpenPerfil360}
                initialFaseFilter={leadsFaseFilter}
              />
            )}

            {activeModule === 'agenda' && (
              <AgendaView
                leads={leads}
                onToggleTaskComplete={handleToggleTaskComplete}
                onSelectLead={handleSelectLead}
                onOpenNewInteraction={handleOpenInteractionForLead}
              />
            )}

            {activeModule === 'top50' && (
              <Top50View
                leads={leads}
                onSelectLead={handleSelectLead}
                onOpenNewInteraction={handleOpenInteractionForLead}
              />
            )}

            {activeModule === 'perfil360' && (
              <Perfil360View
                leads={leads}
                currentLeadId={currentPerfilLeadId}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onSelectLeadId={setCurrentPerfilLeadId}
                onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
              />
            )}

            {activeModule === 'historial' && (
              <InteractionsView
                interactions={interactions}
                onOpenNewInteraction={() => {
                  setInteractionPreselectedLead(null);
                  setIsNewInteractionOpen(true);
                }}
                onSelectLeadById={handleSelectLeadById}
              />
            )}

            {activeModule === 'embudo' && (
              <FunnelView leads={leads} />
            )}

            {activeModule === 'campañas' && (
              <CampaignsView
                leads={leads}
                onFilterCampaignLeads={handleFilterCampaignLeads}
              />
            )}

            {activeModule === 'plantillas' && (
              <TemplatesView />
            )}

            {activeModule === 'catalogos' && (
              <CatalogsView />
            )}

            {activeModule === 'base_depurada' && (
              <BaseDepuradaView
                leads={leads}
                onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
                onSelectLead={handleSelectLead}
                onOpenPerfil360={handleOpenPerfil360}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onDeleteLead={handleDeleteLead}
                onDeleteMultipleLeads={handleDeleteMultipleLeads}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={isLeadDetailOpen}
        onClose={() => setIsLeadDetailOpen(false)}
        onUpdateLead={handleUpdateLead}
        onOpenNewInteraction={handleOpenInteractionForLead}
        onDeleteLead={handleDeleteLead}
        onOpenPerfil360={handleOpenPerfil360}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onCreateLead={handleCreateLead}
        existingCount={leads.length}
      />

      <ImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportLeads={handleImportLeads}
        existingCount={leads.length}
      />

      <NewInteractionModal
        isOpen={isNewInteractionOpen}
        onClose={() => {
          setIsNewInteractionOpen(false);
          setInteractionPreselectedLead(null);
        }}
        leads={leads}
        preselectedLead={interactionPreselectedLead}
        onSaveInteraction={handleSaveInteraction}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        leads={leads}
        googleUser={googleUser}
        onUserAuthChange={setGoogleUser}
      />
    </div>
  );
}
