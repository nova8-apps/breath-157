import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BreathPattern, Session, UserProfile, SoundPreference } from '@/types';

const DEFAULT_PATTERNS: BreathPattern[] = [
  {
    id: 'box-4',
    name: 'Box Breathing',
    description: 'Equal inhale, hold, exhale, hold. Used by Navy SEALs for calm focus.',
    inhale: 4, hold: 4, exhale: 4, pause: 4,
    cycles: 6, icon: 'square', isPremium: false, isFavorite: true,
  },
  {
    id: '4-7-8',
    name: '4-7-8 Relaxing',
    description: 'Dr. Weil\'s technique for deep relaxation and sleep.',
    inhale: 4, hold: 7, exhale: 8, pause: 0,
    cycles: 4, icon: 'moon', isPremium: false, isFavorite: false,
  },
  {
    id: '6-min-calm',
    name: '6-Minute Calm',
    description: 'A gentle 6-minute session to ease into your day.',
    inhale: 5, hold: 2, exhale: 6, pause: 2,
    cycles: 6, icon: 'sun', isPremium: false, isFavorite: true,
  },
  {
    id: 'energize',
    name: 'Morning Energize',
    description: 'Short, sharp breaths to wake up your nervous system.',
    inhale: 3, hold: 1, exhale: 3, pause: 1,
    cycles: 8, icon: 'zap', isPremium: true, isFavorite: false,
  },
  {
    id: 'deep-sleep',
    name: 'Deep Sleep Prep',
    description: 'Extended exhales to activate your parasympathetic response.',
    inhale: 4, hold: 4, exhale: 8, pause: 2,
    cycles: 5, icon: 'cloud-moon', isPremium: true, isFavorite: false,
  },
];

const SEED_SESSIONS: Session[] = [
  {
    id: 's1',
    patternId: 'box-4',
    patternName: 'Box Breathing',
    date: '2026-05-02T07:30:00.000Z',
    duration: 288,
    completedCycles: 6,
    totalCycles: 6,
    calmScore: 4,
    notes: 'Great morning session, felt centered.',
  },
  {
    id: 's2',
    patternId: '4-7-8',
    patternName: '4-7-8 Relaxing',
    date: '2026-05-01T22:15:00.000Z',
    duration: 304,
    completedCycles: 4,
    totalCycles: 4,
    calmScore: 5,
    notes: 'Fell asleep quickly after this one.',
  },
  {
    id: 's3',
    patternId: '6-min-calm',
    patternName: '6-Minute Calm',
    date: '2026-05-01T12:00:00.000Z',
    duration: 360,
    completedCycles: 6,
    totalCycles: 6,
    calmScore: 3,
    notes: '',
  },
  {
    id: 's4',
    patternId: 'box-4',
    patternName: 'Box Breathing',
    date: '2026-04-30T08:00:00.000Z',
    duration: 288,
    completedCycles: 6,
    totalCycles: 6,
    calmScore: 4,
    notes: 'Started my streak!',
  },
  {
    id: 's5',
    patternId: '6-min-calm',
    patternName: '6-Minute Calm',
    date: '2026-04-29T18:30:00.000Z',
    duration: 360,
    completedCycles: 6,
    totalCycles: 6,
    calmScore: 5,
    notes: 'Evening wind-down, very peaceful.',
  },
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Mehdi',
  email: 'mehdi@example.com',
  avatarInitials: 'MD',
  totalSessions: 5,
  totalMinutes: 27,
  longestStreak: 4,
  currentStreak: 4,
  favoritePatternId: 'box-4',
  soundPreference: 'ocean',
  hapticsEnabled: true,
  notificationsEnabled: true,
  reminderTime: '8:00 AM',
  hasSeenOnboarding: false,
  freeSessionsUsed: 0,
  isPremium: false,
};

interface AppState {
  patterns: BreathPattern[];
  sessions: Session[];
  profile: UserProfile;
  activePatternId: string | null;

  // Pattern actions
  addPattern: (pattern: BreathPattern) => void;
  updatePattern: (id: string, updates: Partial<BreathPattern>) => void;
  toggleFavorite: (id: string) => void;
  deletePattern: (id: string) => void;

  // Session actions
  addSession: (session: Session) => void;
  updateSessionNotes: (id: string, notes: string) => void;

  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboardingComplete: () => void;
  resetOnboarding: () => void;
  setSoundPreference: (pref: SoundPreference) => void;
  toggleHaptics: () => void;
  toggleNotifications: () => void;

  // Active session
  setActivePattern: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      patterns: DEFAULT_PATTERNS,
      sessions: SEED_SESSIONS,
      profile: DEFAULT_PROFILE,
      activePatternId: null,

      addPattern: (pattern) =>
        set((s) => ({ patterns: [...s.patterns, pattern] })),

      updatePattern: (id, updates) =>
        set((s) => ({
          patterns: s.patterns.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      toggleFavorite: (id) =>
        set((s) => ({
          patterns: s.patterns.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        })),

      deletePattern: (id) =>
        set((s) => ({
          patterns: s.patterns.filter((p) => p.id !== id),
        })),

      addSession: (session) =>
        set((s) => {
          const newSessions = [session, ...s.sessions];
          const totalMinutes = Math.round(
            newSessions.reduce((sum, ses) => sum + ses.duration, 0) / 60
          );

          // Compute streak: compare calendar dates
          const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const lastSessionDate = s.sessions.length > 0
            ? new Date(s.sessions[0].date).toISOString().split('T')[0]
            : null;

          let newStreak = s.profile.currentStreak;
          if (!lastSessionDate) {
            // First session ever
            newStreak = 1;
          } else if (lastSessionDate === todayDate) {
            // Same day — don't increment
            newStreak = s.profile.currentStreak;
          } else {
            // Check if consecutive days
            const lastDate = new Date(lastSessionDate);
            const today = new Date(todayDate);
            const diffMs = today.getTime() - lastDate.getTime();
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              // Consecutive day
              newStreak = s.profile.currentStreak + 1;
            } else {
              // Gap — reset
              newStreak = 1;
            }
          }

          return {
            sessions: newSessions,
            profile: {
              ...s.profile,
              totalSessions: newSessions.length,
              totalMinutes,
              currentStreak: newStreak,
              longestStreak: Math.max(s.profile.longestStreak, newStreak),
              freeSessionsUsed: s.profile.freeSessionsUsed + 1,
            },
          };
        }),

      updateSessionNotes: (id, notes) =>
        set((s) => ({
          sessions: s.sessions.map((ses) =>
            ses.id === id ? { ...ses, notes } : ses
          ),
        })),

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      setOnboardingComplete: () =>
        set((s) => ({ profile: { ...s.profile, hasSeenOnboarding: true } })),

      resetOnboarding: () =>
        set((s) => ({ profile: { ...s.profile, hasSeenOnboarding: false } })),

      setSoundPreference: (pref) =>
        set((s) => ({ profile: { ...s.profile, soundPreference: pref } })),

      toggleHaptics: () =>
        set((s) => ({
          profile: { ...s.profile, hapticsEnabled: !s.profile.hapticsEnabled },
        })),

      toggleNotifications: () =>
        set((s) => ({
          profile: { ...s.profile, notificationsEnabled: !s.profile.notificationsEnabled },
        })),

      setActivePattern: (id) => set({ activePatternId: id }),
    }),
    {
      name: 'breathing-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
