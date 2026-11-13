import React, { useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './firebase/config';
import { handleFirestoreError, OperationType } from './firebase/errors';
import { VaultFile } from './types';
import { deleteVaultFile } from './services/storageService';
import { seedDemoVaultFiles } from './services/demoSeeder';
import { Sidebar } from './components/Sidebar';
import { FileList } from './components/FileList';
import { UploadModal } from './components/UploadModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { ClientsManager } from './components/ClientsManager';
import { AuthPage } from './components/AuthPage';
import {
  Menu,
  X,
  UploadCloud,
  CheckCircle2,
  FolderOpen,
  Share2,
  ExternalLink,
} from 'lucide-react';

function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'files' | 'upload' | 'clients'>('files');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customClients, setCustomClients] = useState<string[]>([
    'Acme Corp',
    'Studio Nova',
    'Bold Horizon Media',
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check URL query parameters for direct client portal links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal') || params.get('client');
    if (portalParam) {
      setSelectedClient(portalParam);
      if (!customClients.includes(portalParam)) {
        setCustomClients((prev) => [...prev, portalParam]);
      }
    }
  }, []);

  // Subscribe to files in Firestore for current user
  useEffect(() => {
    if (!user) {
      setFiles([]);
      setFilesLoading(false);
      return;
    }

    setFilesLoading(true);
    const filesPath = 'files';
    const q = query(
      collection(db, filesPath),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: VaultFile[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ ...doc.data() as VaultFile, id: doc.id });
        });
        setFiles(loaded);
        setFilesLoading(false);
      },
      (error) => {
        console.error('Error fetching files:', error);
        setFilesLoading(false);
        handleFirestoreError(error, OperationType.LIST, filesPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Aggregate all unique client names from files & custom clients
  const allClients = useMemo(() => {
    const fromFiles = files.map((f) => f.clientName).filter(Boolean) as string[];
    const merged = Array.from(new Set([...customClients, ...fromFiles]));
    return merged.sort();
  }, [files, customClients]);

  // Calculate total storage bytes utilized
  const totalStorageBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [files]);

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteVaultFile(fileId);
      showToast('File securely deleted from vault.');
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast('Error deleting file: ' + (err.message || 'Permission denied'));
    }
  };

  const handleSeedDemo = async () => {
    if (!user) return;
    try {
      showToast('Populating sample deliverables...');
      await seedDemoVaultFiles(user.uid, profile?.displayName || user.displayName || 'Designer');
      showToast('Sample design deliverables loaded!');
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Could not load sample files.');
    }
  };

  const handleAddClient = (clientName: string) => {
    if (!customClients.includes(clientName)) {
      setCustomClients((prev) => [...prev, clientName]);
    }
    showToast(`Client Portal "${clientName}" created!`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Connecting to CVault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden text-[#0F172A] font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#334155] flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              currentView={currentView}
              setCurrentView={(v) => {
                setCurrentView(v);
                setMobileMenuOpen(false);
              }}
              totalStorageBytes={totalStorageBytes}
              totalFilesCount={files.length}
              onOpenUpload={() => {
                setIsUploadOpen(true);
                setMobileMenuOpen(false);
              }}
              selectedClient={selectedClient}
              setSelectedClient={(c) => {
                setSelectedClient(c);
                setMobileMenuOpen(false);
              }}
              clients={allClients}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          totalStorageBytes={totalStorageBytes}
          totalFilesCount={files.length}
          onOpenUpload={() => setIsUploadOpen(true)}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          clients={allClients}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#CBD5E1] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
              <span className="text-[#94A3B8]">Portal</span>
              <span>/</span>
              <span className="text-[#0F172A] font-semibold capitalize">
                {currentView === 'files'
                  ? selectedClient === 'all'
                    ? 'All Files'
                    : selectedClient
                  : 'Clients & Portals'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedClient !== 'all' && (
              <button
                onClick={() => {
                  setSelectedClient('all');
                  setCurrentView('files');
                }}
                className="text-xs text-[#475569] hover:text-[#334155] bg-white px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] font-medium transition-colors cursor-pointer"
              >
                Clear Client Filter
              </button>
            )}

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#475569] hover:bg-[#334155] rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </div>
        </header>

        {/* Client Portal Mode Header Banner if viewing specific client */}
        {selectedClient !== 'all' && (
          <div className="bg-[#1E293B] text-white px-6 py-2.5 text-xs flex items-center justify-between shadow-xs border-b border-[#334155]">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#94A3B8]" />
              <span>
                Active Client Portal:{' '}
                <strong className="text-white">{selectedClient}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const url = `${window.location.origin}?portal=${encodeURIComponent(
                    selectedClient
                  )}`;
                  navigator.clipboard.writeText(url);
                  showToast('Client link copied to clipboard!');
                }}
                className="text-[#CBD5E1] hover:text-white underline cursor-pointer"
              >
                Copy Client Upload Link
              </button>
              <button
                onClick={() => setSelectedClient('all')}
                className="text-[#94A3B8] hover:text-white cursor-pointer"
              >
                View All Files
              </button>
            </div>
          </div>
        )}

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'files' ? (
              <FileList
                files={files}
                onDeleteFile={handleDeleteFile}
                onPreviewFile={(file) => setPreviewFile(file)}
                onOpenUpload={() => setIsUploadOpen(true)}
                onSeedDemoFiles={handleSeedDemo}
                selectedClient={selectedClient}
              />
            ) : (
              <ClientsManager
                files={files}
                clients={allClients}
                onSelectClient={(client) => {
                  setSelectedClient(client);
                  setCurrentView('files');
                }}
                onAddClient={handleAddClient}
                onOpenUploadForClient={(client) => {
                  setSelectedClient(client);
                  setIsUploadOpen(true);
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          showToast('File uploaded successfully to CVault!');
        }}
        existingClients={allClients}
        initialClient={selectedClient}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
