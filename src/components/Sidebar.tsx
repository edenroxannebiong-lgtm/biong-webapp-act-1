import React from 'react';
import {
  FolderKanban,
  UploadCloud,
  Users,
  LogOut,
  HardDrive,
  Shield,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../services/storageService';

interface SidebarProps {
  currentView: 'files' | 'upload' | 'clients';
  setCurrentView: (view: 'files' | 'upload' | 'clients') => void;
  totalStorageBytes: number;
  totalFilesCount: number;
  onOpenUpload: () => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  clients: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  totalStorageBytes,
  totalFilesCount,
  onOpenUpload,
  selectedClient,
  setSelectedClient,
  clients,
}) => {
  const { profile, user, signOutUser, switchRole } = useAuth();

  // 100MB free quota reference for the visual meter
  const MAX_STORAGE_BYTES = 100 * 1024 * 1024;
  const storagePercentage = Math.min(100, Math.round((totalStorageBytes / MAX_STORAGE_BYTES) * 100));

  return (
    <aside className="w-64 bg-[#0F172A] text-[#94A3B8] flex flex-col h-screen border-r border-[#1E293B] shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#475569] flex items-center justify-center text-white shadow-md shadow-slate-950/40 border border-[#334155]">
            <Shield className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              CVault
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium">Client File Portal</p>
          </div>
        </div>
      </div>

      {/* Quick Upload Action Button */}
      <div className="p-4">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white font-medium text-sm transition-all shadow-md shadow-slate-950/40 active:scale-[0.98] cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
          Navigation
        </div>

        <button
          onClick={() => {
            setCurrentView('files');
            setSelectedClient('all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            currentView === 'files' && selectedClient === 'all'
              ? 'bg-[#1E293B] text-white border border-[#334155]'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-4 h-4 text-[#94A3B8]" />
            <span>All Files</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              currentView === 'files' && selectedClient === 'all'
                ? 'bg-[#475569] text-white'
                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]/60'
            }`}
          >
            {totalFilesCount}
          </span>
        </button>

        <button
          onClick={() => setCurrentView('clients')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            currentView === 'clients'
              ? 'bg-[#1E293B] text-white border border-[#334155]'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-[#94A3B8]" />
          <span>Clients & Portals</span>
        </button>

        {/* Client Portals Filter Section */}
        {clients.length > 0 && (
          <div className="pt-4">
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Filter by Client
            </div>
            <div className="space-y-0.5">
              {clients.map((client) => (
                <button
                  key={client}
                  onClick={() => {
                    setSelectedClient(client);
                    setCurrentView('files');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors truncate cursor-pointer ${
                    currentView === 'files' && selectedClient === client
                      ? 'bg-[#1E293B] text-white font-semibold border-l-2 border-[#475569]'
                      : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
                  }`}
                >
                  <span className="truncate">{client}</span>
                  {selectedClient === client && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#475569]"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Storage Meter */}
      <div className="p-4 mx-3 my-2 rounded-xl bg-[#1E293B]/70 border border-[#334155]/60">
        <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-medium text-[#CBD5E1]">Vault Storage</span>
          </div>
          <span>{formatFileSize(totalStorageBytes)}</span>
        </div>
        <div className="w-full bg-[#0F172A] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#475569] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, storagePercentage)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2">
          <span>{totalFilesCount} secure items</span>
          <span>100 MB tier</span>
        </div>
      </div>

      {/* User Profile & Sign Out Footer */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0A101D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-[#334155] flex items-center justify-center font-bold text-white text-sm shrink-0">
              {profile?.displayName?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-white truncate">
                {profile?.displayName || user?.displayName || 'User'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.2 bg-[#1E293B] text-[#94A3B8] rounded border border-[#334155]">
                  {profile?.role === 'client' ? 'Client' : 'Freelancer'}
                </span>
                <button
                  onClick={() =>
                    switchRole(profile?.role === 'client' ? 'freelancer' : 'client')
                  }
                  title="Switch preview perspective"
                  className="text-[10px] text-[#64748B] hover:text-[#94A3B8] underline cursor-pointer"
                >
                  toggle
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={signOutUser}
            title="Sign Out"
            className="p-2 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
