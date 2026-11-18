import React from 'react';
import {
  BookHeart,
  LayoutDashboard,
  BookOpenText,
  CalendarClock,
  CalendarRange,
  Flame,
  LogOut,
  PenLine,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Deadline,
  getMoodConfig,
  JournalEntry,
  MOOD_TAGS,
  MoodTag,
  ScheduleBlock,
} from '../types';
import { MoodIcon } from './MoodIcon';

interface SidebarProps {
  activeView: 'dashboard' | 'entries' | 'deadlines' | 'schedule';
  setActiveView: (view: 'dashboard' | 'entries' | 'deadlines' | 'schedule') => void;
  selectedMoodFilter: 'all' | MoodTag;
  setSelectedMoodFilter: (mood: 'all' | MoodTag) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  entries: JournalEntry[];
  deadlines: Deadline[];
  scheduleBlocks: ScheduleBlock[];
  streakCount: number;
  viewedMonth: Date;
  onWriteToday: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedMoodFilter,
  setSelectedMoodFilter,
  showFavoritesOnly,
  setShowFavoritesOnly,
  entries,
  deadlines,
  scheduleBlocks,
  streakCount,
  viewedMonth,
  onWriteToday,
}) => {
  const { profile, user, signOutUser } = useAuth();
  const { theme } = useTheme();
  const moodConfig = getMoodConfig(theme);

  const targetYear = viewedMonth.getFullYear();
  const targetMonth = viewedMonth.getMonth();
  const monthPrefix = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
  const monthLabel = viewedMonth.toLocaleDateString('en-US', { month: 'long' });

  const monthEntries = entries.filter((entry) => entry.date.startsWith(monthPrefix));
  const favoritesCount = entries.filter((entry) => entry.isFavorite === true).length;
  const upcomingDeadlinesCount = deadlines.filter((d) => !d.completed).length;

  const moodCounts = MOOD_TAGS.reduce((acc, mood) => {
    acc[mood] = monthEntries.filter((e) => e.mood === mood).length;
    return acc;
  }, {} as Record<MoodTag, number>);

  const maxMoodCount = Math.max(1, ...Object.values(moodCounts));

  const displayName = profile?.displayName || user?.displayName || 'Journaler';
  const email = profile?.email || user?.email || '';

  return (
    <aside className="w-72 bg-[var(--bg-card)] text-[var(--text-primary)] flex flex-col h-screen border-r border-[var(--border-primary)] shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-text)] shrink-0">
            <BookHeart className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-[var(--text-primary)] tracking-tight leading-none">
              Keepsake
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Daily Diary & Reflections
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onWriteToday}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <PenLine className="w-4 h-4 shrink-0" />
          <span>Write Today's Entry</span>
        </button>
      </div>

      {/* Scrollable Middle Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {/* Writing Streak & Entry Counter */}
        <div className="px-2 py-2.5 border-y border-[var(--border-primary)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
            <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {streakCount} day streak
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] tabular-nums">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main navigation" className="space-y-1">
          <p className="px-2 pb-1 text-xs font-semibold text-[var(--text-secondary)]">Pages</p>
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'bg-[var(--bg-active-nav)] text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('entries')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'entries'
                ? 'bg-[var(--bg-active-nav)] text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpenText className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span>My Entries</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              {entries.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('deadlines')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'deadlines'
                ? 'bg-[var(--bg-active-nav)] text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CalendarClock className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span>Deadlines</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              {upcomingDeadlinesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('schedule')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'schedule'
                ? 'bg-[var(--bg-active-nav)] text-[var(--text-primary)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CalendarRange className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span>Schedule</span>
            </div>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              {scheduleBlocks.length}
            </span>
          </button>
        </nav>

        {/* Mood & Favorites Filters */}
        <div className="space-y-1">
          <p className="px-2 pb-1 text-xs font-semibold text-[var(--text-secondary)]">
            Filter Entries
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedMoodFilter('all');
              setShowFavoritesOnly(false);
              setActiveView('entries');
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedMoodFilter === 'all' && !showFavoritesOnly && activeView === 'entries'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <span>All Moods</span>
            <span className="tabular-nums opacity-85">{entries.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextFav = !showFavoritesOnly;
              setShowFavoritesOnly(nextFav);
              if (nextFav) {
                setSelectedMoodFilter('all');
              }
              setActiveView('entries');
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              showFavoritesOnly
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star
                className="w-3.5 h-3.5 shrink-0"
                style={{
                  fill: showFavoritesOnly ? 'currentColor' : 'var(--fill-fav)',
                  color: showFavoritesOnly ? 'currentColor' : 'var(--text-fav)',
                }}
              />
              <span>Favorites</span>
            </span>
            <span className="tabular-nums opacity-85">{favoritesCount}</span>
          </button>

          {MOOD_TAGS.map((mood) => {
            const cfg = moodConfig[mood];
            const count = entries.filter((e) => e.mood === mood).length;
            const isSelected = selectedMoodFilter === mood;
            return (
              <button
                key={mood}
                type="button"
                onClick={() => {
                  setSelectedMoodFilter(isSelected ? 'all' : mood);
                  setActiveView('entries');
                }}
                style={
                  isSelected
                    ? {
                        backgroundColor: cfg.badgeBg,
                        color: cfg.badgeText,
                        borderColor: cfg.badgeBorder,
                      }
                    : undefined
                }
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-semibold'
                    : 'border-transparent font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full border shrink-0"
                    style={{
                      backgroundColor: cfg.dotColor,
                      borderColor: cfg.dotBorder,
                    }}
                  />
                  <span>{mood}</span>
                </span>
                <span className="tabular-nums opacity-85">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Mood Insights Card */}
        <section
          aria-label="Mood insights"
          className="rounded-xl bg-[var(--bg-subtle)]/80 border border-[var(--border-primary)] p-4"
        >
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
              Mood Insights
            </h2>
            <span className="text-xs text-[var(--text-secondary)]">{monthLabel}</span>
          </div>

          <div className="space-y-3">
            {MOOD_TAGS.map((mood) => {
              const cfg = moodConfig[mood];
              const count = moodCounts[mood];
              const widthPct =
                count === 0 ? 0 : Math.max(8, Math.round((count / maxMoodCount) * 100));

              return (
                <div key={mood} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                      <span
                        className="w-2.5 h-2.5 rounded-full border shrink-0"
                        style={{
                          backgroundColor: cfg.dotColor,
                          borderColor: cfg.dotBorder,
                        }}
                      />
                      <MoodIcon
                        mood={mood}
                        className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0"
                      />
                      <span>{mood}</span>
                    </span>
                    <span className="text-[var(--text-secondary)] font-semibold tabular-nums">
                      {count}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: cfg.barColor,
                        border: count > 0 ? `1px solid ${cfg.barBorder}` : 'none',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-3 pt-2.5 border-t border-[var(--border-primary)] tabular-nums">
            {monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'} in{' '}
            {monthLabel}
          </p>
        </section>
      </div>

      {/* User Footer & Sign Out */}
      <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-card)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--border-primary)] text-[var(--text-primary)] font-semibold text-xs flex items-center justify-center shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {displayName}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={signOutUser}
            title="Sign Out"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
