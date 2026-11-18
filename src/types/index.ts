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

export const DARK_MOOD_CONFIG: Record<MoodTag, MoodStyle> = {
  Happy: {
    label: 'Happy',
    dotColor: '#FADADD',
    dotBorder: '#D8A7B1',
    barColor: '#FADADD',
    barBorder: '#D8A7B1',
    cellBg: '#FADADD',
    cellBorder: '#D8A7B1',
    cellText: '#1A1A1D',
    badgeBg: '#FADADD',
    badgeBorder: '#D8A7B1',
    badgeText: '#1A1A1D',
    description: 'Bright, joyful, and upbeat',
  },
  Productive: {
    label: 'Productive',
    dotColor: '#FBC4AB',
    dotBorder: '#D49A7F',
    barColor: '#FBC4AB',
    barBorder: '#D49A7F',
    cellBg: '#FBC4AB',
    cellBorder: '#D49A7F',
    cellText: '#1A1A1D',
    badgeBg: '#FBC4AB',
    badgeBorder: '#D49A7F',
    badgeText: '#1A1A1D',
    description: 'Focused, accomplished, and energized',
  },
  Stressed: {
    label: 'Stressed',
    dotColor: '#BC8F8F',
    dotBorder: '#9A6D6D',
    barColor: '#BC8F8F',
    barBorder: '#9A6D6D',
    cellBg: '#BC8F8F',
    cellBorder: '#9A6D6D',
    cellText: '#121212',
    badgeBg: '#BC8F8F',
    badgeBorder: '#9A6D6D',
    badgeText: '#121212',
    description: 'Overwhelmed, tense, or stretched thin',
  },
  Chill: {
    label: 'Chill',
    dotColor: '#F8C8DC',
    dotBorder: '#D49FB5',
    barColor: '#F8C8DC',
    barBorder: '#D49FB5',
    cellBg: '#F8C8DC',
    cellBorder: '#D49FB5',
    cellText: '#1A1A1D',
    badgeBg: '#F8C8DC',
    badgeBorder: '#D49FB5',
    badgeText: '#1A1A1D',
    description: 'Calm, rested, and unhurried',
  },
  Grateful: {
    label: 'Grateful',
    dotColor: '#D8A7B1',
    dotBorder: '#B37F8A',
    barColor: '#D8A7B1',
    barBorder: '#B37F8A',
    cellBg: '#D8A7B1',
    cellBorder: '#B37F8A',
    cellText: '#121212',
    badgeBg: '#D8A7B1',
    badgeBorder: '#B37F8A',
    badgeText: '#121212',
    description: 'Thankful, warm, and appreciative',
  },
  Sad: {
    label: 'Sad',
    dotColor: '#A67C74',
    dotBorder: '#855F58',
    barColor: '#A67C74',
    barBorder: '#855F58',
    cellBg: '#A67C74',
    cellBorder: '#855F58',
    cellText: '#121212',
    badgeBg: '#A67C74',
    badgeBorder: '#855F58',
    badgeText: '#121212',
    description: 'Reflective, tender, or low-energy',
  },
};

export function getMoodConfig(mode: 'light' | 'dark'): Record<MoodTag, MoodStyle> {
  return mode === 'dark' ? DARK_MOOD_CONFIG : MOOD_CONFIG;
}

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

export interface Deadline {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  completed: boolean;
  createdAt: any;
  updatedAt: any;
}

export type ScheduleCategory = 'Class' | 'Study';

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export type ScheduleColor = '#D8A7B1' | '#FBC4AB' | '#FADADD' | '#F8C8DC' | '#BC8F8F';

export const SCHEDULE_COLORS: {
  hex: ScheduleColor;
  label: string;
  border: string;
  text: string;
}[] = [
  { hex: '#D8A7B1', label: 'Dusty Rose', border: '#B5828C', text: '#1A1A1D' },
  { hex: '#FBC4AB', label: 'Warm Peach', border: '#D49A7F', text: '#1A1A1D' },
  { hex: '#FADADD', label: 'Blush Petal', border: '#D9A7B2', text: '#1A1A1D' },
  { hex: '#F8C8DC', label: 'Soft Pink', border: '#D49FB5', text: '#1A1A1D' },
  { hex: '#BC8F8F', label: 'Rosy Taupe', border: '#9A6D6D', text: '#121212' },
];

export interface ScheduleBlock {
  id: string;
  userId: string;
  title: string;
  category: ScheduleCategory;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
  color: ScheduleColor;
  createdAt: any;
  updatedAt: any;
}

