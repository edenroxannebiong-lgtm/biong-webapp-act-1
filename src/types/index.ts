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
    dotColor: '#D4A84F',
    dotBorder: '#9A782D',
    barColor: '#C99B3E',
    barBorder: '#8D6C26',
    cellBg: '#5C4516',
    cellBorder: '#8C6B25',
    cellText: '#FBECC4',
    badgeBg: '#5C4516',
    badgeBorder: '#8C6B25',
    badgeText: '#FBECC4',
    description: 'Bright, joyful, and upbeat',
  },
  Productive: {
    label: 'Productive',
    dotColor: '#5DA670',
    dotBorder: '#3C7A4D',
    barColor: '#549C67',
    barBorder: '#387548',
    cellBg: '#1D4A29',
    cellBorder: '#357445',
    cellText: '#D4EED8',
    badgeBg: '#1D4A29',
    badgeBorder: '#357445',
    badgeText: '#D4EED8',
    description: 'Focused, accomplished, and energized',
  },
  Stressed: {
    label: 'Stressed',
    dotColor: '#C96A64',
    dotBorder: '#9E3E3B',
    barColor: '#BD5E58',
    barBorder: '#913834',
    cellBg: '#6B2220',
    cellBorder: '#9C3E3B',
    cellText: '#FAD7D4',
    badgeBg: '#6B2220',
    badgeBorder: '#9C3E3B',
    badgeText: '#FAD7D4',
    description: 'Overwhelmed, tense, or stretched thin',
  },
  Chill: {
    label: 'Chill',
    dotColor: '#6B9ED1',
    dotBorder: '#3E6D9C',
    barColor: '#6094C7',
    barBorder: '#3A6794',
    cellBg: '#1C4063',
    cellBorder: '#376796',
    cellText: '#D6E7F7',
    badgeBg: '#1C4063',
    badgeBorder: '#376796',
    badgeText: '#D6E7F7',
    description: 'Calm, rested, and unhurried',
  },
  Grateful: {
    label: 'Grateful',
    dotColor: '#A17EC9',
    dotBorder: '#715199',
    barColor: '#9672BE',
    barBorder: '#69498F',
    cellBg: '#442A61',
    cellBorder: '#6D4A94',
    cellText: '#EADDF7',
    badgeBg: '#442A61',
    badgeBorder: '#6D4A94',
    badgeText: '#EADDF7',
    description: 'Thankful, warm, and appreciative',
  },
  Sad: {
    label: 'Sad',
    dotColor: '#8693AA',
    dotBorder: '#5B677D',
    barColor: '#7C89A0',
    barBorder: '#566278',
    cellBg: '#323B4B',
    cellBorder: '#546178',
    cellText: '#E2E7F0',
    badgeBg: '#323B4B',
    badgeBorder: '#546178',
    badgeText: '#E2E7F0',
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
