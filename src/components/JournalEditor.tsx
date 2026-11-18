import React, { useEffect, useState } from 'react';
import { Calendar, Check, Plus, X, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getMoodConfig, JournalEntry, MOOD_TAGS, MoodTag } from '../types';
import { formatDateReadable } from '../services/journalService';
import { MoodIcon } from './MoodIcon';

interface JournalEditorProps {
  selectedDate: string;
  entriesForSelectedDate: JournalEntry[];
  editingEntry: JournalEntry | null;
  onSelectEntryToEdit: (entry: JournalEntry) => void;
  onStartNewEntry: () => void;
  onSaveEntry: (data: {
    id?: string;
    date: string;
    title: string;
    mood: MoodTag;
    content: string;
  }) => Promise<void>;
  onCancelEdit: () => void;
  loading?: boolean;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  selectedDate,
  entriesForSelectedDate,
  editingEntry,
  onSelectEntryToEdit,
  onStartNewEntry,
  onSaveEntry,
  onCancelEdit,
  loading = false,
}) => {
  const { theme } = useTheme();
  const moodConfig = getMoodConfig(theme);

  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<MoodTag>('Happy');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setMood(editingEntry.mood);
      setContent(editingEntry.content);
      setError(null);
    } else {
      setTitle('');
      setMood('Happy');
      setContent('');
      setError(null);
    }
  }, [editingEntry, selectedDate]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please add a short title for this entry.');
      return;
    }
    if (!content.trim()) {
      setError('Please write a few thoughts before saving.');
      return;
    }

    setSaving(true);
    try {
      await onSaveEntry({
        id: editingEntry?.id,
        date: selectedDate,
        title: title.trim(),
        mood,
        content: content.trim(),
      });
      if (!editingEntry) {
        setTitle('');
        setContent('');
      }
    } catch (err: any) {
      setError(err.message || 'Could not save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section
        aria-label="Loading journal editor"
        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 flex flex-col justify-between h-full transition-colors"
      >
        <div className="space-y-5">
          <div className="pb-4 border-b border-[var(--border-primary)] space-y-2">
            <div className="h-3.5 w-44 rounded-md shimmer-box" />
            <div className="h-7 w-56 rounded-lg shimmer-box" />
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-16 rounded-md shimmer-box" />
            <div className="h-10 w-full rounded-xl shimmer-box" />
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded-md shimmer-box" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOOD_TAGS.map((tag) => (
                <div key={tag} className="h-9 rounded-xl shimmer-box" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3.5 w-40 rounded-md shimmer-box" />
            <div className="h-40 w-full rounded-xl shimmer-box" />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border-primary)] flex items-center justify-between gap-3">
          <div className="h-3.5 w-44 rounded-md shimmer-box" />
          <div className="h-9 w-28 rounded-xl shimmer-box" />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Journal editor"
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 flex flex-col justify-between h-full transition-colors"
    >
      <div>
        {/* Editor Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-primary)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateReadable(selectedDate)}</span>
              <span aria-hidden="true">·</span>
              <span>{editingEntry ? 'Editing entry' : 'New reflection'}</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              {editingEntry ? 'Edit Your Reflection' : 'How was your day?'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {editingEntry && (
              <button
                type="button"
                onClick={onStartNewEntry}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>
            )}
          </div>
        </div>

        {/* If multiple entries exist on this selected date, quick switch */}
        {entriesForSelectedDate.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>Entries on this day:</span>
            {entriesForSelectedDate.map((entry) => {
              const isActive = editingEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSelectEntryToEdit(entry)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer truncate max-w-[180px] ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] font-semibold'
                      : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-primary)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  {entry.title}
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--bg-error)] border border-[var(--border-error)] text-xs text-[var(--text-error)] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Journal Form */}
        <form id="journal-editor-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title Input */}
          <div>
            <label
              htmlFor="entry-title"
              className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5"
            >
              Title
            </label>
            <input
              id="entry-title"
              type="text"
              maxLength={150}
              placeholder="Give this day a short title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              required
            />
          </div>

          {/* Mood Selector */}
          <div>
            <span className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Mood Tag
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOOD_TAGS.map((tag) => {
                const cfg = moodConfig[tag];
                const isSelected = mood === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMood(tag)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: cfg.badgeBg,
                            borderColor: cfg.badgeBorder,
                            color: cfg.badgeText,
                          }
                        : undefined
                    }
                    className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'ring-2 ring-[var(--text-primary)]/20 font-semibold'
                        : 'bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border shrink-0"
                      style={{
                        backgroundColor: cfg.dotColor,
                        borderColor: cfg.dotBorder,
                      }}
                    />
                    <MoodIcon mood={tag} className="w-3.5 h-3.5 shrink-0" />
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="entry-content"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                Daily Thoughts & Highlights
              </label>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <textarea
              id="entry-content"
              rows={6}
              maxLength={10000}
              placeholder="Write freely about what happened today, a small win, or anything on your mind..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-3 text-sm leading-relaxed rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] resize-y min-h-[150px]"
              required
            />
          </div>
        </form>
      </div>

      {/* Form Action Footer */}
      <div className="mt-5 pt-4 border-t border-[var(--border-primary)] flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-secondary)]">
          {editingEntry ? 'Updating saved entry' : 'Saved privately to your account'}
        </p>

        <div className="flex items-center gap-2">
          {editingEntry && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
              className="px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
          <button
            type="submit"
            form="journal-editor-form"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-60 rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
