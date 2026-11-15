import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalEntry, MOOD_CONFIG, MOOD_TAGS } from '../types';
import { getTodayDateString } from '../services/journalService';

interface MoodCalendarProps {
  viewedMonth: Date;
  setViewedMonth: (date: Date) => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  entries: JournalEntry[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MoodCalendar: React.FC<MoodCalendarProps> = ({
  viewedMonth,
  setViewedMonth,
  selectedDate,
  onSelectDate,
  entries,
}) => {
  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const todayStr = getTodayDateString();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map YYYY-MM-DD -> entries for that date
  const entriesByDate = React.useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      const existing = map.get(entry.date) || [];
      existing.push(entry);
      map.set(entry.date, existing);
    }
    return map;
  }, [entries]);

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

  // Build calendar grid slots
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <section
      aria-label="Mood calendar"
      className="bg-[#FBF3F5] rounded-2xl border border-[#F0C9D3] p-5 sm:p-6 flex flex-col justify-between h-full"
    >
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between gap-2 mb-5">
          <h2 className="font-display text-lg font-semibold text-[#3F2A32]">{monthTitle}</h2>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={goToToday}
              className="px-2.5 py-1.5 text-xs font-medium text-[#7B5A66] hover:text-[#3F2A32] hover:bg-[#F6E6EA] rounded-lg border border-[#F0C9D3] transition-colors cursor-pointer whitespace-nowrap"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="Previous month"
              className="p-1.5 text-[#7B5A66] hover:text-[#3F2A32] hover:bg-[#F6E6EA] rounded-lg border border-[#F0C9D3] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="Next month"
              className="p-1.5 text-[#7B5A66] hover:text-[#3F2A32] hover:bg-[#F6E6EA] rounded-lg border border-[#F0C9D3] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Row */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-xs font-semibold text-[#7B5A66] py-1">
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
            const primaryEntry = dayEntries[0];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const moodStyle = primaryEntry ? MOOD_CONFIG[primaryEntry.mood] : null;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(dateStr)}
                title={
                  primaryEntry
                    ? `${dateStr}: ${primaryEntry.title} (${primaryEntry.mood})`
                    : dateStr
                }
                style={
                  isSelected
                    ? { backgroundColor: '#7B5A66', color: '#FFFFFF', borderColor: '#7B5A66' }
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
                    ? 'ring-2 ring-[#3F2A32]/30 ring-offset-1 font-semibold'
                    : isToday
                    ? 'border-[#E0A0B2] ring-1 ring-[#E0A0B2] font-semibold hover:brightness-97'
                    : moodStyle
                    ? 'font-medium hover:brightness-97'
                    : 'border-transparent text-[#3F2A32] hover:bg-[#F6E6EA]'
                }`}
              >
                <span className="text-xs tabular-nums leading-none">{dayNum}</span>

                {/* Mood Indicator Dot(s) */}
                {dayEntries.length > 0 && (
                  <span className="flex items-center gap-0.5 mt-1">
                    {dayEntries.slice(0, 3).map((entry) => {
                      const entryMood = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.Chill;
                      return (
                        <span
                          key={entry.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: isSelected ? '#FFFFFF' : entryMood.cellText,
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

      {/* Mood Color Legend */}
      <div className="mt-5 pt-4 border-t border-[#F0C9D3] grid grid-cols-3 gap-x-3 gap-y-2 text-xs text-[#7B5A66]">
        {MOOD_TAGS.map((mood) => (
          <div key={mood} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border shrink-0"
              style={{
                backgroundColor: MOOD_CONFIG[mood].dotColor,
                borderColor: MOOD_CONFIG[mood].dotBorder,
              }}
            />
            <span>{mood}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
