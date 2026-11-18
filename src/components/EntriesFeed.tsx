import React, { useEffect, useState } from 'react';
import {
  Search,
  Pencil,
  Trash2,
  BookOpenText,
  X,
  PenLine,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getMoodConfig, JournalEntry, MOOD_TAGS, MoodTag } from '../types';
import { formatShortDate } from '../services/journalService';
import { MoodIcon } from './MoodIcon';

interface EntriesFeedProps {
  entries: JournalEntry[];
  loading: boolean;
  selectedMoodFilter: 'all' | MoodTag;
  setSelectedMoodFilter: (mood: 'all' | MoodTag) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  onToggleFavorite: (entry: JournalEntry) => Promise<void>;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onFocusEditor: () => void;
}

export const EntriesFeed: React.FC<EntriesFeedProps> = ({
  entries,
  loading,
  selectedMoodFilter,
  setSelectedMoodFilter,
  showFavoritesOnly,
  setShowFavoritesOnly,
  onToggleFavorite,
  onEditEntry,
  onDeleteEntry,
  onFocusEditor,
}) => {
  const { theme } = useTheme();
  const moodConfig = getMoodConfig(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [entryPendingDelete, setEntryPendingDelete] = useState<JournalEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    if (!entryPendingDelete) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deletingId) {
        setEntryPendingDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entryPendingDelete, deletingId]);

  const filteredEntries = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries
      .filter((entry) => {
        if (showFavoritesOnly && entry.isFavorite !== true) {
          return false;
        }
        if (selectedMoodFilter !== 'all' && entry.mood !== selectedMoodFilter) {
          return false;
        }
        if (q) {
          const matchTitle = entry.title.toLowerCase().includes(q);
          const matchContent = entry.content.toLowerCase().includes(q);
          const matchDate = entry.date.includes(q);
          const matchReadableDate = formatShortDate(entry.date).toLowerCase().includes(q);
          return matchTitle || matchContent || matchDate || matchReadableDate;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
  }, [entries, searchQuery, selectedMoodFilter, showFavoritesOnly]);

  const handleConfirmDelete = async () => {
    if (!entryPendingDelete) return;
    const targetId = entryPendingDelete.id;
    setDeletingId(targetId);
    try {
      await onDeleteEntry(targetId);
      setEntryPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleFavoriteClick = async (entry: JournalEntry) => {
    if (togglingFavoriteId === entry.id) return;
    setTogglingFavoriteId(entry.id);
    try {
      await onToggleFavorite(entry);
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  const hasActiveFilter = Boolean(searchQuery) || selectedMoodFilter !== 'all' || showFavoritesOnly;

  return (
    <section aria-label="Past journal entries" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
            {showFavoritesOnly ? 'My Entries · Favorites' : 'My Entries'}
          </h1>
          <span className="text-xs text-[var(--text-secondary)] tabular-nums">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Quick Mood & Favorites Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedMoodFilter('all');
              setShowFavoritesOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedMoodFilter === 'all' && !showFavoritesOnly
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Moods
          </button>

          <button
            type="button"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              showFavoritesOnly
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <Star
              className="w-3 h-3 shrink-0"
              style={{
                fill: showFavoritesOnly ? 'currentColor' : 'var(--fill-fav)',
                color: showFavoritesOnly ? 'currentColor' : 'var(--text-fav)',
              }}
            />
            <span>Favorites</span>
          </button>

          {MOOD_TAGS.map((mood) => {
            const cfg = moodConfig[mood];
            const isSelected = selectedMoodFilter === mood;
            return (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMoodFilter(isSelected ? 'all' : mood)}
                style={
                  isSelected
                    ? {
                        backgroundColor: cfg.badgeBg,
                        color: cfg.badgeText,
                        borderColor: cfg.badgeBorder,
                      }
                    : undefined
                }
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'ring-1 ring-[var(--text-primary)]/20 font-semibold'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-primary)] hover:bg-[var(--bg-surface-hover)] font-medium'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border shrink-0"
                  style={{
                    backgroundColor: cfg.dotColor,
                    borderColor: cfg.dotBorder,
                  }}
                />
                <span>{mood}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search Entries by title, keyword, or date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-16 py-2.5 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-24 rounded-md shimmer-box" />
                <div className="h-5 w-20 rounded-full shimmer-box" />
              </div>
              <div className="h-5 w-56 rounded-md shimmer-box" />
              <div className="h-14 w-full rounded-xl shimmer-box" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const moodStyle = moodConfig[entry.mood] || moodConfig.Chill;
            const isFavorited = entry.isFavorite === true;
            const isTogglingFavorite = togglingFavoriteId === entry.id;

            return (
              <article
                key={entry.id}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <time
                        dateTime={entry.date}
                        className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums"
                      >
                        {formatShortDate(entry.date)}
                      </time>

                      {/* Mood Badge */}
                      <span
                        style={{
                          backgroundColor: moodStyle.badgeBg,
                          borderColor: moodStyle.badgeBorder,
                          color: moodStyle.badgeText,
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      >
                        <MoodIcon mood={entry.mood} className="w-3 h-3" />
                        <span>{entry.mood}</span>
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] leading-snug">
                      {entry.title}
                    </h3>
                  </div>

                  {/* Favorite, Edit & Delete Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFavoriteClick(entry)}
                      disabled={isTogglingFavorite}
                      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      aria-pressed={isFavorited}
                      title={isFavorited ? 'Remove from favorites' : 'Mark as favorite'}
                      style={
                        isFavorited
                          ? {
                              backgroundColor: 'var(--bg-fav)',
                              borderColor: 'var(--border-fav)',
                              color: 'var(--text-fav)',
                            }
                          : undefined
                      }
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-60 ${
                        isFavorited
                          ? 'hover:brightness-95'
                          : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-fav)] hover:bg-[var(--bg-surface-hover)]'
                      }`}
                    >
                      <Star
                        className="w-4 h-4 transition-transform"
                        style={
                          isFavorited
                            ? { fill: 'var(--fill-fav)', color: 'var(--text-fav)' }
                            : undefined
                        }
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditEntry(entry)}
                      title="Edit entry"
                      className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryPendingDelete(entry)}
                      title="Delete entry"
                      className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-error)] hover:bg-[var(--bg-error)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-[var(--text-primary)]/90 leading-relaxed whitespace-pre-wrap max-w-[75ch]">
                  {entry.content}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)] mx-auto flex items-center justify-center mb-3">
            {showFavoritesOnly ? (
              <Star className="w-6 h-6" />
            ) : (
              <BookOpenText className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-1">
            {showFavoritesOnly && !searchQuery && selectedMoodFilter === 'all'
              ? 'No favorite entries yet'
              : hasActiveFilter
              ? 'No matching entries found'
              : 'Your journal is ready'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-5">
            {showFavoritesOnly && !searchQuery && selectedMoodFilter === 'all'
              ? 'Tap the star icon on any journal entry to save your favorite moments here.'
              : hasActiveFilter
              ? 'Try another keyword or clear your active filters to see your saved reflections.'
              : 'Capture a quiet moment, highlight, or thought from today using the editor on your Dashboard.'}
          </p>

          {hasActiveFilter ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMoodFilter('all');
                setShowFavoritesOnly(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onFocusEditor}
              className="px-4 py-2 text-sm font-semibold text-[var(--accent-text)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>Write First Entry</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {entryPendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          style={{ backgroundColor: 'var(--backdrop)' }}
          onClick={() => {
            if (!deletingId) setEntryPendingDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-entry-dialog-title"
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-error)] border border-[var(--border-error)] text-[var(--text-error)] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3
                  id="delete-entry-dialog-title"
                  className="font-display text-lg font-semibold text-[var(--text-primary)]"
                >
                  Are you sure you want to delete this entry?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  This reflection will be permanently removed from your Keepsake journal.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] px-3.5 py-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                {formatShortDate(entryPendingDelete.date)}
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate mt-0.5">
                {entryPendingDelete.title}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setEntryPendingDelete(null)}
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
                  <span>Delete Entry</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
