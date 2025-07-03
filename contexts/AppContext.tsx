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
    value: '0%',
    subtitle: 'Today',
    color: COLORS.primary[600],
    icon: '🎯',
    isPinned: true,
    category: 'goals',
  },
  {
    id: 'habit-streak',
    title: 'Habit Streak',
    value: '0 days',
    subtitle: 'Current streak',
    color: COLORS.success[600],
    icon: '🔥',
    isPinned: true,
    category: 'habits',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State declarations
  const [todaysGoals, setTodaysGoals] = useState<Goal[]>([]);
  const [goalsLibrary, setGoalsLibrary] = useState<Goal[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [plannerSettings, setPlannerSettings] = useState<DailyPlannerSettings>(defaultPlannerSettings);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<LongTermGoal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(defaultUserProfile);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaUsage[]>([]);
  const [trackedApps, setTrackedApps] = useState<TrackedApp[]>([]);
  const [appUsageSessions, setAppUsageSessions] = useState<AppUsageSession[]>([]);
  const [intentPromptResponses, setIntentPromptResponses] = useState<IntentPromptResponse[]>([]);
  const [socialMediaReflections, setSocialMediaReflections] = useState<SocialMediaReflection[]>([]);
  const [usageAlerts, setUsageAlerts] = useState<UsageAlert[]>([]);
  const [digitalWellnessGoals, setDigitalWellnessGoals] = useState<DigitalWellnessGoal[]>([]);
  const [productiveActivities, setProductiveActivities] = useState<ProductiveActivity[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetric[]>(defaultDashboardMetrics);

  const quoteOfTheDay = {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  };

  // Calculate progress for today
  const progressToday = todaysGoals.length > 0 
    ? Math.round((todaysGoals.filter(goal => goal.completed).length / todaysGoals.length) * 100)
    : 0;

  // Quiz availability
  const canTakeMorningQuiz = true; // Implement logic based on time and previous entries
  const canTakeEveningQuiz = true; // Implement logic based on time and previous entries

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all data from AsyncStorage
      const keys = [
        'todaysGoals',
        'goalsLibrary',
        'dailyPlans',
        'workouts',
        'dailyEntries',
        'plannerSettings',
        'habits',
        'habitEntries',
        'longTermGoals',
        'journalEntries',
        'userProfile',
        'achievements',
        'dailyChallenge',
        'sleepData',
        'socialMediaData',
        'trackedApps',
        'appUsageSessions',
        'intentPromptResponses',
        'socialMediaReflections',
        'usageAlerts',
        'digitalWellnessGoals',
        'productiveActivities',
        'activityEntries',
        'dashboardMetrics',
      ];

      const values = await AsyncStorage.multiGet(keys);
      
      values.forEach(([key, value]) => {
        if (value) {
          const parsedValue = JSON.parse(value);
          switch (key) {
            case 'todaysGoals':
              setTodaysGoals(parsedValue);
              break;
            case 'goalsLibrary':
              setGoalsLibrary(parsedValue);
              break;
            case 'dailyPlans':
              setDailyPlans(parsedValue);
              break;
            case 'workouts':
              setWorkouts(parsedValue);
              break;
            case 'dailyEntries':
              setDailyEntries(parsedValue);
              break;
            case 'plannerSettings':
              setPlannerSettings(parsedValue);
              break;
            case 'habits':
              setHabits(parsedValue);
              break;
            case 'habitEntries':
              setHabitEntries(parsedValue);
              break;
            case 'longTermGoals':
              setLongTermGoals(parsedValue);
              break;
            case 'journalEntries':
              setJournalEntries(parsedValue);
              break;
            case 'userProfile':
              setUserProfile(parsedValue);
              break;
            case 'achievements':
              setAchievements(parsedValue);
              break;
            case 'dailyChallenge':
              setDailyChallenge(parsedValue);
              break;
            case 'sleepData':
              setSleepData(parsedValue);
              break;
            case 'socialMediaData':
              setSocialMediaData(parsedValue);
              break;
            case 'trackedApps':
              setTrackedApps(parsedValue);
              break;
            case 'appUsageSessions':
              setAppUsageSessions(parsedValue);
              break;
            case 'intentPromptResponses':
              setIntentPromptResponses(parsedValue);
              break;
            case 'socialMediaReflections':
              setSocialMediaReflections(parsedValue);
              break;
            case 'usageAlerts':
              setUsageAlerts(parsedValue);
              break;
            case 'digitalWellnessGoals':
              setDigitalWellnessGoals(parsedValue);
              break;
            case 'productiveActivities':
              setProductiveActivities(parsedValue);
              break;
            case 'activityEntries':
              setActivityEntries(parsedValue);
              break;
            case 'dashboardMetrics':
              setDashboardMetrics(parsedValue);
              break;
          }
        }
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Goal functions
  const addGoal = (goalData: Partial<Goal>): string => {
    const newGoal: Goal = {
      id: generateId(),
      title: goalData.title || '',
      description: goalData.description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: goalData.category || 'personal',
      priority: goalData.priority || 'medium',
      estimatedDuration: goalData.estimatedDuration || 30,
      tags: goalData.tags || [],
      isAutomatic: goalData.isAutomatic || false,
      schedule: goalData.schedule,
      ...goalData,
    };

    const updatedGoals = [...todaysGoals, newGoal];
    const updatedLibrary = [...goalsLibrary, newGoal];
    
    setTodaysGoals(updatedGoals);
    setGoalsLibrary(updatedLibrary);
    
    saveData('todaysGoals', updatedGoals);
    saveData('goalsLibrary', updatedLibrary);
    
    return newGoal.id;
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    const updateGoalInArray = (goals: Goal[]) =>
      goals.map(goal =>
        goal.id === goalId
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      );

    const updatedTodaysGoals = updateGoalInArray(todaysGoals);
    const updatedLibrary = updateGoalInArray(goalsLibrary);

    setTodaysGoals(updatedTodaysGoals);
    setGoalsLibrary(updatedLibrary);
    
    saveData('todaysGoals', updatedTodaysGoals);
    saveData('goalsLibrary', updatedLibrary);
  };

  const deleteGoal = (goalId: string) => {
    const updatedTodaysGoals = todaysGoals.filter(goal => goal.id !== goalId);
    const updatedLibrary = goalsLibrary.filter(goal => goal.id !== goalId);
    
    setTodaysGoals(updatedTodaysGoals);
    setGoalsLibrary(updatedLibrary);
    
    saveData('todaysGoals', updatedTodaysGoals);
    saveData('goalsLibrary', updatedLibrary);
  };

  const completeGoal = (goalId: string) => {
    updateGoal(goalId, { completed: true, completedAt: new Date().toISOString() });
    
    if (userProfile) {
      awardXP(XP_REWARDS.COMPLETE_GOAL, 'Completed a goal');
    }
  };

  const uncompleteGoal = (goalId: string) => {
    updateGoal(goalId, { completed: false, completedAt: undefined });
  };

  const getGoalById = (goalId: string): Goal | undefined => {
    return goalsLibrary.find(goal => goal.id === goalId);
  };

  const toggleAutomaticGoal = (goalId: string) => {
    const goal = getGoalById(goalId);
    if (goal) {
      updateGoal(goalId, { isAutomatic: !goal.isAutomatic });
    }
  };

  // Daily Plan functions
  const getDailyPlan = (date: string): DailyPlan | undefined => {
    return dailyPlans.find(plan => plan.date === date);
  };

  const getAverageProgress = (startDate?: Date, endDate?: Date): number => {
    const filteredPlans = dailyPlans.filter(plan => {
      if (!startDate || !endDate) return true;
      const planDate = new Date(plan.date);
      return isWithinInterval(planDate, { start: startDate, end: endDate });
    });

    if (filteredPlans.length === 0) return 0;

    const totalProgress = filteredPlans.reduce((sum, plan) => sum + plan.progress, 0);
    return Math.round(totalProgress / filteredPlans.length);
  };

  // Scheduling functions
  const setTimerForGoal = (goalId: string) => {
    // Implementation for setting timer
    console.log('Setting timer for goal:', goalId);
  };

  const updateGoalSchedule = (goalId: string, schedule: { start: string; end: string }) => {
    updateGoal(goalId, { schedule });
  };

  const scheduleNotification = async (goalId: string, config: NotificationConfig) => {
    if (Platform.OS === 'web') return;
    
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
        },
        trigger: {
          seconds: config.delayInSeconds || 60,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Future Day Planning functions
  const addGoalToDate = (goalId: string, date: Date, schedule?: { start: string; end: string }) => {
    const goal = getGoalById(goalId);
    if (!goal) return;

    const dateString = format(date, 'yyyy-MM-dd');
    let dailyPlan = getDailyPlan(dateString);

    if (!dailyPlan) {
      dailyPlan = {
        id: generateId(),
        date: dateString,
        goals: [],
        activities: [],
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const goalWithSchedule = { ...goal, schedule };
    dailyPlan.goals.push(goalWithSchedule);

    const updatedPlans = dailyPlans.filter(plan => plan.date !== dateString);
    updatedPlans.push(dailyPlan);

    setDailyPlans(updatedPlans);
    saveData('dailyPlans', updatedPlans);
  };

  const addActivityToDate = (activityId: string, date: Date, schedule?: { start: string; end: string }) => {
    const activity = productiveActivities.find(a => a.id === activityId);
    if (!activity) return;

    const dateString = format(date, 'yyyy-MM-dd');
    let dailyPlan = getDailyPlan(dateString);

    if (!dailyPlan) {
      dailyPlan = {
        id: generateId(),
        date: dateString,
        goals: [],
        activities: [],
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const activityWithSchedule = { ...activity, schedule };
    dailyPlan.activities.push(activityWithSchedule);

    const updatedPlans = dailyPlans.filter(plan => plan.date !== dateString);
    updatedPlans.push(dailyPlan);

    setDailyPlans(updatedPlans);
    saveData('dailyPlans', updatedPlans);
  };

  // Daily Planner functions
  const getDailyEntry = (date: string): DailyEntry | undefined => {
    return dailyEntries.find(entry => entry.date === date);
  };

  const updateDailyEntry = (date: string, updates: Partial<DailyEntry>) => {
    const existingEntry = getDailyEntry(date);
    
    if (existingEntry) {
      const updatedEntries = dailyEntries.map(entry =>
        entry.date === date
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      );
      setDailyEntries(updatedEntries);
      saveData('dailyEntries', updatedEntries);
    } else {
      const newEntry: DailyEntry = {
        id: generateId(),
        date,
        mood: updates.mood || 5,
        energy: updates.energy || 5,
        productivity: updates.productivity || 5,
        notes: updates.notes || '',
        customFields: updates.customFields || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates,
      };
      
      const updatedEntries = [...dailyEntries, newEntry];
      setDailyEntries(updatedEntries);
      saveData('dailyEntries', updatedEntries);
    }
  };

  const addCustomColumn = (column: CustomColumn) => {
    const updatedSettings = {
      ...plannerSettings,
      customColumns: [...plannerSettings.customColumns, column],
    };
    setPlannerSettings(updatedSettings);
    saveData('plannerSettings', updatedSettings);
  };

  const removeCustomColumn = (columnId: string) => {
    const updatedSettings = {
      ...plannerSettings,
      customColumns: plannerSettings.customColumns.filter(col => col.id !== columnId),
    };
    setPlannerSettings(updatedSettings);
    saveData('plannerSettings', updatedSettings);
  };

  const updatePlannerSettings = (settings: Partial<DailyPlannerSettings>) => {
    const updatedSettings = { ...plannerSettings, ...settings };
    setPlannerSettings(updatedSettings);
    saveData('plannerSettings', updatedSettings);
  };

  // Habit functions
  const addHabit = (habitData: Partial<Habit>) => {
    const newHabit: Habit = {
      id: generateId(),
      title: habitData.title || '',
      description: habitData.description || '',
      frequency: habitData.frequency || 'daily',
      category: habitData.category || 'health',
      color: habitData.color || COLORS.primary[500],
      streak: 0,
      bestStreak: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...habitData,
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveData('habits', updatedHabits);
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    const updatedHabits = habits.map(habit =>
      habit.id === habitId
        ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
        : habit
    );
    setHabits(updatedHabits);
    saveData('habits', updatedHabits);
  };

  const deleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    const updatedEntries = habitEntries.filter(entry => entry.habitId !== habitId);
    
    setHabits(updatedHabits);
    setHabitEntries(updatedEntries);
    
    saveData('habits', updatedHabits);
    saveData('habitEntries', updatedEntries);
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existingEntry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === date
    );

    if (existingEntry) {
      const updatedEntries = habitEntries.filter(
        entry => !(entry.habitId === habitId && entry.date === date)
      );
      setHabitEntries(updatedEntries);
      saveData('habitEntries', updatedEntries);
    } else {
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date,
        completed: true,
        createdAt: new Date().toISOString(),
      };
      
      const updatedEntries = [...habitEntries, newEntry];
      setHabitEntries(updatedEntries);
      saveData('habitEntries', updatedEntries);
      
      if (userProfile) {
        awardXP(XP_REWARDS.COMPLETE_HABIT, 'Completed a habit');
      }
    }

    // Update habit streak
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const newStreak = calculateHabitStreak(habitId, habitEntries);
      updateHabit(habitId, { 
        streak: newStreak,
        bestStreak: Math.max(habit.bestStreak, newStreak)
      });
    }
  };

  // Long-term Goal functions
  const addLongTermGoal = (goalData: Partial<LongTermGoal>) => {
    const newGoal: LongTermGoal = {
      id: generateId(),
      title: goalData.title || '',
      description: goalData.description || '',
      category: goalData.category || 'personal',
      targetDate: goalData.targetDate,
      progress: 0,
      subtasks: goalData.subtasks || [],
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...goalData,
    };

    const updatedGoals = [...longTermGoals, newGoal];
    setLongTermGoals(updatedGoals);
    saveData('longTermGoals', updatedGoals);
  };

  const updateLongTermGoal = (goalId: string, updates: Partial<LongTermGoal>) => {
    const updatedGoals = longTermGoals.map(goal =>
      goal.id === goalId
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    );
    setLongTermGoals(updatedGoals);
    saveData('longTermGoals', updatedGoals);
  };

  const deleteLongTermGoal = (goalId: string) => {
    const updatedGoals = longTermGoals.filter(goal => goal.id !== goalId);
    setLongTermGoals(updatedGoals);
    saveData('longTermGoals', updatedGoals);
  };

  const toggleSubtask = (goalId: string, subtaskId: string) => {
    const goal = longTermGoals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedSubtasks = goal.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    const completedCount = updatedSubtasks.filter(s => s.completed).length;
    const progress = Math.round((completedCount / updatedSubtasks.length) * 100);

    updateLongTermGoal(goalId, {
      subtasks: updatedSubtasks,
      progress,
      isCompleted: progress === 100,
    });

    if (userProfile) {
      awardXP(XP_REWARDS.COMPLETE_SUBTASK, 'Completed a subtask');
    }
  };

  // Journal functions
  const addJournalEntry = (date: string, entryData: Partial<JournalEntry>) => {
    const newEntry: JournalEntry = {
      id: generateId(),
      date,
      type: entryData.type || 'general',
      content: entryData.content || '',
      mood: entryData.mood,
      tags: entryData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...entryData,
    };

    const updatedEntries = [...journalEntries, newEntry];
    setJournalEntries(updatedEntries);
    saveData('journalEntries', updatedEntries);

    if (userProfile) {
      awardXP(XP_REWARDS.JOURNAL_ENTRY, 'Added journal entry');
    }
  };

  const updateJournalEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    const updatedEntries = journalEntries.map(entry =>
      entry.id === entryId
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    );
    setJournalEntries(updatedEntries);
    saveData('journalEntries', updatedEntries);
  };

  const deleteJournalEntry = (entryId: string) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
    setJournalEntries(updatedEntries);
    saveData('journalEntries', updatedEntries);
  };

  const scheduleQuizReminders = () => {
    if (Platform.OS === 'web') return;
    
    // Schedule morning quiz reminder
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Morning Reflection',
        body: 'Take a moment to set your intentions for the day',
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule evening quiz reminder
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Evening Reflection',
        body: 'Reflect on your day and plan for tomorrow',
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  };

  // User Profile & Gamification functions
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    saveData('userProfile', updatedProfile);
  };

  const awardXP = (amount: number, reason: string) => {
    if (!userProfile) return;

    const newTotalXP = userProfile.totalXP + amount;
    const newXP = userProfile.xp + amount;
    const newLevel = calculateLevel(newTotalXP);
    const xpToNextLevel = (newLevel * 100) - newTotalXP;

    updateUserProfile({
      xp: newXP,
      totalXP: newTotalXP,
      level: newLevel,
      xpToNextLevel,
    });

    // Check for new achievements
    const newAchievements = checkForNewAchievements(userProfile, {
      todaysGoals,
      habits,
      habitEntries,
      longTermGoals,
      journalEntries,
    });

    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
      saveData('achievements', [...achievements, ...newAchievements]);
    }
  };

  const completeDailyChallenge = () => {
    if (dailyChallenge && userProfile) {
      awardXP(dailyChallenge.xpReward, 'Completed daily challenge');
      
      // Generate new challenge for tomorrow
      const newChallenge = generateDailyChallenge();
      setDailyChallenge(newChallenge);
      saveData('dailyChallenge', newChallenge);
    }
  };

  // Sleep & Wellness functions
  const addSleepData = (data: Partial<SleepData>) => {
    const newSleepData: SleepData = {
      id: generateId(),
      date: data.date || format(new Date(), 'yyyy-MM-dd'),
      bedtime: data.bedtime || '',
      wakeTime: data.wakeTime || '',
      duration: data.duration || 0,
      quality: data.quality || 5,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      ...data,
    };

    const updatedData = [...sleepData, newSleepData];
    setSleepData(updatedData);
    saveData('sleepData', updatedData);
  };

  const updateSleepData = (id: string, updates: Partial<SleepData>) => {
    const updatedData = sleepData.map(data =>
      data.id === id ? { ...data, ...updates } : data
    );
    setSleepData(updatedData);
    saveData('sleepData', updatedData);
  };

  // Social Media & Digital Wellness functions
  const addTrackedApp = (appData: Partial<TrackedApp>) => {
    const newApp: TrackedApp = {
      id: generateId(),
      name: appData.name || '',
      packageName: appData.packageName || '',
      category: appData.category || 'social',
      isTracked: true,
      dailyLimit: appData.dailyLimit,
      createdAt: new Date().toISOString(),
      ...appData,
    };

    const updatedApps = [...trackedApps, newApp];
    setTrackedApps(updatedApps);
    saveData('trackedApps', updatedApps);
  };

  const updateTrackedApp = (appId: string, updates: Partial<TrackedApp>) => {
    const updatedApps = trackedApps.map(app =>
      app.id === appId ? { ...app, ...updates } : app
    );
    setTrackedApps(updatedApps);
    saveData('trackedApps', updatedApps);
  };

  const removeTrackedApp = (appId: string) => {
    const updatedApps = trackedApps.filter(app => app.id !== appId);
    setTrackedApps(updatedApps);
    saveData('trackedApps', updatedApps);
  };

  const addAppUsageSession = (sessionData: Partial<AppUsageSession>) => {
    const newSession: AppUsageSession = {
      id: generateId(),
      appId: sessionData.appId || '',
      startTime: sessionData.startTime || new Date().toISOString(),
      endTime: sessionData.endTime || new Date().toISOString(),
      duration: sessionData.duration || 0,
      date: sessionData.date || format(new Date(), 'yyyy-MM-dd'),
      ...sessionData,
    };

    const updatedSessions = [...appUsageSessions, newSession];
    setAppUsageSessions(updatedSessions);
    saveData('appUsageSessions', updatedSessions);
  };

  const addIntentPromptResponse = (responseData: Partial<IntentPromptResponse>) => {
    const newResponse: IntentPromptResponse = {
      id: generateId(),
      appId: responseData.appId || '',
      intent: responseData.intent || '',
      timestamp: responseData.timestamp || new Date().toISOString(),
      proceeded: responseData.proceeded || false,
      ...responseData,
    };

    const updatedResponses = [...intentPromptResponses, newResponse];
    setIntentPromptResponses(updatedResponses);
    saveData('intentPromptResponses', updatedResponses);
  };

  const addSocialMediaReflection = (reflectionData: Partial<SocialMediaReflection>) => {
    const newReflection: SocialMediaReflection = {
      id: generateId(),
      date: reflectionData.date || format(new Date(), 'yyyy-MM-dd'),
      mood: reflectionData.mood || 5,
      productivity: reflectionData.productivity || 5,
      socialComparison: reflectionData.socialComparison || 5,
      timeWasted: reflectionData.timeWasted || 5,
      notes: reflectionData.notes || '',
      createdAt: new Date().toISOString(),
      ...reflectionData,
    };

    const updatedReflections = [...socialMediaReflections, newReflection];
    setSocialMediaReflections(updatedReflections);
    saveData('socialMediaReflections', updatedReflections);
  };

  const addUsageAlert = (alertData: Partial<UsageAlert>) => {
    const newAlert: UsageAlert = {
      id: generateId(),
      appId: alertData.appId || '',
      type: alertData.type || 'time_limit',
      threshold: alertData.threshold || 60,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...alertData,
    };

    const updatedAlerts = [...usageAlerts, newAlert];
    setUsageAlerts(updatedAlerts);
    saveData('usageAlerts', updatedAlerts);
  };

  const updateUsageAlert = (alertId: string, updates: Partial<UsageAlert>) => {
    const updatedAlerts = usageAlerts.map(alert =>
      alert.id === alertId ? { ...alert, ...updates } : alert
    );
    setUsageAlerts(updatedAlerts);
    saveData('usageAlerts', updatedAlerts);
  };

  const removeUsageAlert = (alertId: string) => {
    const updatedAlerts = usageAlerts.filter(alert => alert.id !== alertId);
    setUsageAlerts(updatedAlerts);
    saveData('usageAlerts', updatedAlerts);
  };

  const addDigitalWellnessGoal = (goalData: Partial<DigitalWellnessGoal>) => {
    const newGoal: DigitalWellnessGoal = {
      id: generateId(),
      type: goalData.type || 'reduce_usage',
      appId: goalData.appId,
      targetValue: goalData.targetValue || 0,
      currentValue: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...goalData,
    };

    const updatedGoals = [...digitalWellnessGoals, newGoal];
    setDigitalWellnessGoals(updatedGoals);
    saveData('digitalWellnessGoals', updatedGoals);
  };

  const updateDigitalWellnessGoal = (goalId: string, updates: Partial<DigitalWellnessGoal>) => {
    const updatedGoals = digitalWellnessGoals.map(goal =>
      goal.id === goalId
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    );
    setDigitalWellnessGoals(updatedGoals);
    saveData('digitalWellnessGoals', updatedGoals);
  };

  // Productive Activities functions
  const addProductiveActivity = (activityData: Partial<ProductiveActivity>) => {
    const newActivity: ProductiveActivity = {
      id: generateId(),
      title: activityData.title || '',
      description: activityData.description || '',
      category: activityData.category || 'learning',
      estimatedDuration: activityData.estimatedDuration || 30,
      xpReward: activityData.xpReward || 10,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...activityData,
    };

    const updatedActivities = [...productiveActivities, newActivity];
    setProductiveActivities(updatedActivities);
    saveData('productiveActivities', updatedActivities);
  };

  const updateProductiveActivity = (activityId: string, updates: Partial<ProductiveActivity>) => {
    const updatedActivities = productiveActivities.map(activity =>
      activity.id === activityId
        ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
        : activity
    );
    setProductiveActivities(updatedActivities);
    saveData('productiveActivities', updatedActivities);
  };

  const deleteProductiveActivity = (activityId: string) => {
    const updatedActivities = productiveActivities.filter(activity => activity.id !== activityId);
    const updatedEntries = activityEntries.filter(entry => entry.activityId !== activityId);
    
    setProductiveActivities(updatedActivities);
    setActivityEntries(updatedEntries);
    
    saveData('productiveActivities', updatedActivities);
    saveData('activityEntries', updatedEntries);
  };

  const addActivityToToday = (activityId: string) => {
    const activity = productiveActivities.find(a => a.id === activityId);
    if (!activity) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const newEntry: ActivityEntry = {
      id: generateId(),
      activityId,
      date: today,
      duration: 0,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedEntries = [...activityEntries, newEntry];
    setActivityEntries(updatedEntries);
    saveData('activityEntries', updatedEntries);
  };

  // Analytics & Dashboard functions
  const getAnalytics = (): Analytics => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const goalCompletionRate = last7Days.map(date => {
      const plan = getDailyPlan(date);
      return plan ? plan.progress : 0;
    });

    const habitCompletionRate = last7Days.map(date => {
      const completedHabits = habitEntries.filter(entry => 
        entry.date === date && entry.completed
      ).length;
      return habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;
    });

    const moodData = last7Days.map(date => {
      const entry = getDailyEntry(date);
      return entry ? entry.mood : 5;
    });

    const sleepData7Days = last7Days.map(date => {
      const sleep = sleepData.find(s => s.date === date);
      return sleep ? sleep.duration : 0;
    });

    return {
      goalCompletionRate,
      habitCompletionRate,
      moodData,
      sleepData: sleepData7Days,
      dates: last7Days,
      averageGoalCompletion: goalCompletionRate.reduce((a, b) => a + b, 0) / 7,
      averageHabitCompletion: habitCompletionRate.reduce((a, b) => a + b, 0) / 7,
      averageMood: moodData.reduce((a, b) => a + b, 0) / 7,
      averageSleep: sleepData7Days.reduce((a, b) => a + b, 0) / 7,
    };
  };

  const updateDashboardMetric = (metricId: string, updates: Partial<DashboardMetric>) => {
    const updatedMetrics = dashboardMetrics.map(metric =>
      metric.id === metricId ? { ...metric, ...updates } : metric
    );
    setDashboardMetrics(updatedMetrics);
    saveData('dashboardMetrics', updatedMetrics);
  };

  const toggleMetricPin = (metricId: string) => {
    const metric = dashboardMetrics.find(m => m.id === metricId);
    if (metric) {
      updateDashboardMetric(metricId, { isPinned: !metric.isPinned });
    }
  };

  const contextValue: AppContextType = {
    // Goals
    todaysGoals,
    goalsLibrary,
    progressToday,
    addGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    uncompleteGoal,
    getGoalById,
    toggleAutomaticGoal,
    
    // Daily Plans
    dailyPlans,
    getDailyPlan,
    getAverageProgress,
    
    // Scheduling
    setTimerForGoal,
    updateGoalSchedule,
    scheduleNotification,
    
    // Future Day Planning
    addGoalToDate,
    addActivityToDate,
    
    // Workouts
    workouts,
    
    // Daily Planner
    dailyEntries,
    plannerSettings,
    getDailyEntry,
    updateDailyEntry,
    addCustomColumn,
    removeCustomColumn,
    updatePlannerSettings,
    
    // Habits
    habits,
    habitEntries,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    
    // Long-term Goals
    longTermGoals,
    addLongTermGoal,
    updateLongTermGoal,
    deleteLongTermGoal,
    toggleSubtask,
    
    // Journal
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    canTakeMorningQuiz,
    canTakeEveningQuiz,
    scheduleQuizReminders,
    
    // User Profile & Gamification
    userProfile,
    updateUserProfile,
    awardXP,
    achievements,
    dailyChallenge,
    completeDailyChallenge,
    
    // Sleep & Wellness
    sleepData,
    addSleepData,
    updateSleepData,
    
    // Social Media & Digital Wellness
    socialMediaData,
    trackedApps,
    appUsageSessions,
    intentPromptResponses,
    socialMediaReflections,
    usageAlerts,
    digitalWellnessGoals,
    
    addTrackedApp,
    updateTrackedApp,
    removeTrackedApp,
    addAppUsageSession,
    addIntentPromptResponse,
    addSocialMediaReflection,
    addUsageAlert,
    updateUsageAlert,
    removeUsageAlert,
    addDigitalWellnessGoal,
    updateDigitalWellnessGoal,
    
    // Productive Activities
    productiveActivities,
    activityEntries,
    addProductiveActivity,
    updateProductiveActivity,
    deleteProductiveActivity,
    addActivityToToday,
    
    // Analytics & Dashboard
    getAnalytics,
    dashboardMetrics,
    updateDashboardMetric,
    toggleMetricPin,
    
    // Quote of the day
    quoteOfTheDay,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;