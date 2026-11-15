import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { JournalEntry, MoodTag } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateReadable(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function generateEntryId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `entry_${Date.now()}_${rand}`;
}

export async function saveJournalEntry(
  userId: string,
  payload: {
    id?: string;
    date: string;
    title: string;
    mood: MoodTag;
    content: string;
  }
): Promise<string> {
  const cleanTitle = payload.title.trim().slice(0, 150);
  const cleanContent = payload.content.trim().slice(0, 10000);
  const cleanDate = payload.date.trim();

  if (!cleanTitle || !cleanContent || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(cleanDate)) {
    throw new Error('Please enter a valid date, title, and journal reflection.');
  }

  if (payload.id) {
    const entryPath = `users/${userId}/entries/${payload.id}`;
    const entryRef = doc(db, 'users', userId, 'entries', payload.id);
    try {
      await updateDoc(entryRef, {
        date: cleanDate,
        title: cleanTitle,
        mood: payload.mood,
        content: cleanContent,
        updatedAt: serverTimestamp(),
      });
      return payload.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, entryPath);
    }
  } else {
    const entryId = generateEntryId();
    const entryPath = `users/${userId}/entries/${entryId}`;
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    try {
      await setDoc(entryRef, {
        id: entryId,
        userId,
        date: cleanDate,
        title: cleanTitle,
        mood: payload.mood,
        content: cleanContent,
        isFavorite: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return entryId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, entryPath);
    }
  }
}

export async function toggleEntryFavorite(
  userId: string,
  entryId: string,
  isFavorite: boolean
): Promise<void> {
  const entryPath = `users/${userId}/entries/${entryId}`;
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  try {
    await updateDoc(entryRef, {
      isFavorite: Boolean(isFavorite),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, entryPath);
  }
}

export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  const entryPath = `users/${userId}/entries/${entryId}`;
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  try {
    await deleteDoc(entryRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, entryPath);
  }
}

export async function ensureStarterEntry(userId: string, displayName: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data()?.starterSeeded === true) {
      return false;
    }

    const todayStr = getTodayDateString();
    const starterId = `entry_starter_${userId.slice(0, 12)}`;
    const starterRef = doc(db, 'users', userId, 'entries', starterId);

    const friendlyName = displayName.split(' ')[0] || 'there';
    await setDoc(starterRef, {
      id: starterId,
      userId,
      date: todayStr,
      title: 'First Page in Keepsake',
      mood: 'Chill' as MoodTag,
      content: `Hi ${friendlyName}, welcome to your private Keepsake journal.\n\nUse this quiet space to jot down a quick highlight from your day, check in with how you are feeling, or reflect on what is on your mind. Every entry colors your calendar so you can see your month at a glance.\n\nFeel free to edit or delete this starter note anytime, or click any date on the calendar to begin writing.`,
      isFavorite: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        starterSeeded: true,
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (error) {
    console.warn('Could not create starter entry:', error);
    return false;
  }
}

export function calculateWritingStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  const uniqueDates = new Set(entries.map((e) => e.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  // Streak is active if user wrote today OR yesterday
  let cursor: Date;
  if (uniqueDates.has(todayStr)) {
    cursor = new Date(today);
  } else if (uniqueDates.has(yesterdayStr)) {
    cursor = new Date(yesterday);
  } else {
    return 0;
  }

  let streak = 0;
  while (uniqueDates.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
