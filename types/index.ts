export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isAutomatic: boolean;
  hasTimer: boolean;
  createdAt: string;
  scheduledTime?: {
    start: string; // ISO time string
    end: string; // ISO time string
  };
}

export interface DailyPlan {
  date: string; // ISO format YYYY-MM-DD
  goals: Goal[];
  goalsCompleted: number;
  progress: number; // 0 to 1
  schedule?: {
    [hour: string]: Goal[];
  };
  quote?: {
    text: string;
    author: string;
  };
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  duration: number; // in minutes
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // in seconds, for timed exercises
  notes?: string;
}

export interface NotificationConfig {
  type: 'timer' | 'alarm';
  seconds: number;
}

export interface DailyEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  goals: string[];
  sleep: {
    hours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
  };
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
    notes?: string;
  };
  workouts: {
    completed: Workout[];
    duration: number; // total minutes
    notes?: string;
  };
  thoughts: string;
  rating: number; // 0-100 percentage
  customFields: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface CustomColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'rating' | 'time' | 'multiline';
  defaultValue?: any;
  options?: string[]; // for select type
  required?: boolean;
}

export interface DailyPlannerSettings {
  customColumns: CustomColumn[];
  autoFillEnabled: boolean;
  reminderTime?: string; // HH:MM format
}

// New types for enhanced features

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'other';
  frequency: 'daily' | 'weekly' | 'custom';
  targetCount?: number; // for habits like "drink 8 glasses of water"
  unit?: string; // e.g., "glasses", "pages", "minutes"
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // ISO format YYYY-MM-DD
  completed: boolean;
  count?: number; // actual count achieved
  notes?: string;
  completedAt?: string;
}

export interface LongTermGoal {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'career' | 'personal' | 'financial' | 'relationships' | 'learning' | 'other';
  priority: 'low' | 'medium' | 'high';
  deadline?: string; // ISO date string
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  progress: number; // 0 to 1
  subtasks: SubTask[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  type: 'morning' | 'evening' | 'free';
  mood: number; // 1-5 scale
  gratitude?: string[];
  reflection?: string;
  highlights?: string;
  challenges?: string;
  tomorrowFocus?: string;
  energy: number; // 1-5 scale
  stress: number; // 1-5 scale
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  badges: Badge[];
  streaks: {
    current: number;
    longest: number;
    lastActiveDate: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    dailyReminder?: string; // HH:MM format
    weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  };
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: string;
  category: 'habits' | 'goals' | 'streaks' | 'journaling' | 'special';
}

export interface Achievement {
  id: string;
  type: 'habit_streak' | 'goal_completed' | 'journal_streak' | 'level_up' | 'badge_earned';
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  color: string;
  date: string;
}

export interface DailyChallenge {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  title: string;
  description: string;
  type: 'habit' | 'goal' | 'reflection' | 'wellness';
  xpReward: number;
  completed: boolean;
  completedAt?: string;
}

export interface Analytics {
  habits: {
    totalCompleted: number;
    streakData: { date: string; count: number }[];
    categoryBreakdown: { category: string; count: number }[];
    completionRate: number;
  };
  goals: {
    totalCompleted: number;
    inProgress: number;
    averageCompletionTime: number; // in days
    categoryBreakdown: { category: string; count: number }[];
  };
  mood: {
    averageMood: number;
    moodTrend: { date: string; mood: number }[];
    energyTrend: { date: string; energy: number }[];
    stressTrend: { date: string; stress: number }[];
  };
  productivity: {
    tasksCompleted: number;
    averageDailyProgress: number;
    mostProductiveDays: string[];
    weeklyTrends: { week: string; progress: number }[];
  };
}