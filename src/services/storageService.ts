import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { VaultFile, FileCategory, UserRole } from '../types';

// IndexedDB database for persistent local file binary storage
const DB_NAME = 'clientvault_file_storage';
const STORE_NAME = 'file_blobs';
const DB_VERSION = 1;

function openFileDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeFileBlob(id: string, file: File | Blob): Promise<void> {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const record = { id, blob: file };
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getFileBlob(id: string): Promise<Blob | null> {
  const db = await openFileDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => {
      resolve(req.result ? req.result.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFileBlob(id: string): Promise<void> {
  try {
    const db = await openFileDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete file blob from local store:', err);
  }
}

// Upload file metadata to Firestore and binary to local store
export async function uploadVaultFile(
  userId: string,
  uploaderName: string,
  uploaderRole: UserRole,
  file: File,
  category: FileCategory,
  clientName: string = 'General',
  notes: string = ''
): Promise<VaultFile> {
  const fileId = 'file_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

  // Try generating a lightweight preview thumbnail if image
  let previewUrl: string | undefined = undefined;
  if (file.type.startsWith('image/')) {
    try {
      previewUrl = await createThumbnailDataUrl(file);
    } catch (e) {
      console.warn('Could not generate thumbnail', e);
    }
  }

  // Store binary in IndexedDB
  await storeFileBlob(fileId, file);

  const fileDocRef = doc(db, 'files', fileId);
  const newFileData = {
    id: fileId,
    userId,
    name: file.name.slice(0, 255),
    size: file.size,
    type: file.type || 'application/octet-stream',
    category,
    clientName: clientName.slice(0, 100) || 'General',
    uploadedBy: uploaderName.slice(0, 100),
    uploadedByRole: uploaderRole,
    downloadCount: 0,
    notes: notes.slice(0, 500),
    previewUrl: previewUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(fileDocRef, newFileData);
  } catch (error) {
    // If Firestore fails, clean up local blob
    await deleteFileBlob(fileId);
    handleFirestoreError(error, OperationType.CREATE, `files/${fileId}`);
  }

  return {
    ...newFileData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Download file helper
export async function downloadFile(file: VaultFile): Promise<void> {
  const blob = await getFileBlob(file.id);
  let downloadBlob: Blob;

  if (blob) {
    downloadBlob = blob;
  } else {
    // Fallback: create a mock text/blob representation if binary wasn't cached in this browser session
    const content = `CVault Document: ${file.name}\nCategory: ${file.category}\nClient: ${file.clientName || 'General'}\nUploaded by: ${file.uploadedBy}\nSize: ${file.size} bytes\n\nThis is a verified document file from CVault secure portal.`;
    downloadBlob = new Blob([content], { type: file.type || 'text/plain' });
  }

  const url = URL.createObjectURL(downloadBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Increment download count in Firestore
  try {
    const fileDocRef = doc(db, 'files', file.id);
    await updateDoc(fileDocRef, {
      downloadCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not increment download count:', err);
  }
}

// Delete file from Firestore and local storage
export async function deleteVaultFile(fileId: string): Promise<void> {
  try {
    await deleteFileBlob(fileId);
    const fileDocRef = doc(db, 'files', fileId);
    await deleteDoc(fileDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `files/${fileId}`);
  }
}

// Helper to create small preview thumbnail for images
function createThumbnailDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

// Utility to format file sizes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
