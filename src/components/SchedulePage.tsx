import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarRange,
  Check,
  Clock,
  GraduationCap,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  SCHEDULE_COLORS,
  ScheduleBlock,
  ScheduleCategory,
  ScheduleColor,
} from '../types';
import {
  formatTime12h,
  getDayOfWeekFromDateStr,
} from '../services/scheduleService';
import { getTodayDateString } from '../services/journalService';

interface SchedulePageProps {
  scheduleBlocks: ScheduleBlock[];
  loading: boolean;
  onSaveBlock: (data: {
    id?: string;
    title: string;
    category: ScheduleCategory;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    location?: string;
    color: ScheduleColor;
  }) => Promise<void>;
  onDeleteBlock: (blockId: string) => Promise<void>;
}

type CategoryFilter = 'all' | ScheduleCategory;

export const SchedulePage: React.FC<SchedulePageProps> = ({
  scheduleBlocks,
  loading,
  onSaveBlock,
  onDeleteBlock,
}) => {
  const todayDayOfWeek = useMemo(
    () => getDayOfWeekFromDateStr(getTodayDateString()),
    []
  );

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScheduleCategory>('Class');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(todayDayOfWeek);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState<ScheduleColor>(SCHEDULE_COLORS[0].hex);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [blockPendingDelete, setBlockPendingDelete] =
    useState<ScheduleBlock | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!blockPendingDelete) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deletingId) {
        setBlockPendingDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blockPendingDelete, deletingId]);

  const resetForm = (preferredDay?: DayOfWeek) => {
    setEditingBlock(null);
    setTitle('');
    setCategory('Class');
    setDayOfWeek(preferredDay || todayDayOfWeek);
    setStartTime('09:00');
    setEndTime('10:30');
    setLocation('');
    setColor(SCHEDULE_COLORS[0].hex);
    setFormError(null);
  };

  const handleStartEdit = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setTitle(block.title);
    setCategory(block.category);
    setDayOfWeek(block.dayOfWeek);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
    setLocation(block.location || '');
    setColor(block.color);
    setFormError(null);

    const titleInput = document.getElementById('schedule-title');
    if (titleInput instanceof HTMLInputElement) {
      titleInput.focus();
      titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleQuickAddForDay = (day: DayOfWeek) => {
    resetForm(day);
    const titleInput = document.getElementById('schedule-title');
    if (titleInput instanceof HTMLInputElement) {
      titleInput.focus();
      titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a class or study session title.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Please choose both a start time and an end time.');
      return;
    }
    if (startTime >= endTime) {
      setFormError('End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      await onSaveBlock({
        id: editingBlock?.id,
        title,
        category,
        dayOfWeek,
        startTime,
        endTime,
        location,
        color,
      });
      resetForm(dayOfWeek);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save schedule block.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!blockPendingDelete) return;
    const targetId = blockPendingDelete.id;
    setDeletingId(targetId);
    try {
      await onDeleteBlock(targetId);
      if (editingBlock?.id === targetId) {
        resetForm();
      }
      setBlockPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  const classCount = useMemo(
    () => scheduleBlocks.filter((b) => b.category === 'Class').length,
    [scheduleBlocks]
  );
  const studyCount = useMemo(
    () => scheduleBlocks.filter((b) => b.category === 'Study').length,
    [scheduleBlocks]
  );

  const blocksByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, ScheduleBlock[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    for (const block of scheduleBlocks) {
      if (categoryFilter !== 'all' && block.category !== categoryFilter) {
        continue;
      }
      if (grouped[block.dayOfWeek]) {
        grouped[block.dayOfWeek].push(block);
      }
    }

    for (const day of DAYS_OF_WEEK) {
      grouped[day].sort((a, b) => {
        if (a.startTime !== b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.endTime.localeCompare(b.endTime);
      });
    }

    return grouped;
  }, [scheduleBlocks, categoryFilter]);

  const colorStyleMap = useMemo(() => {
    const map = new Map<
      ScheduleColor,
      { border: string; text: string; label: string }
    >();
    for (const item of SCHEDULE_COLORS) {
      map.set(item.hex, {
        border: item.border,
        text: item.text,
        label: item.label,
      });
    }
    return map;
  }, []);

  return (
    <section aria-label="Weekly student schedule" className="space-y-6">
      {/* Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
              Schedule
            </h1>
            <span className="text-xs text-[var(--text-secondary)] tabular-nums">
              {scheduleBlocks.length}{' '}
              {scheduleBlocks.length === 1 ? 'block' : 'blocks'}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Organize your weekly classes and dedicated study blocks in one calm timetable.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              categoryFilter === 'all'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All ({scheduleBlocks.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('Class')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              categoryFilter === 'Class'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Classes ({classCount})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('Study')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              categoryFilter === 'Study'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] font-semibold'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Study ({studyCount})
          </button>
        </div>
      </div>

      {/* Add / Edit Schedule Block Form Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
            {editingBlock ? 'Edit Schedule Block' : 'Add a Class or Study Block'}
          </h2>
          {editingBlock && (
            <button
              type="button"
              onClick={() => resetForm()}
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
            <div className="sm:col-span-5">
              <label
                htmlFor="schedule-title"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Class or Study Block Title
              </label>
              <input
                id="schedule-title"
                type="text"
                maxLength={150}
                placeholder="e.g., BIO 201 Lecture or Organic Chem Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>

            <div className="sm:col-span-3">
              <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Type
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)]">
                <button
                  type="button"
                  onClick={() => setCategory('Class')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    category === 'Class'
                      ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>Class</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('Study')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    category === 'Study'
                      ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Study</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="schedule-location"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Location <span className="font-normal opacity-80">(optional)</span>
              </label>
              <input
                id="schedule-location"
                type="text"
                maxLength={100}
                placeholder="e.g., Science Hall 304 or Library"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-3">
              <label
                htmlFor="schedule-day"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Day of Week
              </label>
              <select
                id="schedule-day"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="schedule-start"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                Start Time
              </label>
              <input
                id="schedule-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] tabular-nums"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="schedule-end"
                className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
              >
                End Time
              </label>
              <input
                id="schedule-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] tabular-nums"
              />
            </div>

            {/* Pastel Color Picker */}
            <div className="sm:col-span-5">
              <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Block Color
              </span>
              <div className="flex flex-wrap items-center gap-2.5 min-h-[38px]">
                {SCHEDULE_COLORS.map((swatch) => {
                  const isSelected = color === swatch.hex;
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setColor(swatch.hex)}
                      aria-label={`Select ${swatch.label} (${swatch.hex})`}
                      aria-pressed={isSelected}
                      title={`${swatch.label} (${swatch.hex})`}
                      style={{
                        backgroundColor: swatch.hex,
                        borderColor: isSelected
                          ? 'var(--text-primary)'
                          : swatch.border,
                      }}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-transform cursor-pointer ${
                        isSelected ? 'scale-110 shadow-sm' : 'hover:scale-105'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className="w-4 h-4 stroke-[2.5]"
                          style={{ color: swatch.text }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            {editingBlock && (
              <button
                type="button"
                onClick={() => resetForm()}
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
                  <span>
                    {editingBlock ? 'Update Block' : 'Add to Schedule'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Weekly Timetable Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] p-3.5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded-md shimmer-box" />
                <div className="h-4 w-6 rounded-md shimmer-box" />
              </div>
              <div className="h-20 w-full rounded-xl shimmer-box" />
              <div className="h-16 w-full rounded-xl shimmer-box" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayBlocks = blocksByDay[day];
            const isToday = day === todayDayOfWeek;

            return (
              <div
                key={day}
                className={`bg-[var(--bg-card)] rounded-2xl border p-3.5 flex flex-col min-h-[220px] transition-colors ${
                  isToday
                    ? 'border-[var(--accent)]'
                    : 'border-[var(--border-primary)]'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[var(--border-primary)]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display text-sm font-semibold text-[var(--text-primary)] truncate">
                        {day}
                      </h3>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--accent)] text-[var(--accent-text)] leading-none">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] tabular-nums mt-0.5">
                      {dayBlocks.length}{' '}
                      {dayBlocks.length === 1 ? 'block' : 'blocks'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickAddForDay(day)}
                    title={`Add block on ${day}`}
                    aria-label={`Add block on ${day}`}
                    className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Blocks */}
                {dayBlocks.length > 0 ? (
                  <div className="space-y-2.5 flex-1">
                    {dayBlocks.map((block) => {
                      const styleMeta = colorStyleMap.get(block.color) || {
                        border: '#B5828C',
                        text: '#1A1A1D',
                        label: 'Pastel',
                      };

                      return (
                        <article
                          key={block.id}
                          style={{
                            backgroundColor: block.color,
                            borderColor: styleMeta.border,
                            color: styleMeta.text,
                          }}
                          className="rounded-xl border p-2.5 space-y-1.5 transition-transform"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span
                              style={{
                                borderColor: styleMeta.border,
                                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                                color: styleMeta.text,
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold leading-none"
                            >
                              {block.category === 'Class' ? (
                                <GraduationCap className="w-3 h-3 shrink-0" />
                              ) : (
                                <BookOpen className="w-3 h-3 shrink-0" />
                              )}
                              <span>{block.category}</span>
                            </span>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(block)}
                                title={`Edit ${block.title}`}
                                aria-label={`Edit ${block.title}`}
                                style={{ color: styleMeta.text }}
                                className="p-1 rounded-md hover:bg-black/10 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlockPendingDelete(block)}
                                title={`Delete ${block.title}`}
                                aria-label={`Delete ${block.title}`}
                                style={{ color: styleMeta.text }}
                                className="p-1 rounded-md hover:bg-black/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-display text-sm font-semibold leading-snug break-words">
                            {block.title}
                          </h4>

                          <div className="space-y-0.5 text-[11px] font-medium opacity-90 tabular-nums">
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>
                                {formatTime12h(block.startTime)} –{' '}
                                {formatTime12h(block.endTime)}
                              </span>
                            </p>
                            {block.location && (
                              <p className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{block.location}</span>
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-2 rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-surface)]/45">
                    <CalendarRange className="w-4 h-4 text-[var(--text-secondary)]/70 mb-1.5" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      No blocks yet
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {blockPendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          style={{ backgroundColor: 'var(--backdrop)' }}
          onClick={() => {
            if (!deletingId) setBlockPendingDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-schedule-dialog-title"
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-primary)] shadow-xl max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-error)] border border-[var(--border-error)] text-[var(--text-error)] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3
                  id="delete-schedule-dialog-title"
                  className="font-display text-lg font-semibold text-[var(--text-primary)]"
                >
                  Are you sure you want to delete this schedule block?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  This block will be permanently removed from your weekly timetable.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-primary)] px-3.5 py-2.5">
              <p className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums">
                {blockPendingDelete.dayOfWeek} ·{' '}
                {formatTime12h(blockPendingDelete.startTime)} –{' '}
                {formatTime12h(blockPendingDelete.endTime)}
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate mt-0.5">
                {blockPendingDelete.title}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setBlockPendingDelete(null)}
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
                  <span>Delete Block</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
