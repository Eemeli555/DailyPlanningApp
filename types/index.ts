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