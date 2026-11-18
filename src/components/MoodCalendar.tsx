import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Deadline, getMoodConfig, JournalEntry, MOOD_TAGS } from '../types';
import { getTodayDateString } from '../services/journalService';
import { getDeadlineDueInfo } from '../services/deadlineService';

interface MoodCalendarProps {
  viewedMonth: Date;
  setViewedMonth: (date: Date) => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  entries: JournalEntry[];
  deadlines: Deadline[];
  loading?: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MoodCalendar: React.FC<MoodCalendarProps> = ({
  viewedMonth,
  setViewedMonth,
  selectedDate,
  onSelectDate,
  entries,
  deadlines,
  loading = false,
}) => {
  const { theme } = useTheme();
  const moodConfig = getMoodConfig(theme);

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const todayStr = getTodayDateString();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      const existing = map.get(entry.date) || [];
      existing.push(entry);
      map.set(entry.date, existing);
    }
    return map;
  }, [entries]);

  const deadlinesByDate = React.useMemo(() => {
    const map = new Map<string, Deadline[]>();
    for (const deadline of deadlines) {
      const existing = map.get(deadline.dueDate) || [];
      existing.push(deadline);
      map.set(deadline.dueDate, existing);
    }
    return map;
  }, [deadlines]);

  const goToPrevMonth = () => {
    setViewedMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewedMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setViewedMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(todayStr);
  };

  const monthTitle = viewedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  if (loading) {
    return (
      <section
        aria-label="Loading mood calendar"
        className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 flex flex-col justify-between transition-colors"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-5">
            <div className="h-6 w-36 rounded-lg shimmer-box" />
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-14 rounded-lg shimmer-box" />
              <div className="h-7 w-7 rounded-lg shimmer-box" />
              <div className="h-7 w-7 rounded-lg shimmer-box" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="h-5 mx-1.5 rounded-md shimmer-box" />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 35 }).map((_, idx) => (
              <div key={idx} className="h-11 rounded-xl shimmer-box" />
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border-primary)] grid grid-cols-3 gap-x-3 gap-y-2">
          {MOOD_TAGS.map((mood) => (
            <div key={mood} className="h-3.5 w-20 rounded-md shimmer-box" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Mood calendar"
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {monthTitle}
          </h2>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={goToToday}
              className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-primary)] transition-colors cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="Previous month"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-primary)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Next month"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-primary)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Row */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-xs font-semibold text-[var(--text-secondary)] py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="h-11" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const dayEntries = entriesByDate.get(dateStr) || [];
            const dayDeadlines = deadlinesByDate.get(dateStr) || [];
            const primaryEntry = dayEntries[0];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const moodStyle = primaryEntry ? moodConfig[primaryEntry.mood] : null;
            const hasUrgentDeadline = dayDeadlines.some(
              (d) => getDeadlineDueInfo(d.dueDate, d.completed).isUrgent
            );

            const tooltipParts: string[] = [];
            if (primaryEntry) {
              tooltipParts.push(`${primaryEntry.title} (${primaryEntry.mood})`);
            }
            if (dayDeadlines.length > 0) {
              tooltipParts.push(
                `Due: ${dayDeadlines.map((d) => d.title).join(', ')}`
              );
            }
            const tooltip =
              tooltipParts.length > 0 ? `${dateStr}: ${tooltipParts.join(' · ')}` : dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                title={tooltip}
                style={
                  isSelected
                    ? {
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-text)',
                        borderColor: 'var(--accent)',
                      }
                    : moodStyle
                    ? {
                        backgroundColor: moodStyle.cellBg,
                        color: moodStyle.cellText,
                        borderColor: moodStyle.cellBorder,
                      }
                    : undefined
                }
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-colors cursor-pointer border ${
                  isSelected
                    ? 'ring-2 ring-[var(--text-primary)]/25 ring-offset-1 ring-offset-[var(--bg-card)] font-semibold'
                    : isToday
                    ? 'border-[var(--border-strong)] ring-1 ring-[var(--border-strong)] font-semibold hover:brightness-97'
                    : moodStyle
                    ? 'font-medium hover:brightness-97'
                    : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                {/* Deadline Indicator Dot */}
                {dayDeadlines.length > 0 && (
                  <span
                    aria-label={`${dayDeadlines.length} deadline${dayDeadlines.length > 1 ? 's' : ''} due`}
                    className="w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 ring-1 ring-[var(--bg-card)]/70"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--accent-text)'
                        : hasUrgentDeadline
                        ? 'var(--dot-urgent)'
                        : moodStyle
                        ? moodStyle.cellText
                        : 'var(--dot-deadline)',
                    }}
                  />
                )}

                <span className="text-xs tabular-nums leading-none">{dayNum}</span>

                {/* Mood Indicator Dot(s) */}
                {dayEntries.length > 0 && (
                  <span className="flex items-center gap-0.5 mt-1">
                    {dayEntries.slice(0, 3).map((entry) => {
                      const entryMood = moodConfig[entry.mood] || moodConfig.Chill;
                      return (
                        <span
                          key={entry.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? 'var(--accent-text)'
                              : entryMood.cellText,
                          }}
                        />
                      );
                    })}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood & Deadline Legend */}
      <div className="mt-5 pt-4 border-t border-[var(--border-primary)] grid grid-cols-3 gap-x-3 gap-y-2 text-xs text-[var(--text-secondary)]">
        {MOOD_TAGS.map((mood) => (
          <div key={mood} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border shrink-0"
              style={{
                backgroundColor: moodConfig[mood].dotColor,
                borderColor: moodConfig[mood].dotBorder,
              }}
            />
            <span>{mood}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 col-span-3 pt-1 border-t border-[var(--border-primary)]/60">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--dot-deadline)' }}
          />
          <span>Deadline due (red if due within 3 days)</span>
        </div>
      </div>
    </section>
  );
};
