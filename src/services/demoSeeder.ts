import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { storeFileBlob } from './storageService';
import { VaultFile } from '../types';

export async function seedDemoVaultFiles(userId: string, uploaderName: string): Promise<void> {
  // Helper to generate a colorful sample image blob
  const generateSampleImageBlob = (title: string, color: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 800, 500);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 500);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 800; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 500);
          ctx.stroke();
        }
        for (let y = 0; y < 500; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(800, y);
          ctx.stroke();
        }

        // Title text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(title, 400, 240);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px sans-serif';
        ctx.fillText('CVault • Verified Client Deliverable', 400, 280);
      }
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });
  };

  const sampleItems = [
    {
      id: 'demo_file_brand_guide_' + userId.slice(0, 8),
      name: 'Acme_Brand_Identity_Guidelines_v2.4.pdf',
      size: 2457600, // 2.4 MB
      type: 'application/pdf',
      category: 'design' as const,
      clientName: 'Acme Corp',
      notes: 'Approved visual identity, hex color codes, and vector iconography standards.',
      blobContent: 'CVault Sample Deliverable: Acme Brand Guidelines v2.4 PDF contents.',
    },
    {
      id: 'demo_file_hero_concept_' + userId.slice(0, 8),
      name: 'Homepage_Hero_Visual_Concept_v3.png',
      size: 1843200, // 1.8 MB
      type: 'image/png',
      category: 'design' as const,
      clientName: 'Studio Nova',
      notes: 'High-resolution web hero design iteration for client feedback.',
      isImage: true,
      imageColor: '#475569',
    },
    {
      id: 'demo_file_contract_' + userId.slice(0, 8),
      name: 'Design_Services_Agreement_Signed.pdf',
      size: 420000, // 420 KB
      type: 'application/pdf',
      category: 'contract' as const,
      clientName: 'Acme Corp',
      notes: 'Executed scope of work, milestone timelines, and retainer details.',
      blobContent: 'CVault Verified Legal Document: Design Services Agreement Signed.',
    },
    {
      id: 'demo_file_logos_' + userId.slice(0, 8),
      name: 'Vector_Logo_Kit_SVG_PNG_Exports.zip',
      size: 4194304, // 4.1 MB
      type: 'application/zip',
      category: 'asset' as const,
      clientName: 'Bold Horizon Media',
      notes: 'Complete logo suite with dark, light, monochrome, and favicon exports.',
      blobContent: 'CVault Archive: Vector Logo Kit ZIP archive files.',
    },
  ];

  for (const item of sampleItems) {
    let blob: Blob;
    let previewUrl = '';
    if (item.isImage) {
      blob = await generateSampleImageBlob(item.name, item.imageColor);
      previewUrl = URL.createObjectURL(blob);
    } else {
      blob = new Blob([item.blobContent || 'CVault Deliverable'], { type: item.type });
    }

    // Save in IndexedDB
    await storeFileBlob(item.id, blob);

    // Save in Firestore
    const docRef = doc(db, 'files', item.id);
    await setDoc(docRef, {
      id: item.id,
      userId,
      name: item.name,
      size: item.size,
      type: item.type,
      category: item.category,
      clientName: item.clientName,
      uploadedBy: uploaderName,
      uploadedByRole: 'freelancer',
      downloadCount: 1,
      notes: item.notes,
      previewUrl: previewUrl.startsWith('data:') ? previewUrl : '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
