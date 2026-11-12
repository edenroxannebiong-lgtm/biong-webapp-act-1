import React, { useState } from 'react';
import {
  Users,
  Plus,
  ExternalLink,
  FolderOpen,
  Mail,
  Building,
  Check,
  Share2,
  Trash2,
  FileText,
  UploadCloud,
  Shield,
} from 'lucide-react';
import { VaultFile } from '../types';

interface ClientsManagerProps {
  files: VaultFile[];
  clients: string[];
  onSelectClient: (clientName: string) => void;
  onAddClient: (clientName: string) => void;
  onOpenUploadForClient: (clientName: string) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  files,
  clients,
  onSelectClient,
  onAddClient,
  onOpenUploadForClient,
}) => {
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedClient, setCopiedClient] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddClient(newClientName.trim());
    setNewClientName('');
    setNewClientCompany('');
    setIsCreating(false);
  };

  const handleCopyPortalLink = (clientName: string) => {
    const url = `${window.location.origin}?portal=${encodeURIComponent(clientName)}`;
    navigator.clipboard.writeText(url);
    setCopiedClient(clientName);
    setTimeout(() => setCopiedClient(null), 2000);
  };

  // Group file counts by client
  const clientStats = clients.map((name) => {
    const clientFiles = files.filter((f) => f.clientName === name);
    const totalBytes = clientFiles.reduce((acc, f) => acc + f.size, 0);
    return {
      name,
      fileCount: clientFiles.length,
      totalBytes,
      latestFile: clientFiles[0]?.name,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>Client Portals</span>
            <span className="text-sm font-normal text-[#64748B] bg-white px-2.5 py-0.5 rounded-full border border-[#CBD5E1]">
              {clients.length} Active
            </span>
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Organize files by client and grant secure portal access for file submissions
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#475569] hover:bg-[#334155] rounded-lg transition-all shadow-sm shadow-slate-900/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Portal</span>
        </button>
      </div>

      {/* New Client Form Modal / Banner */}
      {isCreating && (
        <div className="bg-white p-5 rounded-xl border border-[#CBD5E1] shadow-sm animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-[#0F172A] mb-1">Create New Client Portal</h3>
          <p className="text-xs text-[#64748B] mb-4">
            Add a dedicated file space where your client can review and upload project deliverables.
          </p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Client or Project Name (e.g. Acme Corp)"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] bg-white text-[#0F172A]"
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Company / Tag (optional)"
              value={newClientCompany}
              onChange={(e) => setNewClientCompany(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] bg-white text-[#0F172A]"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#475569] hover:bg-[#334155] rounded-lg transition-colors cursor-pointer"
              >
                Create Portal
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Client Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientStats.map((client) => (
          <div
            key={client.name}
            className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-xs hover:border-[#475569] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleCopyPortalLink(client.name)}
                  title="Copy client portal upload link"
                  className="px-2.5 py-1 text-xs font-medium text-[#475569] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#CBD5E1]/50 border border-[#CBD5E1] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedClient === client.name ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Share Portal</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="font-bold text-[#0F172A] text-base mb-1">{client.name}</h3>
              <p className="text-xs text-[#64748B]">
                Secure Client Portal • {client.fileCount}{' '}
                {client.fileCount === 1 ? 'file' : 'files'}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[#CBD5E1] flex items-center justify-between">
              <button
                onClick={() => onSelectClient(client.name)}
                className="text-xs font-semibold text-[#475569] hover:text-[#334155] flex items-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>View {client.name} Files</span>
              </button>

              <button
                onClick={() => onOpenUploadForClient(client.name)}
                className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 hover:bg-[#F1F5F9] px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
