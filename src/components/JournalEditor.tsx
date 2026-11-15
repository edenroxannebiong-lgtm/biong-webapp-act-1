import React, { useEffect, useState } from 'react';
import { Calendar, Check, Plus, X, AlertCircle } from 'lucide-react';
import { JournalEntry, MOOD_CONFIG, MOOD_TAGS, MoodTag } from '../types';
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
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  selectedDate,
  entriesForSelectedDate,
  editingEntry,
  onSelectEntryToEdit,
  onStartNewEntry,
  onSaveEntry,
  onCancelEdit,
}) => {
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

  return (
    <section
      aria-label="Journal editor"
      className="bg-[#FBF3F5] rounded-2xl border border-[#F0C9D3] p-5 sm:p-6 flex flex-col justify-between h-full"
    >
      <div>
        {/* Editor Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#F0C9D3]">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#7B5A66] mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateReadable(selectedDate)}</span>
              <span aria-hidden="true">·</span>
              <span>{editingEntry ? 'Editing entry' : 'New reflection'}</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-[#3F2A32]">
              {editingEntry ? 'Edit Your Reflection' : "How was your day?"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {editingEntry && (
              <button
                type="button"
                onClick={onStartNewEntry}
                className="px-3 py-1.5 text-xs font-medium text-[#7B5A66] hover:text-[#3F2A32] bg-white hover:bg-[#F6E6EA] border border-[#F0C9D3] rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>
            )}
          </div>
        </div>

        {/* If multiple entries exist on this selected date, quick switch */}
        {entriesForSelectedDate.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7B5A66]">
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
                      ? 'bg-[#7B5A66] text-white border-[#7B5A66] font-medium'
                      : 'bg-white text-[#3F2A32] border-[#F0C9D3] hover:bg-[#F6E6EA]'
                  }`}
                >
                  {entry.title}
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#FCE8EC] border border-[#E0A0B2] text-xs text-[#7E2738] flex items-center gap-2">
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
              className="block text-xs font-semibold text-[#3F2A32] mb-1.5"
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
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#F0C9D3] bg-white text-[#3F2A32] placeholder-[#7B5A66]/60 focus:outline-none focus:ring-2 focus:ring-[#7B5A66] focus:border-[#7B5A66]"
              required
            />
          </div>

          {/* Mood Selector */}
          <div>
            <span className="block text-xs font-semibold text-[#3F2A32] mb-1.5">
              Mood Tag
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOOD_TAGS.map((tag) => {
                const cfg = MOOD_CONFIG[tag];
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
                        ? 'ring-2 ring-[#3F2A32]/25 font-semibold'
                        : 'bg-white border-[#F0C9D3] text-[#3F2A32] hover:bg-[#F6E6EA]/70'
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
                className="block text-xs font-semibold text-[#3F2A32]"
              >
                Daily Thoughts & Highlights
              </label>
              <span className="text-xs text-[#7B5A66] tabular-nums">
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
              className="w-full px-3.5 py-3 text-sm leading-relaxed rounded-xl border border-[#F0C9D3] bg-white text-[#3F2A32] placeholder-[#7B5A66]/60 focus:outline-none focus:ring-2 focus:ring-[#7B5A66] focus:border-[#7B5A66] resize-y min-h-[150px]"
              required
            />
          </div>
        </form>
      </div>

      {/* Form Action Footer */}
      <div className="mt-5 pt-4 border-t border-[#F0C9D3] flex items-center justify-between gap-3">
        <p className="text-xs text-[#7B5A66]">
          {editingEntry ? 'Updating saved entry' : 'Saved privately to your account'}
        </p>

        <div className="flex items-center gap-2">
          {editingEntry && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={saving}
              className="px-3.5 py-2 text-sm font-medium text-[#7B5A66] hover:text-[#3F2A32] hover:bg-[#F6E6EA] border border-[#F0C9D3] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
          <button
            type="submit"
            form="journal-editor-form"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#7B5A66] hover:bg-[#654752] disabled:opacity-60 rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
