export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export interface BreathPattern {
  id: string;
  name: string;
  description: string;
  inhale: number; // seconds
  hold: number;
  exhale: number;
  pause: number;
  cycles: number;
  icon: string; // lucide icon name key
  isPremium: boolean;
  isFavorite: boolean;
}

export interface Session {
  id: string;
  patternId: string;
  patternName: string;
  date: string; // ISO
  duration: number; // seconds
  completedCycles: number;
  totalCycles: number;
  calmScore: number; // 1-5
  notes: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarInitials: string;
  totalSessions: number;
  totalMinutes: number;
  longestStreak: number;
  currentStreak: number;
  favoritePatternId: string;
  soundPreference: SoundPreference;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // "8:00 AM"
  hasSeenOnboarding: boolean;
  freeSessionsUsed: number;
  isPremium: boolean;
}

export type SoundPreference = 'none' | 'forest' | 'rain' | 'ocean' | 'bells';

export const SOUND_LABELS: Record<SoundPreference, string> = {
  none: 'None',
  forest: 'Forest Ambience',
  rain: 'Rain',
  ocean: 'Ocean Waves',
  bells: 'Gentle Bells',
};
