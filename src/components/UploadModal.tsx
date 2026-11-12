import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Tag,
  Briefcase,
  FileCode,
  FileImage,
  FileArchive,
  File,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadVaultFile, formatFileSize } from '../services/storageService';
import { FileCategory } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  existingClients: string[];
  initialClient?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  existingClients,
  initialClient,
}) => {
  const { user, profile } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<FileCategory>('design');
  const [clientName, setClientName] = useState<string>(
    initialClient && initialClient !== 'all' ? initialClient : ''
  );
  const [newClientInput, setNewClientInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setErrorMessage(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('You must be signed in to upload files.');
      return;
    }
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one file to upload.');
      return;
    }

    const assignedClient = (clientName === '__new__' ? newClientInput : clientName).trim() || 'General';

    setIsUploading(true);
    setUploadProgress(15);
    setErrorMessage(null);

    try {
      const uploaderName = profile?.displayName || user.displayName || user.email || 'User';
      const uploaderRole = profile?.role || 'freelancer';

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await uploadVaultFile(
          user.uid,
          uploaderName,
          uploaderRole,
          file,
          category,
          assignedClient,
          notes
        );
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Reset state and notify
      setSelectedFiles([]);
      setNotes('');
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (file.type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (file.type.includes('zip') || file.type.includes('compressed'))
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    if (file.type.includes('code') || file.type.includes('javascript') || file.type.includes('json'))
      return <FileCode className="w-5 h-5 text-emerald-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#CBD5E1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Upload to ClientVault</h3>
              <p className="text-xs text-[#64748B]">
                Securely store and share files with your clients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#475569] bg-[#F1F5F9] scale-[1.01]'
                : 'border-[#CBD5E1] hover:border-[#475569] bg-[#F1F5F9]/50 hover:bg-[#F1F5F9]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">
              Drag and drop files here, or <span className="text-[#475569] underline font-bold">browse</span>
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              Supports images, PDFs, design files, archives, and documents up to 50MB
            </p>
          </div>

          {/* Selected Files List Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span>Selected Files ({selectedFiles.length})</span>
                <span>
                  Total: {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-[#F1F5F9] rounded-xl border border-[#CBD5E1]">
                {selectedFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon(f)}
                      <span className="font-medium truncate max-w-[260px]">{f.name}</span>
                      <span className="text-[#64748B] font-mono">({formatFileSize(f.size)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="text-[#64748B] hover:text-red-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category & Client Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FileCategory)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] bg-white text-[#0F172A]"
              >
                <option value="design">Design Deliverable</option>
                <option value="document">Document / PDF</option>
                <option value="asset">Brand Asset / Logo</option>
                <option value="contract">Agreement & Invoice</option>
                <option value="feedback">Client Feedback</option>
                <option value="other">General / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
                Client or Project
              </label>
              <select
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] bg-white text-[#0F172A]"
              >
                <option value="">General (No specific client)</option>
                {existingClients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
                <option value="__new__">+ New Client Portal...</option>
              </select>
            </div>
          </div>

          {/* New Client input if requested */}
          {clientName === '__new__' && (
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1">
                New Client Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corporation, Studio Nova"
                value={newClientInput}
                onChange={(e) => setNewClientInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] bg-white text-[#0F172A]"
                required
              />
            </div>
          )}

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1">
              File Notes or Instructions (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="e.g. Approved logo variations in vector and raster formats for review"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#475569] resize-none bg-white text-[#0F172A] placeholder-[#94A3B8]"
            />
          </div>

          {/* Upload Progress Bar if uploading */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-medium">Uploading and encrypting to vault...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#CBD5E1]">
                <div
                  className="bg-[#475569] h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#CBD5E1]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="px-5 py-2 text-sm font-medium text-white bg-[#475569] hover:bg-[#334155] disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all shadow-md shadow-slate-900/20 flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
