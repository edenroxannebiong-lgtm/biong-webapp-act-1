import React, { useMemo } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarRange,
  Clock,
  GraduationCap,
  MapPin,
} from 'lucide-react';
import { SCHEDULE_COLORS, ScheduleBlock, ScheduleColor } from '../types';
import {
  formatSelectedDayHeading,
  formatTime12h,
  getDayOfWeekFromDateStr,
} from '../services/scheduleService';

interface TodaysScheduleCardProps {
  selectedDate: string;
  scheduleBlocks: ScheduleBlock[];
  loading: boolean;
  onViewAll: () => void;
}

export const TodaysScheduleCard: React.FC<TodaysScheduleCardProps> = ({
  selectedDate,
  scheduleBlocks,
  loading,
  onViewAll,
}) => {
  const selectedDayOfWeek = useMemo(
    () => getDayOfWeekFromDateStr(selectedDate),
    [selectedDate]
  );

  const selectedDayLabel = useMemo(
    () => formatSelectedDayHeading(selectedDate),
    [selectedDate]
  );

  const blocksForDay = useMemo(() => {
    return scheduleBlocks
      .filter((b) => b.dayOfWeek === selectedDayOfWeek)
      .sort((a, b) => {
        if (a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.endTime.localeCompare(b.endTime);
      });
  }, [scheduleBlocks, selectedDayOfWeek]);

  const colorStyleMap = useMemo(() => {
    const map = new Map<ScheduleColor, { border: string; text: string }>();
    for (const item of SCHEDULE_COLORS) {
      map.set(item.hex, { border: item.border, text: item.text });
    }
    return map;
  }, []);

  return (
    <section
      aria-label="Today's schedule"
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            Today's Schedule
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate tabular-nums">
            {selectedDayLabel} · {blocksForDay.length}{' '}
            {blocksForDay.length === 1 ? 'block' : 'blocks'}
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-1/2 rounded-md shimmer-box" />
                <div className="h-4 w-14 rounded-md shimmer-box" />
              </div>
              <div className="h-3.5 w-2/3 rounded-md shimmer-box" />
            </div>
          ))}
        </div>
      ) : blocksForDay.length > 0 ? (
        <div className="space-y-2">
          {blocksForDay.map((block) => {
            const styleMeta = colorStyleMap.get(block.color) || {
              border: '#B5828C',
              text: '#1A1A1D',
            };

            return (
              <div
                key={block.id}
                className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-3 flex items-stretch gap-3 transition-colors"
              >
                <span
                  aria-hidden="true"
                  style={{
                    backgroundColor: block.color,
                    borderColor: styleMeta.border,
                  }}
                  className="w-1.5 rounded-full border shrink-0"
                />

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug truncate">
                      {block.title}
                    </p>
                    <span
                      style={{
                        backgroundColor: block.color,
                        borderColor: styleMeta.border,
                        color: styleMeta.text,
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold shrink-0"
                    >
                      {block.category === 'Class' ? (
                        <GraduationCap className="w-3 h-3 shrink-0" />
                      ) : (
                        <BookOpen className="w-3 h-3 shrink-0" />
                      )}
                      <span>{block.category}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--text-secondary)] tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>
                        {formatTime12h(block.startTime)} –{' '}
                        {formatTime12h(block.endTime)}
                      </span>
                    </span>
                    {block.location && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{block.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-5 text-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)] mx-auto flex items-center justify-center mb-2">
            <CalendarRange className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            No classes or study blocks on {selectedDayOfWeek}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Select another date or open Schedule to plan your week.
          </p>
        </div>
      )}
    </section>
  );
};
