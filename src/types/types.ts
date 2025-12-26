export interface PushUpSet {
  id: string;
  count: number;
  timestamp: number;
  variationName?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sets: PushUpSet[];
  target: number;
  totalCount: number;
  achieved: boolean;
  targetSets: number;
  completedSetsCount: number;
}

export interface TargetItem {
  id: string;
  level: number;
  variationName: string;
  count: number;
}

export interface UserProfile {
  id: string; // auth.uid()
  name: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  totalPushUps: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  dailyTarget: number;
  targetBreakdown: TargetItem[];
  dailyTargetSets: number;
  completionWindowHours: number;
  lastSetTimestamp: number | null;
  email?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (user: UserProfile, logs: DailyLog[]) => boolean;
  unlockedAt?: number;
}

export enum View {
  HOME = "home",
  TRAIN = "train",
  STATS = "stats",
  VARIATIONS = "variations",
  SETTINGS = "settings",
  AUTH = "auth",
}
