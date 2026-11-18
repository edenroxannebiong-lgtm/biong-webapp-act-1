import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  SCHEDULE_COLORS,
  ScheduleCategory,
  ScheduleColor,
} from '../types';

function generateScheduleBlockId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `block_${Date.now()}_${rand}`;
}

const VALID_COLORS = new Set<string>(SCHEDULE_COLORS.map((c) => c.hex));
const VALID_DAYS = new Set<string>(DAYS_OF_WEEK);
const TIME_PATTERN = /^[0-2][0-9]:[0-5][0-9]$/;

export async function saveScheduleBlock(
  userId: string,
  payload: {
    id?: string;
    title: string;
    category: ScheduleCategory;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    location?: string;
    color: ScheduleColor;
  }
): Promise<string> {
  const cleanTitle = payload.title.trim().slice(0, 150);
  const cleanLocation = (payload.location || '').trim().slice(0, 100);
  const cleanStart = payload.startTime.trim();
  const cleanEnd = payload.endTime.trim();

  if (!cleanTitle) {
    throw new Error('Please enter a class or study session title.');
  }
  if (payload.category !== 'Class' && payload.category !== 'Study') {
    throw new Error('Please choose a valid category.');
  }
  if (!VALID_DAYS.has(payload.dayOfWeek)) {
    throw new Error('Please select a valid day of the week.');
  }
  if (!TIME_PATTERN.test(cleanStart) || !TIME_PATTERN.test(cleanEnd)) {
    throw new Error('Please enter valid start and end times.');
  }
  if (cleanStart >= cleanEnd) {
    throw new Error('End time must be after start time.');
  }
  if (!VALID_COLORS.has(payload.color)) {
    throw new Error('Please choose one of the pastel block colors.');
  }

  if (payload.id) {
    const blockPath = `users/${userId}/schedule/${payload.id}`;
    const blockRef = doc(db, 'users', userId, 'schedule', payload.id);
    try {
      await updateDoc(blockRef, {
        title: cleanTitle,
        category: payload.category,
        dayOfWeek: payload.dayOfWeek,
        startTime: cleanStart,
        endTime: cleanEnd,
        location: cleanLocation,
        color: payload.color,
        updatedAt: serverTimestamp(),
      });
      return payload.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, blockPath);
    }
  } else {
    const blockId = generateScheduleBlockId();
    const blockPath = `users/${userId}/schedule/${blockId}`;
    const blockRef = doc(db, 'users', userId, 'schedule', blockId);
    try {
      await setDoc(blockRef, {
        id: blockId,
        userId,
        title: cleanTitle,
        category: payload.category,
        dayOfWeek: payload.dayOfWeek,
        startTime: cleanStart,
        endTime: cleanEnd,
        location: cleanLocation,
        color: payload.color,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return blockId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, blockPath);
    }
  }
}

export async function deleteScheduleBlock(
  userId: string,
  blockId: string
): Promise<void> {
  const blockPath = `users/${userId}/schedule/${blockId}`;
  const blockRef = doc(db, 'users', userId, 'schedule', blockId);
  try {
    await deleteDoc(blockRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, blockPath);
  }
}

export function formatTime12h(timeStr: string): string {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) return timeStr;
  const [hours24, minutes] = parts;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function getDayOfWeekFromDateStr(dateStr: string): DayOfWeek {
  const parts = dateStr.split('-').map(Number);
  const date =
    parts.length === 3 && !parts.some(isNaN)
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date();
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const mondayFirstIdx = jsDay === 0 ? 6 : jsDay - 1;
  return DAYS_OF_WEEK[mondayFirstIdx];
}

export function formatSelectedDayHeading(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
