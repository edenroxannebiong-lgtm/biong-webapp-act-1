import React, { useMemo, useState } from 'react';
import { ArrowRight, CalendarClock, Check, Clock } from 'lucide-react';
import { Deadline } from '../types';
import { getDeadlineDueInfo } from '../services/deadlineService';

interface UpcomingDeadlinesCardProps {
  deadlines: Deadline[];
  loading: boolean;
  onToggleCompleted: (
    deadline: Deadline,
    origin?: { x: number; y: number }
  ) => Promise<void>;
  onViewAll: () => void;
}

export const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({
  deadlines,
  loading,
  onToggleCompleted,
  onViewAll,
}) => {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const upcomingDeadlines = useMemo(() => {
    return deadlines
      .filter((d) => !d.completed)
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) {
          return a.dueDate.localeCompare(b.dueDate);
        }
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      })
      .slice(0, 3);
  }, [deadlines]);

  const totalRemaining = useMemo(
    () => deadlines.filter((d) => !d.completed).length,
    [deadlines]
  );

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

  return (
    <section
      aria-label="Upcoming deadlines"
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            Upcoming Deadlines
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
            {totalRemaining === 0
              ? 'Nothing due right now'
              : `${totalRemaining} unfinished ${totalRemaining === 1 ? 'deadline' : 'deadlines'}`}
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
        <div className="space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-3.5 space-y-2"
            >
              <div className="h-4 w-2/3 rounded-md shimmer-box" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 rounded-md shimmer-box" />
                <div className="h-4 w-24 rounded-full shimmer-box" />
              </div>
            </div>
          ))}
        </div>
      ) : upcomingDeadlines.length > 0 ? (
        <div className="space-y-2.5">
          {upcomingDeadlines.map((deadline) => {
            const dueInfo = getDeadlineDueInfo(deadline.dueDate, deadline.completed);
            const isToggling = togglingId === deadline.id;

            return (
              <div
                key={deadline.id}
                style={
                  dueInfo.isUrgent
                    ? { borderColor: 'var(--border-urgent)' }
                    : undefined
                }
                className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-3.5 flex items-start gap-3 transition-colors"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={deadline.completed}
                  aria-label={`Mark "${deadline.title}" as done`}
                  disabled={isToggling}
                  onClick={(e) => handleToggle(deadline, e)}
                  className="mt-0.5 w-4 h-4 rounded border border-[var(--border-strong)] bg-[var(--bg-card)] hover:border-[var(--accent)] flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                >
                  {isToggling && <Check className="w-3 h-3 text-[var(--accent)]" />}
                </button>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug truncate">
                      {deadline.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {deadline.subject && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)]">
                        {deadline.subject}
                      </span>
                    )}

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
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border tabular-nums ${
                        dueInfo.isUrgent
                          ? ''
                          : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{dueInfo.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] p-5 text-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] text-[var(--text-secondary)] mx-auto flex items-center justify-center mb-2">
            <CalendarClock className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">All caught up</p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            No upcoming assignments or projects due soon.
          </p>
        </div>
      )}
    </section>
  );
};
