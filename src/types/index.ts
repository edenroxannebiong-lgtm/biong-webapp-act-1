export type MoodTag = 'Happy' | 'Productive' | 'Stressed' | 'Chill' | 'Grateful' | 'Sad';

export const MOOD_TAGS: MoodTag[] = [
  'Happy',
  'Productive',
  'Stressed',
  'Chill',
  'Grateful',
  'Sad',
];

export interface MoodStyle {
  label: MoodTag;
  dotColor: string;
  dotBorder: string;
  barColor: string;
  barBorder: string;
  cellBg: string;
  cellBorder: string;
  cellText: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
}

export const MOOD_CONFIG: Record<MoodTag, MoodStyle> = {
  Happy: {
    label: 'Happy',
    dotColor: '#FBE3A6',
    dotBorder: '#DFBA5E',
    barColor: '#FBE3A6',
    barBorder: '#DFBA5E',
    cellBg: '#FBE3A6',
    cellBorder: '#DFBA5E',
    cellText: '#6B4A00',
    badgeBg: '#FBE3A6',
    badgeBorder: '#DFBA5E',
    badgeText: '#6B4A00',
    description: 'Bright, joyful, and upbeat',
  },
  Productive: {
    label: 'Productive',
    dotColor: '#BFE3C4',
    dotBorder: '#8BC493',
    barColor: '#BFE3C4',
    barBorder: '#8BC493',
    cellBg: '#BFE3C4',
    cellBorder: '#8BC493',
    cellText: '#1F5A2B',
    badgeBg: '#BFE3C4',
    badgeBorder: '#8BC493',
    badgeText: '#1F5A2B',
    description: 'Focused, accomplished, and energized',
  },
  Stressed: {
    label: 'Stressed',
    dotColor: '#F4B6B0',
    dotBorder: '#DD8880',
    barColor: '#F4B6B0',
    barBorder: '#DD8880',
    cellBg: '#F4B6B0',
    cellBorder: '#DD8880',
    cellText: '#8A2A22',
    badgeBg: '#F4B6B0',
    badgeBorder: '#DD8880',
    badgeText: '#8A2A22',
    description: 'Overwhelmed, tense, or stretched thin',
  },
  Chill: {
    label: 'Chill',
    dotColor: '#BBD7F2',
    dotBorder: '#84B1DC',
    barColor: '#BBD7F2',
    barBorder: '#84B1DC',
    cellBg: '#BBD7F2',
    cellBorder: '#84B1DC',
    cellText: '#1D4E80',
    badgeBg: '#BBD7F2',
    badgeBorder: '#84B1DC',
    badgeText: '#1D4E80',
    description: 'Calm, rested, and unhurried',
  },
  Grateful: {
    label: 'Grateful',
    dotColor: '#DCC8F0',
    dotBorder: '#B79AD8',
    barColor: '#DCC8F0',
    barBorder: '#B79AD8',
    cellBg: '#DCC8F0',
    cellBorder: '#B79AD8',
    cellText: '#4F2E7A',
    badgeBg: '#DCC8F0',
    badgeBorder: '#B79AD8',
    badgeText: '#4F2E7A',
    description: 'Thankful, warm, and appreciative',
  },
  Sad: {
    label: 'Sad',
    dotColor: '#C9CFDA',
    dotBorder: '#9AA5B8',
    barColor: '#C9CFDA',
    barBorder: '#9AA5B8',
    cellBg: '#C9CFDA',
    cellBorder: '#9AA5B8',
    cellText: '#3B4252',
    badgeBg: '#C9CFDA',
    badgeBorder: '#9AA5B8',
    badgeText: '#3B4252',
    description: 'Reflective, tender, or low-energy',
  },
};

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  starterSeeded?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  mood: MoodTag;
  content: string;
  isFavorite?: boolean;
  createdAt: any;
  updatedAt: any;
}
