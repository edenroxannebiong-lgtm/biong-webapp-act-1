import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Clock,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Deadline } from '../types';
import { getTodayDateString } from '../services/journalService';
import { getDeadlineDueInfo } from '../services/deadlineService';

interface DeadlinesPageProps {
  deadlines: Deadline[];
  loading: boolean;
  onSaveDeadline: (data: {
    id?: string;
    title: string;
    subject?: string;
    dueDate: string;
    notes?: string;
  }) => Promise<void>;
  onToggleCompleted: (
    deadline: Deadline,
    origin?: { x: number; y: number }
  ) => Promise<void>;
  onDeleteDeadline: (deadlineId: string) => Promise<void>;
}

type DeadlineFilter = 'upcoming' | 'done' | 'all';

export const DeadlinesPage: React.FC<DeadlinesPageProps> = ({
  deadlines,
  loading,
  onSaveDeadline,
  onToggleCompleted,
  onDeleteDeadline,
}) => {
  const [filter, setFilter] = useState<DeadlineFilter>('upcoming');
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState(() => getTodayDateString());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deadlinePendingDelete, setDeadlinePendingDelete] = useState<Deadline | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!deadlinePendingDelete) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deletingId) {
        setDeadlinePendingDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deadlinePendingDelete, deletingId]);

  const resetForm = () => {
    setEditingDeadline(null);
    setTitle('');
    setSubject('');
    setDueDate(getTodayDateString());
    setNotes('');
    setFormError(null);
  };

  const handleStartEdit = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setTitle(deadline.title);
    setSubject(deadline.subject || '');
    setDueDate(deadline.dueDate);
    setNotes(deadline.notes || '');
    setFormError(null);
    const titleInput = document.getElementById('deadline-title');
    if (titleInput instanceof HTMLInputElement) {
      titleInput.focus();
      titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a project or assignment title.');
      return;
    }
    if (!dueDate) {
      setFormError('Please choose a due date.');
      return;
    }

    setSaving(true);
    try {
      await onSaveDeadline({
        id: editingDeadline?.id,
        title,
        subject,
        dueDate,
        notes,
      });
      resetForm();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Unable to save deadline.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    deadline: Deadline,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (togglingId === deadline.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setTogglingId(deadline.id);
    try {
      await onToggleCompleted(deadline, origin);
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deadlinePendingDelete) return;
    const targetId = deadlinePendingDelete.id;
    setDeletingId(targetId);
    try {
      await onDeleteDeadline(targetId);
      if (editingDeadline?.id === targetId) {
        resetForm();
      }
      setDeadlinePendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const upcomingCount = useMemo(
    () => deadlines.filter((d) => !d.completed).length,
    [deadlines]
  );
  const doneCount = useMemo(
    () => deadlines.filter((d) => d.completed).length,
    [deadlines]
  );

  const filteredDeadlines = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (filter === 'upcoming') return !d.completed;
        if (filter === 'done') return d.completed;
        return true;
      })
      .sort((a, b) => {
        if (filter === 'all' && a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (filter === 'done') {
          if (a.dueDate !== b.dueDate) return b.dueDate.localeCompare(a.dueDate);
        } else {
          if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        }
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
  }, [deadlines, filter]);

  return (
    <section aria-label="Student deadlines" className="space-y-6">
      {/* Header & Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
              Deadlines
            </h1>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              {upcomingCount} upcoming
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Keep track of assignments, projects, and upcoming exam dates.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              filter === 'upcoming'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('done')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              filter === 'done'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Done ({doneCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              filter === 'all'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All ({deadlines.length})
          </button>
        </div>
      </div>

      {/* Add / Edit Deadline Form Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {editingDeadline ? 'Edit Deadline' : 'Add a Deadline'}
          </h2>
          {editingDeadline && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-error)] border border-[var(--border-error)] text-[var(--text-error)] text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label
                htmlFor="deadline-title"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Project or Assignment Title
              </label>
              <input
                id="deadline-title"
                type="text"
                maxLength={150}
                placeholder="e.g., History Research Paper"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="deadline-subject"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Subject <span className="font-normal opacity-80">(optional)</span>
              </label>
              <input
                id="deadline-subject"
                type="text"
                maxLength={100}
                placeholder="e.g., HIST 102"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="deadline-due-date"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Due Date
              </label>
              <input
                id="deadline-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] tabular-nums"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="deadline-notes"
              className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
            >
              Notes <span className="font-normal opacity-80">(optional — requirements or reminders)</span>
            </label>
            <textarea
              id="deadline-notes"
              rows={2}
              maxLength={2000}
              placeholder="e.g., Submit PDF on Canvas, include 5 primary sources..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] resize-y leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            {editingDeadline && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--accent-text)]/30 border-t-[var(--accent-text)] rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{editingDeadline ? 'Update Deadline' : 'Add Deadline'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Deadlines List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-4 sm:p-5 space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-md shimmer-box shrink-0" />
                <div className="h-5 w-48 rounded-md shimmer-box" />
                <div className="h-5 w-24 rounded-full shimmer-box" />
              </div>
              <div className="h-4 w-2/3 ml-8 rounded-md shimmer-box" />
            </div>
          ))}
        </div>
      ) : filteredDeadlines.length > 0 ? (
        <div className="space-y-3">
          {filteredDeadlines.map((deadline) => {
            const dueInfo = getDeadlineDueInfo(deadline.dueDate, deadline.completed);
            const isToggling = togglingId === deadline.id;

            return (
              <article
                key={deadline.id}
                style={
                  dueInfo.isUrgent
                    ? { borderColor: 'var(--border-urgent)' }
                    : undefined
                }
                className={`bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-4 sm:p-5 transition-colors hover:border-[var(--border-strong)] ${
                  deadline.completed ? 'opacity-80' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={deadline.completed}
                      aria-label={
                        deadline.completed
                          ? `Mark "${deadline.title}" as not done`
                          : `Mark "${deadline.title}" as done`
                      }
                      disabled={isToggling}
                      onClick={(e) => handleToggle(deadline, e)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-60 ${
                        deadline.completed
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-text)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-strong)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {deadline.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-display text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-snug ${
                            deadline.completed ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {deadline.title}
                        </h3>

                        {deadline.subject && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)] ${
                              deadline.completed ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {deadline.subject}
                          </span>
                        )}

                        {/* Due Tag */}
                        <span
                          style={
                            dueInfo.isUrgent
                              ? {
                                  backgroundColor: 'var(--bg-urgent)',
                                  borderColor: 'var(--border-urgent)',
                                  color: 'var(--text-urgent)',
                                }
                              : undefined
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border tabular-nums ${
                            dueInfo.isUrgent
                              ? ''
                              : 'bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)]'
                          } ${deadline.completed ? 'line-through opacity-60' : ''}`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{dueInfo.label}</span>
                        </span>
                      </div>

                      {deadline.notes && (
                        <p
                          className={`text-sm text-[var(--text-primary)]/85 leading-relaxed whitespace-pre-wrap max-w-[75ch] ${
                            deadline.completed ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {deadline.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(deadline)}
                      title="Edit deadline"
                      className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePendingDelete(deadline)}
                      title="Delete deadline"
                      className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-error)] hover:bg-[var(--bg-error)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)] mx-auto flex items-center justify-center mb-3">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-1">
            {filter === 'upcoming'
              ? 'No upcoming deadlines'
              : filter === 'done'
              ? 'No completed deadlines yet'
              : 'No deadlines added yet'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {filter === 'upcoming'
              ? 'You are all caught up! Use the form above whenever a new assignment or project comes up.'
              : filter === 'done'
              ? 'Check off a deadline when you finish it and it will appear here.'
              : 'Add your first assignment, project, or exam above to start tracking your due dates.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deadlinePendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          style={{ backgroundColor: 'var(--backdrop)' }}
          onClick={() => {
            if (!deletingId) setDeadlinePendingDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-deadline-dialog-title"
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-error)] border border-[var(--border-error)] text-[var(--text-error)] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3
                  id="delete-deadline-dialog-title"
                  className="font-display text-lg font-semibold text-[var(--text-primary)]"
                >
                  Are you sure you want to delete this deadline?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  This deadline will be permanently removed from your Keepsake planner.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] px-3.5 py-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                {getDeadlineDueInfo(deadlinePendingDelete.dueDate, deadlinePendingDelete.completed).label}
                {deadlinePendingDelete.subject ? ` · ${deadlinePendingDelete.subject}` : ''}
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate mt-0.5">
                {deadlinePendingDelete.title}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDeadlinePendingDelete(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 text-sm font-semibold text-white bg-[var(--bg-danger)] hover:bg-[var(--bg-danger-hover)] rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Deadline</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
