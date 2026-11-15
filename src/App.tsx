import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { BookHeart, CheckCircle2, Flame, Menu, PenLine, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './firebase/config';
import { handleFirestoreError, OperationType } from './firebase/errors';
import { JournalEntry, MoodTag } from './types';
import {
  calculateWritingStreak,
  deleteJournalEntry,
  ensureStarterEntry,
  getTodayDateString,
  saveJournalEntry,
  toggleEntryFavorite,
} from './services/journalService';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { MoodCalendar } from './components/MoodCalendar';
import { JournalEditor } from './components/JournalEditor';
import { EntriesFeed } from './components/EntriesFeed';
import { RecentEntriesCard } from './components/RecentEntriesCard';

function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'entries'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [viewedMonth, setViewedMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<'all' | MoodTag>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mainScrollRef = useRef<HTMLElement | null>(null);
  const seededUserRef = useRef<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Subscribe to the signed-in user's private journal entries
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setEntriesLoading(false);
      seededUserRef.current = null;
      return;
    }

    setEntriesLoading(true);
    const entriesPath = `users/${user.uid}/entries`;
    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ ...(docSnap.data() as JournalEntry), id: docSnap.id });
        });
        setEntries(loaded);
        setEntriesLoading(false);
      },
      (error) => {
        console.error('Error loading journal entries:', error);
        setEntriesLoading(false);
        handleFirestoreError(error, OperationType.LIST, entriesPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Seed a welcoming starter entry once for brand-new accounts
  useEffect(() => {
    if (!user || !profile) return;
    if (profile.starterSeeded) return;
    if (seededUserRef.current === user.uid) return;

    seededUserRef.current = user.uid;
    ensureStarterEntry(
      user.uid,
      profile.displayName || user.displayName || 'Journaler'
    ).catch((err) => {
      console.warn('Starter entry seeding skipped:', err);
    });
  }, [user, profile]);

  const entriesForSelectedDate = useMemo(() => {
    return entries
      .filter((entry) => entry.date === selectedDate)
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
  }, [entries, selectedDate]);

  const streakCount = useMemo(() => calculateWritingStreak(entries), [entries]);

  const scrollToEditor = () => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      const titleInput = document.getElementById('entry-title');
      if (titleInput instanceof HTMLInputElement) {
        titleInput.focus();
      }
    }, 150);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const dayEntries = entries
      .filter((entry) => entry.date === dateStr)
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
    setEditingEntry(dayEntries[0] || null);
  };

  const handleWriteToday = () => {
    const todayStr = getTodayDateString();
    const now = new Date();
    setActiveView('dashboard');
    setViewedMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
    const todayEntries = entries.filter((entry) => entry.date === todayStr);
    setEditingEntry(todayEntries[0] || null);
    setMobileMenuOpen(false);
    scrollToEditor();
  };

  const handleSaveEntry = async (data: {
    id?: string;
    date: string;
    title: string;
    mood: MoodTag;
    content: string;
  }) => {
    if (!user) return;
    await saveJournalEntry(user.uid, data);
    if (data.id) {
      setEditingEntry(null);
      showToast('Reflection updated.');
    } else {
      showToast('Reflection saved to Keepsake.');
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setActiveView('dashboard');
    setSelectedDate(entry.date);
    const parts = entry.date.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      setViewedMonth(new Date(parts[0], parts[1] - 1, 1));
    }
    setEditingEntry(entry);
    scrollToEditor();
  };

  const handleOpenMyEntries = () => {
    setSelectedMoodFilter('all');
    setShowFavoritesOnly(false);
    setActiveView('entries');
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    await deleteJournalEntry(user.uid, entryId);
    if (editingEntry?.id === entryId) {
      setEditingEntry(null);
    }
    showToast('Entry deleted.');
  };

  const handleToggleFavorite = async (entry: JournalEntry) => {
    if (!user) return;
    const nextFav = entry.isFavorite !== true;
    await toggleEntryFavorite(user.uid, entry.id, nextFav);
    showToast(nextFav ? 'Added to favorites.' : 'Removed from favorites.');
  };

  const greetingInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const timeGreeting =
      hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const rawName = (
      profile?.displayName ||
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'there'
    ).trim();
    const firstName = rawName.split(/\s+/)[0] || 'there';
    const todayFormatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return { timeGreeting, firstName, todayFormatted };
  }, [profile?.displayName, user?.displayName, user?.email]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6E6EA] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-[#7B5A66] text-white flex items-center justify-center mx-auto">
            <BookHeart className="w-6 h-6" />
          </div>
          <div className="w-6 h-6 border-2 border-[#7B5A66] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7B5A66] font-medium">Opening Keepsake...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-[#F6E6EA] overflow-hidden text-[#3F2A32]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#3F2A32] text-[#FBF3F5] px-4 py-2.5 rounded-xl shadow-md border border-[#7B5A66] flex items-center gap-2.5 text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-[#F0C9D3] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#3F2A32]/35 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex">
            <Sidebar
              activeView={activeView}
              setActiveView={(view) => {
                setActiveView(view);
                setMobileMenuOpen(false);
              }}
              selectedMoodFilter={selectedMoodFilter}
              setSelectedMoodFilter={(mood) => {
                setSelectedMoodFilter(mood);
                setMobileMenuOpen(false);
              }}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={(show) => {
                setShowFavoritesOnly(show);
                setMobileMenuOpen(false);
              }}
              entries={entries}
              streakCount={streakCount}
              viewedMonth={viewedMonth}
              onWriteToday={handleWriteToday}
            />
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              className="m-3 p-2 h-9 w-9 rounded-xl bg-[#FBF3F5] border border-[#F0C9D3] text-[#3F2A32] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedMoodFilter={selectedMoodFilter}
          setSelectedMoodFilter={setSelectedMoodFilter}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
          entries={entries}
          streakCount={streakCount}
          viewedMonth={viewedMonth}
          onWriteToday={handleWriteToday}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#FBF3F5] border-b border-[#F0C9D3] px-5 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#7B5A66] hover:text-[#3F2A32] hover:bg-[#F6E6EA] rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-[#7B5A66] truncate">
              <span>Keepsake</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#3F2A32] font-semibold">
                {activeView === 'dashboard' ? 'Dashboard' : 'My Entries'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#7B5A66] bg-[#F6E6EA] border border-[#F0C9D3] px-3 py-1.5 rounded-lg tabular-nums">
              <Flame className="w-3.5 h-3.5 text-[#7B5A66]" />
              <span>{streakCount} day streak</span>
            </div>

            <button
              type="button"
              onClick={handleWriteToday}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#7B5A66] hover:bg-[#654752] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write Today</span>
            </button>
          </div>
        </header>

        {/* Mobile Page Switcher Tabs */}
        <nav
          aria-label="Mobile page navigation"
          className="md:hidden bg-[#FBF3F5] border-b border-[#F0C9D3] px-5 py-2 flex items-center gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'dashboard'
                ? 'bg-[#7B5A66] text-white'
                : 'bg-[#F6E6EA] text-[#7B5A66] border border-[#F0C9D3]'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveView('entries')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeView === 'entries'
                ? 'bg-[#7B5A66] text-white'
                : 'bg-[#F6E6EA] text-[#7B5A66] border border-[#F0C9D3]'
            }`}
          >
            <span>My Entries</span>
            <span
              className={`tabular-nums ${
                activeView === 'entries' ? 'text-white/85' : 'text-[#7B5A66]'
              }`}
            >
              ({entries.length})
            </span>
          </button>
        </nav>

        {/* Scrollable Workspace */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-5 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeView === 'dashboard' ? (
              <>
                {/* Friendly Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#3F2A32] tracking-tight">
                      {greetingInfo.timeGreeting}, {greetingInfo.firstName}
                    </h1>
                    <p className="text-sm text-[#7B5A66] mt-1">
                      {greetingInfo.todayFormatted} · Take a quiet moment to check in with yourself.
                    </p>
                  </div>
                </div>

                {/* Calendar & Journal Editor Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5">
                    <MoodCalendar
                      viewedMonth={viewedMonth}
                      setViewedMonth={setViewedMonth}
                      selectedDate={selectedDate}
                      onSelectDate={handleSelectDate}
                      entries={entries}
                    />
                  </div>
                  <div className="lg:col-span-7">
                    <JournalEditor
                      selectedDate={selectedDate}
                      entriesForSelectedDate={entriesForSelectedDate}
                      editingEntry={editingEntry}
                      onSelectEntryToEdit={(entry) => setEditingEntry(entry)}
                      onStartNewEntry={() => setEditingEntry(null)}
                      onSaveEntry={handleSaveEntry}
                      onCancelEdit={() => setEditingEntry(null)}
                    />
                  </div>
                </div>

                {/* Recent Entries Card (Last 3) */}
                <RecentEntriesCard
                  entries={entries}
                  loading={entriesLoading}
                  onViewAll={handleOpenMyEntries}
                  onSelectEntry={handleEditEntry}
                />
              </>
            ) : (
              <EntriesFeed
                entries={entries}
                loading={entriesLoading}
                selectedMoodFilter={selectedMoodFilter}
                setSelectedMoodFilter={setSelectedMoodFilter}
                showFavoritesOnly={showFavoritesOnly}
                setShowFavoritesOnly={setShowFavoritesOnly}
                onToggleFavorite={handleToggleFavorite}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onFocusEditor={handleWriteToday}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
