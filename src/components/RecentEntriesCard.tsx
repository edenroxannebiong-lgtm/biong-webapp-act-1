import React from 'react';
import { ArrowRight, BookOpenText, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getMoodConfig, JournalEntry } from '../types';
import { formatShortDate } from '../services/journalService';
import { MoodIcon } from './MoodIcon';

interface RecentEntriesCardProps {
  entries: JournalEntry[];
  loading: boolean;
  onViewAll: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
}

export const RecentEntriesCard: React.FC<RecentEntriesCardProps> = ({
  entries,
  loading,
  onViewAll,
  onSelectEntry,
}) => {
  const { theme } = useTheme();
  const moodConfig = getMoodConfig(theme);

  const recentEntries = React.useMemo(() => {
    return [...entries]
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      })
      .slice(0, 3);
  }, [entries]);

  return (
    <section
      aria-label="Recent entries"
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            Recent Entries
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Your latest reflections at a glance
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-4 space-y-2.5"
            >
              <div className="h-3.5 w-24 rounded-md shimmer-box" />
              <div className="h-4 w-3/4 rounded-md shimmer-box" />
              <div className="h-5 w-20 rounded-full shimmer-box" />
            </div>
          ))}
        </div>
      ) : recentEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentEntries.map((entry) => {
            const moodStyle = moodConfig[entry.mood] || moodConfig.Chill;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelectEntry(entry)}
                className="text-left rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] hover:border-[var(--border-strong)] p-4 transition-colors cursor-pointer flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <time
                    dateTime={entry.date}
                    className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums"
                  >
                    {formatShortDate(entry.date)}
                  </time>
                  {entry.isFavorite && (
                    <Star
                      className="w-3.5 h-3.5 shrink-0"
                      style={{
                        fill: 'var(--fill-fav)',
                        color: 'var(--text-fav)',
                      }}
                    />
                  )}
                </div>

                <h3 className="font-display text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
                  {entry.title}
                </h3>

                <div>
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
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-6 text-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)] mx-auto flex items-center justify-center mb-2">
            <BookOpenText className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">No entries yet</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Write your first reflection above and it will appear here.
          </p>
        </div>
      )}
    </section>
  );
};
