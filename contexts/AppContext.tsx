import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays, subDays, isWithinInterval, startOfWeek, endOfWeek, set, addMinutes } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { 
  Goal, 
  DailyPlan, 
  Workout, 
  NotificationConfig, 
  DailyEntry, 
  CustomColumn, 
  DailyPlannerSettings,
  Habit,
  HabitEntry,
  LongTermGoal,
  SubTask,
  JournalEntry,
  UserProfile,
  Badge,
  Achievement,
  DailyChallenge,
  SleepData,
  SocialMediaUsage,
  TrackedApp,
  AppUsageSession,
  IntentPromptResponse,
  SocialMediaReflection,
  UsageAlert,
  DigitalWellnessGoal,
  ProductiveActivity,
  ActivityEntry,
  Analytics,
  DashboardMetric
} from '@/types';
import { generateId } from '@/utils/helpers';
import { 
  calculateLevel, 
  calculateHabitStreak, 
  checkForNewAchievements, 
  generateDailyChallenge 
} from '@/utils/gamification';
import { XP_REWARDS } from '@/constants/gamification';
import { COLORS } from '@/constants/theme';

interface AppContextType {
  // Goals
  todaysGoals: Goal[];
  goalsLibrary: Goal[];
  progressToday: number;
  addGoal: (goalData: Partial<Goal>) => string;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  completeGoal: (goalId: string) => void;
  uncompleteGoal: (goalId: string) => void;
  getGoalById: (goalId: string) => Goal | undefined;
  toggleAutomaticGoal: (goalId: string) => void;
  
  // Daily Plans
  dailyPlans: DailyPlan[];
  getDailyPlan: (date: string) => DailyPlan | undefined;
  getAverageProgress: (startDate?: Date, endDate?: Date) => number;
  
  // Scheduling
  setTimerForGoal: (goalId: string) => void;
  updateGoalSchedule: (goalId: string, schedule: { start: string; end: string }) => void;
  scheduleNotification: (goalId: string, config: NotificationConfig) => Promise<void>;
  
  // Future Day Planning
  addGoalToDate: (goalId: string, date: Date, schedule?: { start: string; end: string }) => void;
  addActivityToDate: (activityId: string, date: Date, schedule?: { start: string; end: string }) => void;
  
  // Workouts
  workouts: Workout[];
  
  // Daily Planner
  dailyEntries: DailyEntry[];
  plannerSettings: DailyPlannerSettings;
  getDailyEntry: (date: string) => DailyEntry | undefined;
  updateDailyEntry: (date: string, updates: Partial<DailyEntry>) => void;
  addCustomColumn: (column: CustomColumn) => void;
  removeCustomColumn: (columnId: string) => void;
  updatePlannerSettings: (settings: Partial<DailyPlannerSettings>) => void;
  
  // Habits
  habits: Habit[];
  habitEntries: HabitEntry[];
  addHabit: (habitData: Partial<Habit>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  
  // Long-term Goals
  longTermGoals: LongTermGoal[];
  addLongTermGoal: (goalData: Partial<LongTermGoal>) => void;
  updateLongTermGoal: (goalId: string, updates: Partial<LongTermGoal>) => void;
  deleteLongTermGoal: (goalId: string) => void;
  toggleSubtask: (goalId: string, subtaskId: string) => void;
  
  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (date: string, entryData: Partial<JournalEntry>) => void;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (entryId: string) => void;
  canTakeMorningQuiz: boolean;
  canTakeEveningQuiz: boolean;
  scheduleQuizReminders: () => void;
  
  // User Profile & Gamification
  userProfile: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  awardXP: (amount: number, reason: string) => void;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  completeDailyChallenge: () => void;
  
  // Sleep & Wellness
  sleepData: SleepData[];
  addSleepData: (data: Partial<SleepData>) => void;
  updateSleepData: (id: string, updates: Partial<SleepData>) => void;
  
  // Social Media & Digital Wellness
  socialMediaData: SocialMediaUsage[];
  trackedApps: TrackedApp[];
  appUsageSessions: AppUsageSession[];
  intentPromptResponses: IntentPromptResponse[];
  socialMediaReflections: SocialMediaReflection[];
  usageAlerts: UsageAlert[];
  digitalWellnessGoals: DigitalWellnessGoal[];
  
  addTrackedApp: (appData: Partial<TrackedApp>) => void;
  updateTrackedApp: (appId: string, updates: Partial<TrackedApp>) => void;
  removeTrackedApp: (appId: string) => void;
  addAppUsageSession: (sessionData: Partial<AppUsageSession>) => void;
  addIntentPromptResponse: (responseData: Partial<IntentPromptResponse>) => void;
  addSocialMediaReflection: (reflectionData: Partial<SocialMediaReflection>) => void;
  addUsageAlert: (alertData: Partial<UsageAlert>) => void;
  updateUsageAlert: (alertId: string, updates: Partial<UsageAlert>) => void;
  removeUsageAlert: (alertId: string) => void;
  addDigitalWellnessGoal: (goalData: Partial<DigitalWellnessGoal>) => void;
  updateDigitalWellnessGoal: (goalId: string, updates: Partial<DigitalWellnessGoal>) => void;
  
  // Productive Activities
  productiveActivities: ProductiveActivity[];
  activityEntries: ActivityEntry[];
  addProductiveActivity: (activityData: Partial<ProductiveActivity>) => void;
  updateProductiveActivity: (activityId: string, updates: Partial<ProductiveActivity>) => void;
  deleteProductiveActivity: (activityId: string) => void;
  addActivityToToday: (activityId: string) => void;
  
  // Analytics & Dashboard
  getAnalytics: () => Analytics;
  dashboardMetrics: DashboardMetric[];
  updateDashboardMetric: (metricId: string, updates: Partial<DashboardMetric>) => void;
  toggleMetricPin: (metricId: string) => void;
  
  // Quote of the day
  quoteOfTheDay: { text: string; author: string };
}

const defaultUserProfile: UserProfile = {
  id: 'user-1',
  name: 'User',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXP: 0,
  badges: [],
  streaks: {
    current: 0,
    longest: 0,
    lastActiveDate: '',
  },
  preferences: {
    theme: 'light',
    notifications: true,
    weekStartsOn: 1,
    socialMediaTracking: true,
    intentPrompts: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultPlannerSettings: DailyPlannerSettings = {
  customColumns: [],
  autoFillEnabled: true,
};

const defaultDashboardMetrics: DashboardMetric[] = [
  {
    id: 'avg-mood',
    title: 'Average Mood',
    value: '0.0',
    subtitle: 'Last 7 days',
    color: COLORS.secondary[600],
    icon: '😊',
    isPinned: true,
    category: 'mood',
  },
  {
    id: 'sleep-hours',
    title: 'Sleep',
    value: '0h',
    subtitle: 'Last night',
    color: COLORS.accent[600],
    icon: '😴',
    isPinned: true,
    category: 'sleep',
  },
  {
    id: 'goals-completed',
    title: 'Goals Progress',
    value: '0%I'll implement the future day planning feature and improve the scheduling functionality. This will include:

1. **Future Day Planning**: Allow users to add tasks and activities to future dates
2. **Enhanced Scheduling**: Improved scheduling modal with time selection during task creation
3. **Better Calendar Integration**: Enhanced calendar view for planning future days
4. **Automatic Habit Addition**: Habits will be automatically added to future days

Let me start by creating the enhanced scheduling components:

<boltArtifact id="future-day-planning" title="Future Day Planning and Enhanced Scheduling">