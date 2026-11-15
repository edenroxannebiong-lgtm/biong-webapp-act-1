import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';

function generateDeadlineId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `deadline_${Date.now()}_${rand}`;
}

export async function saveDeadline(
  userId: string,
  payload: {
    id?: string;
    title: string;
    subject?: string;
    dueDate: string;
    notes?: string;
    completed?: boolean;
  }
): Promise<string> {
  const cleanTitle = payload.title.trim().slice(0, 150);
  const cleanSubject = (payload.subject || '').trim().slice(0, 100);
  const cleanNotes = (payload.notes || '').trim().slice(0, 2000);
  const cleanDueDate = payload.dueDate.trim();

  if (!cleanTitle || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(cleanDueDate)) {
    throw new Error('Please enter a valid title and due date.');
  }

  if (payload.id) {
    const deadlinePath = `users/${userId}/deadlines/${payload.id}`;
    const deadlineRef = doc(db, 'users', userId, 'deadlines', payload.id);
    try {
      await updateDoc(deadlineRef, {
        title: cleanTitle,
        subject: cleanSubject,
        dueDate: cleanDueDate,
        notes: cleanNotes,
        updatedAt: serverTimestamp(),
      });
      return payload.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, deadlinePath);
    }
  } else {
    const deadlineId = generateDeadlineId();
    const deadlinePath = `users/${userId}/deadlines/${deadlineId}`;
    const deadlineRef = doc(db, 'users', userId, 'deadlines', deadlineId);
    try {
      await setDoc(deadlineRef, {
        id: deadlineId,
        userId,
        title: cleanTitle,
        subject: cleanSubject,
        dueDate: cleanDueDate,
        notes: cleanNotes,
        completed: Boolean(payload.completed ?? false),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return deadlineId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, deadlinePath);
    }
  }
}

export async function toggleDeadlineCompleted(
  userId: string,
  deadlineId: string,
  completed: boolean
): Promise<void> {
  const deadlinePath = `users/${userId}/deadlines/${deadlineId}`;
  const deadlineRef = doc(db, 'users', userId, 'deadlines', deadlineId);
  try {
    await updateDoc(deadlineRef, {
      completed: Boolean(completed),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, deadlinePath);
  }
}

export async function deleteDeadline(userId: string, deadlineId: string): Promise<void> {
  const deadlinePath = `users/${userId}/deadlines/${deadlineId}`;
  const deadlineRef = doc(db, 'users', userId, 'deadlines', deadlineId);
  try {
    await deleteDoc(deadlineRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, deadlinePath);
  }
}

export interface DeadlineDueInfo {
  label: string;
  diffDays: number;
  isUrgent: boolean;
}

export function getDeadlineDueInfo(dueDate: string, completed: boolean): DeadlineDueInfo {
  const parts = dueDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return { label: dueDate, diffDays: 999, isUrgent: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(parts[0], parts[1] - 1, parts[2]);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const datePart = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(due.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });

  let relativePart: string;
  if (diffDays === 0) {
    relativePart = 'today';
  } else if (diffDays === 1) {
    relativePart = 'in 1 day';
  } else if (diffDays > 1) {
    relativePart = `in ${diffDays} days`;
  } else if (diffDays === -1) {
    relativePart = '1 day overdue';
  } else {
    relativePart = `${Math.abs(diffDays)} days overdue`;
  }

  return {
    label: `${relativePart}, ${datePart}`,
    diffDays,
    isUrgent: !completed && diffDays <= 3,
  };
}
