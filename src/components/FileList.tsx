import React, { useState } from 'react';
import {
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File,
  Eye,
  Download,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  UploadCloud,
  Share2,
  Sparkles,
  Calendar,
  Layers,
  User,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { VaultFile, FileCategory } from '../types';
import { formatFileSize, downloadFile } from '../services/storageService';

interface FileListProps {
  files: VaultFile[];
  onDeleteFile: (fileId: string) => Promise<void>;
  onPreviewFile: (file: VaultFile) => void;
  onOpenUpload: () => void;
  onSeedDemoFiles?: () => void;
  selectedClient: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onDeleteFile,
  onPreviewFile,
  onOpenUpload,
  onSeedDemoFiles,
  selectedClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | FileCategory>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'size-desc'>('date-desc');
  const [fileToDelete, setFileToDelete] = useState<VaultFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Category filter items
  const categories: { label: string; value: 'all' | FileCategory }[] = [
    { label: 'All Files', value: 'all' },
    { label: 'Design Deliverables', value: 'design' },
    { label: 'Documents & PDFs', value: 'document' },
    { label: 'Brand Assets', value: 'asset' },
    { label: 'Agreements & Invoices', value: 'contract' },
    { label: 'Client Feedback', value: 'feedback' },
  ];

  // Filter files
  const filteredFiles = files.filter((file) => {
    // Client filter
    if (selectedClient !== 'all' && file.clientName !== selectedClient) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && file.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchClient = (file.clientName || '').toLowerCase().includes(q);
      const matchUploader = (file.uploadedBy || '').toLowerCase().includes(q);
      const matchNotes = (file.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchClient && !matchUploader && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'size-desc') {
      return b.size - a.size;
    }
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime() || 0;
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime() || 0;
    if (sortBy === 'date-asc') {
      return dateA - dateB;
    }
    return dateB - dateA; // default date-desc
  });

  const getFileIcon = (file: VaultFile) => {
    if (file.type.startsWith('image/')) {
      if (file.previewUrl) {
        return (
          <img
            src={file.previewUrl}
            alt={file.name}
            className="w-9 h-9 rounded-lg object-cover border border-slate-200"
          />
        );
      }
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <FileImage className="w-5 h-5" />
        </div>
      );
    }
    if (file.type.includes('pdf')) {
      return (
        <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
      );
    }
    if (file.type.includes('zip') || file.type.includes('compressed')) {
      return (
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <FileArchive className="w-5 h-5" />
        </div>
      );
    }
    if (file.type.includes('code') || file.type.includes('json') || file.type.includes('javascript')) {
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <FileCode className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
        <File className="w-5 h-5" />
      </div>
    );
  };

  const getCategoryBadge = (cat: FileCategory) => {
    switch (cat) {
      case 'design':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
            Design
          </span>
        );
      case 'document':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
            Document
          </span>
        );
      case 'asset':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Asset
          </span>
        );
      case 'contract':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            Contract
          </span>
        );
      case 'feedback':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
            Feedback
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            General
          </span>
        );
    }
  };

  const formatDate = (dateVal: any): string => {
    if (!dateVal) return 'Recently';
    const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDownload = async (file: VaultFile) => {
    setDownloadingId(file.id);
    try {
      await downloadFile(file);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteFile(fileToDelete.id);
      setFileToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Action Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>{selectedClient === 'all' ? 'All Files' : `Files for ${selectedClient}`}</span>
            <span className="text-sm font-normal text-[#64748B] bg-white px-2.5 py-0.5 rounded-full border border-[#CBD5E1]">
              {sortedFiles.length} {sortedFiles.length === 1 ? 'file' : 'files'}
            </span>
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Secure client files, design assets, and deliverable packages
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {files.length === 0 && onSeedDemoFiles && (
            <button
              onClick={onSeedDemoFiles}
              className="px-3.5 py-2 text-sm font-medium text-[#475569] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#475569]" />
              <span>Load Sample Files</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 text-sm font-medium text-white bg-[#475569] hover:bg-[#334155] rounded-lg transition-all shadow-sm shadow-slate-900/20 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#CBD5E1] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by file name, client, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] bg-[#F1F5F9]/50 text-[#0F172A] placeholder-[#94A3B8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#0F172A]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#475569]"
            >
              <option value="date-desc">Upload Date (Newest first)</option>
              <option value="date-asc">Upload Date (Oldest first)</option>
              <option value="name-asc">File Name (A - Z)</option>
              <option value="size-desc">File Size (Largest first)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-[#64748B] mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-[#94A3B8]" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-[#475569] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#CBD5E1]/60 hover:text-[#0F172A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Files Table */}
      {sortedFiles.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#CBD5E1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#64748B]">
              <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-xs uppercase font-semibold text-[#64748B] tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    File Name
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Client / Project
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    File Size
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Upload Date
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Uploaded By
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBD5E1]/60">
                {sortedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-[#F1F5F9]/80 transition-colors group"
                  >
                    {/* File Name + Icon */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">{getFileIcon(file)}</div>
                        <div className="max-w-[280px]">
                          <button
                            onClick={() => onPreviewFile(file)}
                            className="font-medium text-[#0F172A] hover:text-[#475569] transition-colors truncate block text-left font-sans cursor-pointer"
                            title={file.name}
                          >
                            {file.name}
                          </button>
                          {file.notes && (
                            <p className="text-xs text-[#64748B] truncate max-w-[240px]">
                              {file.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getCategoryBadge(file.category)}
                    </td>

                    {/* Client Name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#CBD5E1]">
                        <FolderOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
                        {file.clientName || 'General'}
                      </span>
                    </td>

                    {/* File Size */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-[#64748B]">
                      {formatFileSize(file.size)}
                    </td>

                    {/* Upload Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{formatDate(file.createdAt)}</span>
                      </div>
                    </td>

                    {/* Uploaded By */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#0F172A]">
                        <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{file.uploadedBy}</span>
                        {file.uploadedByRole === 'client' && (
                          <span className="text-[10px] bg-[#F1F5F9] text-[#475569] px-1.5 py-0.2 rounded border border-[#CBD5E1] font-medium">
                            Client
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPreviewFile(file)}
                          title="Preview File"
                          className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownload(file)}
                          disabled={downloadingId === file.id}
                          title="Download File"
                          className="p-1.5 text-[#64748B] hover:text-[#475569] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                        >
                          {downloadingId === file.id ? (
                            <div className="w-4 h-4 border-2 border-[#CBD5E1] border-t-[#475569] rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setFileToDelete(file)}
                          title="Delete File"
                          className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#CBD5E1] p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] mx-auto flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">
            {searchQuery || selectedCategory !== 'all' || selectedClient !== 'all'
              ? 'No matching files found'
              : 'Your vault is ready for files'}
          </h3>
          <p className="text-sm text-[#64748B] mb-6">
            {searchQuery || selectedCategory !== 'all' || selectedClient !== 'all'
              ? 'Try adjusting your search criteria or resetting the category filter.'
              : 'Upload design packages, PDFs, contracts, and revisions to share securely with your clients.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white font-medium text-sm transition-all shadow-sm shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload First File</span>
            </button>

            {files.length === 0 && onSeedDemoFiles && (
              <button
                onClick={onSeedDemoFiles}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#475569]" />
                <span>Load Sample Files</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Delete File</h3>
                <p className="text-xs text-[#64748B]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-[#64748B] mb-5">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-[#0F172A] break-all">
                "{fileToDelete.name}"
              </span>{' '}
              from your vault? Clients will no longer be able to download or view this file.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
