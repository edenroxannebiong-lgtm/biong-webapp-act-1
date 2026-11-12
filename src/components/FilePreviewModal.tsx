import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Calendar,
  HardDrive,
  User,
  Tag,
  Briefcase,
  Share2,
  Check,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File,
  ShieldCheck,
} from 'lucide-react';
import { VaultFile } from '../types';
import { formatFileSize, downloadFile, getFileBlob } from '../services/storageService';

interface FilePreviewModalProps {
  file: VaultFile | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    if (file) {
      getFileBlob(file.id).then((blob) => {
        if (blob) {
          url = URL.createObjectURL(blob);
          setBlobUrl(url);
        } else if (file.previewUrl) {
          setBlobUrl(file.previewUrl);
        }
      });
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  if (!file) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFile(file);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const portalUrl = `${window.location.origin}?client=${encodeURIComponent(
      file.clientName || 'General'
    )}`;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateVal: any): string => {
    if (!dateVal) return 'Recently';
    const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleString();
  };

  const isImage = file.type.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#CBD5E1] flex items-center justify-between bg-[#F1F5F9]/70">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] flex items-center justify-center shrink-0">
              {isImage ? <FileImage className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-[#0F172A] text-base truncate" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-[#64748B] font-mono">
                {formatFileSize(file.size)} • {file.type || 'Binary Document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#CBD5E1]/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visual Preview Box */}
          <div className="bg-[#F1F5F9] rounded-xl border border-[#CBD5E1] flex items-center justify-center min-h-[220px] max-h-[340px] overflow-hidden p-3">
            {isImage && blobUrl ? (
              <img
                src={blobUrl}
                alt={file.name}
                className="max-h-[300px] max-w-full rounded-lg object-contain shadow-xs"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-[#CBD5E1] text-[#475569] mx-auto flex items-center justify-center">
                  <FileText className="w-8 h-8 text-[#475569]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#0F172A] text-sm">{file.name}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Verified secure file in ClientVault encrypted container
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Integrity verified</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1]">
              <span className="text-[#64748B] block font-medium flex items-center gap-1 mb-1">
                <Tag className="w-3.5 h-3.5 text-[#94A3B8]" /> Category
              </span>
              <span className="font-semibold text-[#0F172A] capitalize">{file.category}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1]">
              <span className="text-[#64748B] block font-medium flex items-center gap-1 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" /> Client Portal
              </span>
              <span className="font-semibold text-[#0F172A] truncate block">
                {file.clientName || 'General'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1]">
              <span className="text-[#64748B] block font-medium flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-[#94A3B8]" /> Uploaded By
              </span>
              <span className="font-semibold text-[#0F172A] truncate block">
                {file.uploadedBy} ({file.uploadedByRole})
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1]">
              <span className="text-[#64748B] block font-medium flex items-center gap-1 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-[#94A3B8]" /> Size
              </span>
              <span className="font-semibold text-[#0F172A] font-mono">
                {formatFileSize(file.size)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] col-span-2 sm:col-span-2">
              <span className="text-[#64748B] block font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" /> Uploaded At
              </span>
              <span className="font-semibold text-[#0F172A]">{formatDate(file.createdAt)}</span>
            </div>
          </div>

          {/* Notes */}
          {file.notes && (
            <div className="p-3.5 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-xs text-[#0F172A]">
              <span className="font-semibold text-[#0F172A] block mb-0.5">Instructions & Notes:</span>
              <p className="whitespace-pre-wrap text-[#64748B]">{file.notes}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#CBD5E1] flex items-center justify-between bg-[#F1F5F9]/50">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 text-xs font-medium text-[#475569] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Copy Client Portal Link</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2 text-sm font-medium text-white bg-[#475569] hover:bg-[#334155] rounded-lg transition-all shadow-md shadow-slate-900/20 flex items-center gap-2 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
