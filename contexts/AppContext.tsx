import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays, subDays, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import * as Notifications from 'expo-notifications';

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
import { XP_REWARDS, DAILY_CHALLENGES } from '@/constants/gamification';
import { COLORS } from '@/constants/theme';

interface AppContextType {
  // Goals
  goalsLibrary: Goal[];
  todaysGoals: Goal[];
  dailyPlans: DailyPlan[];
  progressToday: number;
  addGoal: (goalData: Partial<Goal>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  getGoalById: (goalId: string) => Goal | undefined;
  completeGoal: (goalId: string) => void;
  uncompleteGoal: (goalId: string) => void;
  setTimerForGoal: (goalId: string) => void;
  scheduleNotification: (goalId: string, config: NotificationConfig) => Promise<void>;
  updateGoalSchedule: (goalId: string, schedule: { start: string; end: string }) => void;
  toggleAutomaticGoal: (goalId: string) => void;
  getAverageProgress: (startDate?: Date, endDate?: Date) => number;
  
  // Future day planning
  addGoalToFutureDay: (date: string, goalId: string) => void;
  addActivityToFutureDay: (date: string, activityId: string) => void;
  getDailyPlan: (date: string) => DailyPlan | undefined;
  createDailyPlan: (date: string) => DailyPlan;

  // Workouts
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => void;
  updateWorkout: (workoutId: string, updates: Partial<Workout>) => void;
  deleteWorkout: (workoutId: string) => void;

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
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;

  // Long-term Goals
  longTermGoals: LongTermGoal[];
  addLongTermGoal: (goalData: Omit<LongTermGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'subtasks'> & { subtasks: string[] }) => void;
  updateLongTermGoal: (goalId: string, updates: Partial<LongTermGoal>) => void;
  deleteLongTermGoal: (goalId: string) => void;
  toggleSubtask: (goalId: string, subtaskId: string) => void;
  addSubtask: (goalId: string, title: string) => void;
  removeSubtask: (goalId: string, subtaskId: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (date: string, entryData: Partial<JournalEntry>) => void;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (entryId: string) => void;
  canTakeMorningQuiz: boolean;
  canTakeEveningQuiz: boolean;

  // Gamification
  userProfile: UserProfile | null;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  awardXP: (amount: number, reason: string) => void;
  completeDailyChallenge: () => void;
  scheduleQuizReminders: () => void;

  // Sleep & Wellness
  sleepData: SleepData[];
  addSleepData: (sleepData: Omit<SleepData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSleepData: (sleepId: string, updates: Partial<SleepData>) => void;

  // Social Media Tracking
  socialMediaData: SocialMediaUsage[];
  trackedApps: TrackedApp[];
  appUsageSessions: AppUsageSession[];
  intentPromptResponses: IntentPromptResponse[];
  socialMediaReflections: SocialMediaReflection[];
  usageAlerts: UsageAlert[];
  addTrackedApp: (appData: Omit<TrackedApp, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrackedApp: (appId: string, updates: Partial<TrackedApp>) => void;
  removeTrackedApp: (appId: string) => void;
  addAppUsageSession: (sessionData: Omit<AppUsageSession, 'id' | 'createdAt'>) => void;
  addIntentPromptResponse: (responseData: Omit<IntentPromptResponse, 'id' | 'createdAt'>) => void;
  addSocialMediaReflection: (reflectionData: Omit<SocialMediaReflection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addUsageAlert: (alertData: Omit<UsageAlert, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUsageAlert: (alertId: string, updates: Partial<UsageAlert>) => void;
  removeUsageAlert: (alertId: string) => void;

  // Digital Wellness Goals
  digitalWellnessGoals: DigitalWellnessGoal[];
  addDigitalWellnessGoal: (goalData: Omit<DigitalWellnessGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDigitalWellnessGoal: (goalId: string, updates: Partial<DigitalWellnessGoal>) => void;

  // Productive Activities
  productiveActivities: ProductiveActivity[];
  activityEntries: ActivityEntry[];
  addProductiveActivity: (activityData: Omit<ProductiveActivity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProductiveActivity: (activityId: string, updates: Partial<ProductiveActivity>) => void;
  deleteProductiveActivity: (activityId: string) => void;
  addActivityToToday: (activityId: string) => void;

  // Analytics & Dashboard
  dashboardMetrics: DashboardMetric[];
  updateDashboardMetric: (metricId: string, updates: Partial<DashboardMetric>) => void;
  toggleMetricPin: (metricId: string) => void;
  getAnalytics: () => Analytics;

  // Quotes
  quoteOfTheDay: { text: string; author: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  GOALS_LIBRARY: 'goals_library',
  DAILY_PLANS: 'daily_plans',
  WORKOUTS: 'workouts',
  DAILY_ENTRIES: 'daily_entries',
  PLANNER_SETTINGS: 'planner_settings',
  HABITS: 'habits',
  HABIT_ENTRIES: 'habit_entries',
  LONG_TERM_GOALS: 'long_term_goals',
  JOURNAL_ENTRIES: 'journal_entries',
  USER_PROFILE: 'user_profile',
  ACHIEVEMENTS: 'achievements',
  DAILY_CHALLENGE: 'daily_challenge',
  SLEEP_DATA: 'sleep_data',
  SOCIAL_MEDIA_DATA: 'social_media_data',
  TRACKED_APPS: 'tracked_apps',
  APP_USAGE_SESSIONS: 'app_usage_sessions',
  INTENT_PROMPT_RESPONSES: 'intent_prompt_responses',
  SOCIAL_MEDIA_REFLECTIONS: 'social_media_reflections',
  USAGE_ALERTS: 'usage_alerts',
  DIGITAL_WELLNESS_GOALS: 'digital_wellness_goals',
  PRODUCTIVE_ACTIVITIES: 'productive_activities',
  ACTIVITY_ENTRIES: 'activity_entries',
  DASHBOARD_METRICS: 'dashboard_metrics',
};

const DEFAULT_QUOTES = [
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
];

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_1',
  name: 'User',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXP: 0,
  badges: [],
  streaks: {
    current: 0,
    longest: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
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

const DEFAULT_DASHBOARD_METRICS: DashboardMetric[] = [
  {
    id: 'goals-completed',
    title: 'Goals Completed',
    value: '0%',
    subtitle: 'This week',
    color: COLORS.primary[600],
    icon: '🎯',
    isPinned: true,
    category: 'goals',
  },
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
    isPinned: false,
    category: 'sleep',
  },
  {
    id: 'social-media',
    title: 'Screen Time',
    value: '0h 0m',
    subtitle: 'Today',
    color: COLORS.warning[600],
    icon: '📱',
    isPinned: false,
    category: 'social',
  },
  {
    id: 'mindful-usage',
    title: 'Mindful Usage',
    value: '0%',
    subtitle: 'Intentional usage',
    color: COLORS.success[600],
    icon: '🧘',
    isPinned: false,
    category: 'social',
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // State declarations
  const [goalsLibrary, setGoalsLibrary] = useState<Goal[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [plannerSettings, setPlannerSettings] = useState<DailyPlannerSettings>({
    customColumns: [],
    autoFillEnabled: true,
  });
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<LongTermGoal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetric[]>(DEFAULT_DASHBOARD_METRICS);

  // Computed values
  const today = new Date().toISOString().split('T')[0];
  const todaysPlan = dailyPlans.find(plan => plan.date === today);
  const todaysGoals = todaysPlan?.goals || [];
  const progressToday = todaysPlan?.progress || 0;
  const quoteOfTheDay = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

  // Quiz availability
  const todayJournal = journalEntries.filter(entry => entry.date === today);
  const canTakeMorningQuiz = !todayJournal.some(entry => entry.type === 'morning');
  const canTakeEveningQuiz = !todayJournal.some(entry => entry.type === 'evening');

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-save data when state changes
  useEffect(() => {
    saveData(STORAGE_KEYS.GOALS_LIBRARY, goalsLibrary);
  }, [goalsLibrary]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DAILY_PLANS, dailyPlans);
  }, [dailyPlans]);

  useEffect(() => {
    saveData(STORAGE_KEYS.WORKOUTS, workouts);
  }, [workouts]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DAILY_ENTRIES, dailyEntries);
  }, [dailyEntries]);

  useEffect(() => {
    saveData(STORAGE_KEYS.PLANNER_SETTINGS, plannerSettings);
  }, [plannerSettings]);

  useEffect(() => {
    saveData(STORAGE_KEYS.HABITS, habits);
  }, [habits]);

  useEffect(() => {
    saveData(STORAGE_KEYS.HABIT_ENTRIES, habitEntries);
  }, [habitEntries]);

  useEffect(() => {
    saveData(STORAGE_KEYS.LONG_TERM_GOALS, longTermGoals);
  }, [longTermGoals]);

  useEffect(() => {
    saveData(STORAGE_KEYS.JOURNAL_ENTRIES, journalEntries);
  }, [journalEntries]);

  useEffect(() => {
    if (userProfile) {
      saveData(STORAGE_KEYS.USER_PROFILE, userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    saveData(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }, [achievements]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DAILY_CHALLENGE, dailyChallenge);
  }, [dailyChallenge]);

  useEffect(() => {
    saveData(STORAGE_KEYS.SLEEP_DATA, sleepData);
  }, [sleepData]);

  useEffect(() => {
    saveData(STORAGE_KEYS.SOCIAL_MEDIA_DATA, socialMediaData);
  }, [socialMediaData]);

  useEffect(() => {
    saveData(STORAGE_KEYS.TRACKED_APPS, trackedApps);
  }, [trackedApps]);

  useEffect(() => {
    saveData(STORAGE_KEYS.APP_USAGE_SESSIONS, appUsageSessions);
  }, [appUsageSessions]);

  useEffect(() => {
    saveData(STORAGE_KEYS.INTENT_PROMPT_RESPONSES, intentPromptResponses);
  }, [intentPromptResponses]);

  useEffect(() => {
    saveData(STORAGE_KEYS.SOCIAL_MEDIA_REFLECTIONS, socialMediaReflections);
  }, [socialMediaReflections]);

  useEffect(() => {
    saveData(STORAGE_KEYS.USAGE_ALERTS, usageAlerts);
  }, [usageAlerts]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DIGITAL_WELLNESS_GOALS, digitalWellnessGoals);
  }, [digitalWellnessGoals]);

  useEffect(() => {
    saveData(STORAGE_KEYS.PRODUCTIVE_ACTIVITIES, productiveActivities);
  }, [productiveActivities]);

  useEffect(() => {
    saveData(STORAGE_KEYS.ACTIVITY_ENTRIES, activityEntries);
  }, [activityEntries]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DASHBOARD_METRICS, dashboardMetrics);
  }, [dashboardMetrics]);

  // Initialize today's plan and daily challenge
  useEffect(() => {
    if (!todaysPlan) {
      createTodaysPlan();
    }
    
    if (!dailyChallenge || dailyChallenge.date !== today) {
      generateTodaysChallenge();
    }
  }, [today, todaysPlan, dailyChallenge]);

  // Utility functions
  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const loadData = async (key: string, defaultValue: any = null) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  };

  const loadAllData = async () => {
    try {
      const [
        savedGoals,
        savedPlans,
        savedWorkouts,
        savedEntries,
        savedSettings,
        savedHabits,
        savedHabitEntries,
        savedLongTermGoals,
        savedJournalEntries,
        savedUserProfile,
        savedAchievements,
        savedDailyChallenge,
        savedSleepData,
        savedSocialMediaData,
        savedTrackedApps,
        savedAppUsageSessions,
        savedIntentPromptResponses,
        savedSocialMediaReflections,
        savedUsageAlerts,
        savedDigitalWellnessGoals,
        savedProductiveActivities,
        savedActivityEntries,
        savedDashboardMetrics,
      ] = await Promise.all([
        loadData(STORAGE_KEYS.GOALS_LIBRARY, []),
        loadData(STORAGE_KEYS.DAILY_PLANS, []),
        loadData(STORAGE_KEYS.WORKOUTS, []),
        loadData(STORAGE_KEYS.DAILY_ENTRIES, []),
        loadData(STORAGE_KEYS.PLANNER_SETTINGS, { customColumns: [], autoFillEnabled: true }),
        loadData(STORAGE_KEYS.HABITS, []),
        loadData(STORAGE_KEYS.HABIT_ENTRIES, []),
        loadData(STORAGE_KEYS.LONG_TERM_GOALS, []),
        loadData(STORAGE_KEYS.JOURNAL_ENTRIES, []),
        loadData(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER_PROFILE),
        loadData(STORAGE_KEYS.ACHIEVEMENTS, []),
        loadData(STORAGE_KEYS.DAILY_CHALLENGE, null),
        loadData(STORAGE_KEYS.SLEEP_DATA, []),
        loadData(STORAGE_KEYS.SOCIAL_MEDIA_DATA, []),
        loadData(STORAGE_KEYS.TRACKED_APPS, []),
        loadData(STORAGE_KEYS.APP_USAGE_SESSIONS, []),
        loadData(STORAGE_KEYS.INTENT_PROMPT_RESPONSES, []),
        loadData(STORAGE_KEYS.SOCIAL_MEDIA_REFLECTIONS, []),
        loadData(STORAGE_KEYS.USAGE_ALERTS, []),
        loadData(STORAGE_KEYS.DIGITAL_WELLNESS_GOALS, []),
        loadData(STORAGE_KEYS.PRODUCTIVE_ACTIVITIES, []),
        loadData(STORAGE_KEYS.ACTIVITY_ENTRIES, []),
        loadData(STORAGE_KEYS.DASHBOARD_METRICS, DEFAULT_DASHBOARD_METRICS),
      ]);

      setGoalsLibrary(savedGoals);
      setDailyPlans(savedPlans);
      setWorkouts(savedWorkouts);
      setDailyEntries(savedEntries);
      setPlannerSettings(savedSettings);
      setHabits(savedHabits);
      setHabitEntries(savedHabitEntries);
      setLongTermGoals(savedLongTermGoals);
      setJournalEntries(savedJournalEntries);
      setUserProfile(savedUserProfile);
      setAchievements(savedAchievements);
      setDailyChallenge(savedDailyChallenge);
      setSleepData(savedSleepData);
      setSocialMediaData(savedSocialMediaData);
      setTrackedApps(savedTrackedApps);
      setAppUsageSessions(savedAppUsageSessions);
      setIntentPromptResponses(savedIntentPromptResponses);
      setSocialMediaReflections(savedSocialMediaReflections);
      setUsageAlerts(savedUsageAlerts);
      setDigitalWellnessGoals(savedDigitalWellnessGoals);
      setProductiveActivities(savedProductiveActivities);
      setActivityEntries(savedActivityEntries);
      setDashboardMetrics(savedDashboardMetrics);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Goal management
  const addGoal = ({ title, description, isAutomatic = false, addToToday = false }: { 
    title: string; 
    description?: string; 
    isAutomatic?: boolean;
    addToToday?: boolean;
  }) => {
    const newGoal: Goal = {
      id: generateId(),
      title,
      description,
      completed: false,
      isAutomatic,
      hasTimer: false,
      createdAt: new Date().toISOString(),
    };

    setGoalsLibrary(prev => [...prev, newGoal]);

    // Add to today's plan if requested
    if (addToToday) {
      addGoalToDay(today, newGoal);
    }

    return newGoal;
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoalsLibrary(prev => 
      prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    );

    // Update goal in any daily plans
    setDailyPlans(prev => 
      prev.map(plan => ({
        ...plan,
        goals: plan.goals.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        ),
      }))
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoalsLibrary(prev => prev.filter(goal => goal.id !== goalId));

    // Remove goal from any daily plans
    setDailyPlans(prev => 
      prev.map(plan => ({
        ...plan,
        goals: plan.goals.filter(goal => goal.id !== goalId),
      }))
    );
  };

  const getGoalById = (goalId: string) => {
    // First check today's goals
    const todayGoal = todaysGoals.find(goal => goal.id === goalId);
    if (todayGoal) return todayGoal;

    // Then check the library
    return goalsLibrary.find(goal => goal.id === goalId);
  };

  const completeGoal = (goalId: string) => {
    setDailyPlans(prev => 
      prev.map(plan => {
        const updatedGoals = plan.goals.map(goal => 
          goal.id === goalId ? { ...goal, completed: true } : goal
        );
        
        const goalsCompleted = updatedGoals.filter(goal => goal.completed).length;
        const progress = updatedGoals.length > 0 ? goalsCompleted / updatedGoals.length : 0;
        
        return {
          ...plan,
          goals: updatedGoals,
          goalsCompleted,
          progress,
        };
      })
    );

    // Award XP for completing a goal
    awardXP(XP_REWARDS.GOAL_COMPLETED, 'Goal completed');
  };

  const uncompleteGoal = (goalId: string) => {
    setDailyPlans(prev => 
      prev.map(plan => {
        const updatedGoals = plan.goals.map(goal => 
          goal.id === goalId ? { ...goal, completed: false } : goal
        );
        
        const goalsCompleted = updatedGoals.filter(goal => goal.completed).length;
        const progress = updatedGoals.length > 0 ? goalsCompleted / updatedGoals.length : 0;
        
        return {
          ...plan,
          goals: updatedGoals,
          goalsCompleted,
          progress,
        };
      })
    );
  };

  const setTimerForGoal = (goalId: string) => {
    // Navigate to timer screen
    // This is handled by the component that calls this function
  };

  const scheduleNotification = async (goalId: string, config: NotificationConfig) => {
    const goal = getGoalById(goalId);
    if (!goal) return;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Notification permission not granted');
        }
      }

      const trigger = config.type === 'timer' 
        ? { seconds: config.seconds }
        : new Date(Date.now() + config.seconds * 1000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: config.type === 'timer' ? 'Timer Completed' : 'Reminder',
          body: `${goal.title}`,
          data: { goalId },
        },
        trigger,
      });

      // Update goal to indicate it has a timer
      updateGoal(goalId, { hasTimer: true });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const updateGoalSchedule = (goalId: string, schedule: { start: string; end: string }) => {
    // Find which day this goal belongs to
    const goalDate = new Date(schedule.start).toISOString().split('T')[0];
    
    setDailyPlans(prev => 
      prev.map(plan => {
        if (plan.date !== goalDate) return plan;
        
        const updatedGoals = plan.goals.map(goal => 
          goal.id === goalId ? { ...goal, scheduledTime: schedule } : goal
        );
        
        return {
          ...plan,
          goals: updatedGoals,
        };
      })
    );
  };

  const toggleAutomaticGoal = (goalId: string) => {
    setGoalsLibrary(prev => 
      prev.map(goal => 
        goal.id === goalId ? { ...goal, isAutomatic: !goal.isAutomatic } : goal
      )
    );
  };

  const getAverageProgress = (startDate?: Date, endDate?: Date) => {
    let relevantPlans = dailyPlans;
    
    if (startDate && endDate) {
      relevantPlans = dailyPlans.filter(plan => {
        const planDate = new Date(plan.date);
        return isWithinInterval(planDate, { start: startDate, end: endDate });
      });
    }
    
    if (relevantPlans.length === 0) return 0;
    
    const totalProgress = relevantPlans.reduce((sum, plan) => sum + plan.progress, 0);
    return totalProgress / relevantPlans.length;
  };

  // Future day planning
  const addGoalToFutureDay = (date: string, goalId: string) => {
    // Get the goal from library
    const goal = goalsLibrary.find(g => g.id === goalId);
    if (!goal) return;
    
    // Check if plan exists for this date, create if not
    let plan = dailyPlans.find(p => p.date === date);
    if (!plan) {
      plan = createDailyPlan(date);
    }
    
    // Check if goal is already in the plan
    const goalExists = plan.goals.some(g => g.id === goalId);
    if (goalExists) return;
    
    // Add goal to the plan
    setDailyPlans(prev => 
      prev.map(p => {
        if (p.date !== date) return p;
        
        const newGoal = { ...goal, completed: false };
        const updatedGoals = [...p.goals, newGoal];
        
        return {
          ...p,
          goals: updatedGoals,
        };
      })
    );
  };

  const addActivityToFutureDay = (date: string, activityId: string) => {
    // Get the activity
    const activity = productiveActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    // Check if plan exists for this date, create if not
    let plan = dailyPlans.find(p => p.date === date);
    if (!plan) {
      plan = createDailyPlan(date);
    }
    
    // Create a goal from the activity
    const activityGoal: Goal = {
      id: `activity-${activityId}-${Date.now()}`,
      title: activity.name,
      description: activity.description,
      completed: false,
      isAutomatic: false,
      hasTimer: false,
      createdAt: new Date().toISOString(),
    };
    
    // Add to the plan
    setDailyPlans(prev => 
      prev.map(p => {
        if (p.date !== date) return p;
        
        return {
          ...p,
          goals: [...p.goals, activityGoal],
        };
      })
    );
    
    // Create activity entry
    const newEntry: ActivityEntry = {
      id: generateId(),
      activityId,
      date,
      duration: activity.estimatedDuration || 0,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setActivityEntries(prev => [...prev, newEntry]);
  };

  const getDailyPlan = (date: string) => {
    return dailyPlans.find(plan => plan.date === date);
  };

  const createDailyPlan = (date: string) => {
    // Check if plan already exists
    const existingPlan = dailyPlans.find(plan => plan.date === date);
    if (existingPlan) return existingPlan;
    
    // Create new plan
    const newPlan: DailyPlan = {
      date,
      goals: [],
      goalsCompleted: 0,
      progress: 0,
    };
    
    // Add automatic goals
    const automaticGoals = goalsLibrary.filter(goal => goal.isAutomatic);
    if (automaticGoals.length > 0) {
      newPlan.goals = automaticGoals.map(goal => ({
        ...goal,
        completed: false,
      }));
    }
    
    // Add active habits as goals
    const activeHabits = habits.filter(habit => habit.isActive);
    if (activeHabits.length > 0) {
      const habitGoals = activeHabits.map(habit => ({
        id: `habit-${habit.id}`,
        title: habit.title,
        description: habit.description,
        completed: false,
        isAutomatic: true,
        hasTimer: false,
        createdAt: new Date().toISOString(),
      }));
      
      newPlan.goals = [...newPlan.goals, ...habitGoals];
    }
    
    // Add to daily plans
    setDailyPlans(prev => [...prev, newPlan]);
    
    return newPlan;
  };

  // Daily plan management
  const createTodaysPlan = () => {
    // Check if today's plan already exists
    if (todaysPlan) return;
    
    // Create new plan for today
    const newPlan: DailyPlan = {
      date: today,
      goals: [],
      goalsCompleted: 0,
      progress: 0,
      quote: quoteOfTheDay,
    };
    
    // Add automatic goals
    const automaticGoals = goalsLibrary.filter(goal => goal.isAutomatic);
    if (automaticGoals.length > 0) {
      newPlan.goals = automaticGoals.map(goal => ({
        ...goal,
        completed: false,
      }));
    }
    
    // Add active habits as goals
    const activeHabits = habits.filter(habit => habit.isActive);
    if (activeHabits.length > 0) {
      const habitGoals = activeHabits.map(habit => ({
        id: `habit-${habit.id}`,
        title: habit.title,
        description: habit.description,
        completed: false,
        isAutomatic: true,
        hasTimer: false,
        createdAt: new Date().toISOString(),
      }));
      
      newPlan.goals = [...newPlan.goals, ...habitGoals];
    }
    
    // Add to daily plans
    setDailyPlans(prev => [...prev, newPlan]);
  };

  const addGoalToDay = (date: string, goal: Goal) => {
    setDailyPlans(prev => {
      // Find the plan for the specified date
      const planIndex = prev.findIndex(plan => plan.date === date);
      
      if (planIndex === -1) {
        // Create a new plan if it doesn't exist
        const newPlan: DailyPlan = {
          date,
          goals: [{ ...goal, completed: false }],
          goalsCompleted: 0,
          progress: 0,
        };
        return [...prev, newPlan];
      } else {
        // Update existing plan
        const updatedPlans = [...prev];
        const plan = { ...updatedPlans[planIndex] };
        
        // Check if goal already exists in the plan
        const goalExists = plan.goals.some(g => g.id === goal.id);
        if (!goalExists) {
          plan.goals = [...plan.goals, { ...goal, completed: false }];
        }
        
        updatedPlans[planIndex] = plan;
        return updatedPlans;
      }
    });
  };

  // Workouts
  const addWorkout = (workout: Omit<Workout, 'id' | 'createdAt'>) => {
    const newWorkout: Workout = {
      id: generateId(),
      ...workout,
      createdAt: new Date().toISOString(),
    };
    
    setWorkouts(prev => [...prev, newWorkout]);
  };

  const updateWorkout = (workoutId: string, updates: Partial<Workout>) => {
    setWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId ? { ...workout, ...updates } : workout
      )
    );
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
  };

  // Daily Planner
  const getDailyEntry = (date: string) => {
    return dailyEntries.find(entry => entry.date === date);
  };

  const updateDailyEntry = (date: string, updates: Partial<DailyEntry>) => {
    setDailyEntries(prev => {
      const entryIndex = prev.findIndex(entry => entry.date === date);
      
      if (entryIndex === -1) {
        // Create new entry
        const newEntry: DailyEntry = {
          id: `entry-${date}`,
          date,
          goals: [],
          sleep: { hours: 0, quality: 'fair' },
          meals: {},
          workouts: { completed: [], duration: 0 },
          thoughts: '',
          rating: 0,
          customFields: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...updates,
        };
        return [...prev, newEntry];
      } else {
        // Update existing entry
        const updatedEntries = [...prev];
        updatedEntries[entryIndex] = {
          ...updatedEntries[entryIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updatedEntries;
      }
    });
  };

  const addCustomColumn = (column: CustomColumn) => {
    setPlannerSettings(prev => ({
      ...prev,
      customColumns: [...prev.customColumns, column],
    }));
  };

  const removeCustomColumn = (columnId: string) => {
    setPlannerSettings(prev => ({
      ...prev,
      customColumns: prev.customColumns.filter(col => col.id !== columnId),
    }));
  };

  const updatePlannerSettings = (settings: Partial<DailyPlannerSettings>) => {
    setPlannerSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };

  // Habits
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHabit: Habit = {
      id: generateId(),
      ...habitData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setHabits(prev => [...prev, newHabit]);
    
    // Add habit to today's plan
    if (todaysPlan) {
      const habitGoal: Goal = {
        id: `habit-${newHabit.id}`,
        title: newHabit.title,
        description: newHabit.description,
        completed: false,
        isAutomatic: true,
        hasTimer: false,
        createdAt: new Date().toISOString(),
      };
      
      setDailyPlans(prev => 
        prev.map(plan => {
          if (plan.date !== today) return plan;
          
          return {
            ...plan,
            goals: [...plan.goals, habitGoal],
          };
        })
      );
    }
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => 
      prev.map(habit => 
        habit.id === habitId ? { ...habit, ...updates, updatedAt: new Date().toISOString() } : habit
      )
    );
    
    // Update habit in daily plans if title or description changed
    if (updates.title || updates.description) {
      setDailyPlans(prev => 
        prev.map(plan => ({
          ...plan,
          goals: plan.goals.map(goal => {
            if (goal.id === `habit-${habitId}`) {
              return {
                ...goal,
                title: updates.title || goal.title,
                description: updates.description !== undefined ? updates.description : goal.description,
              };
            }
            return goal;
          }),
        }))
      );
    }
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
    
    // Remove habit from daily plans
    setDailyPlans(prev => 
      prev.map(plan => ({
        ...plan,
        goals: plan.goals.filter(goal => goal.id !== `habit-${habitId}`),
      }))
    );
    
    // Remove habit entries
    setHabitEntries(prev => prev.filter(entry => entry.habitId !== habitId));
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    // Find existing entry
    const existingEntry = habitEntries.find(entry => entry.habitId === habitId && entry.date === date);
    
    if (existingEntry) {
      // Toggle existing entry
      setHabitEntries(prev => 
        prev.map(entry => {
          if (entry.habitId === habitId && entry.date === date) {
            return {
              ...entry,
              completed: !entry.completed,
              completedAt: !entry.completed ? new Date().toISOString() : undefined,
            };
          }
          return entry;
        })
      );
      
      // Update corresponding goal in daily plan
      setDailyPlans(prev => 
        prev.map(plan => {
          if (plan.date !== date) return plan;
          
          const updatedGoals = plan.goals.map(goal => {
            if (goal.id === `habit-${habitId}`) {
              const completed = !existingEntry.completed;
              return { ...goal, completed };
            }
            return goal;
          });
          
          const goalsCompleted = updatedGoals.filter(goal => goal.completed).length;
          const progress = updatedGoals.length > 0 ? goalsCompleted / updatedGoals.length : 0;
          
          return {
            ...plan,
            goals: updatedGoals,
            goalsCompleted,
            progress,
          };
        })
      );
      
      // Award XP if completing
      if (!existingEntry.completed) {
        awardXP(XP_REWARDS.HABIT_COMPLETED, 'Habit completed');
      }
    } else {
      // Create new entry
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      
      setHabitEntries(prev => [...prev, newEntry]);
      
      // Update corresponding goal in daily plan
      setDailyPlans(prev => 
        prev.map(plan => {
          if (plan.date !== date) return plan;
          
          const updatedGoals = plan.goals.map(goal => {
            if (goal.id === `habit-${habitId}`) {
              return { ...goal, completed: true };
            }
            return goal;
          });
          
          const goalsCompleted = updatedGoals.filter(goal => goal.completed).length;
          const progress = updatedGoals.length > 0 ? goalsCompleted / updatedGoals.length : 0;
          
          return {
            ...plan,
            goals: updatedGoals,
            goalsCompleted,
            progress,
          };
        })
      );
      
      // Award XP
      awardXP(XP_REWARDS.HABIT_COMPLETED, 'Habit completed');
    }
  };

  // Long-term Goals
  const addLongTermGoal = (goalData: Omit<LongTermGoal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'subtasks'> & { subtasks: string[] }) => {
    const { subtasks: subtaskTitles, ...rest } = goalData;
    
    const subtasks: SubTask[] = subtaskTitles.map((title, index) => ({
      id: generateId(),
      title,
      completed: false,
      order: index,
    }));
    
    const newGoal: LongTermGoal = {
      id: generateId(),
      ...rest,
      progress: 0,
      subtasks,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLongTermGoals(prev => [...prev, newGoal]);
  };

  const updateLongTermGoal = (goalId: string, updates: Partial<LongTermGoal>) => {
    setLongTermGoals(prev => 
      prev.map(goal => {
        if (goal.id === goalId) {
          return { 
            ...goal, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return goal;
      })
    );
  };

  const deleteLongTermGoal = (goalId: string) => {
    setLongTermGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const toggleSubtask = (goalId: string, subtaskId: string) => {
    setLongTermGoals(prev => 
      prev.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const updatedSubtasks = goal.subtasks.map(subtask => {
          if (subtask.id === subtaskId) {
            return { 
              ...subtask, 
              completed: !subtask.completed,
              completedAt: !subtask.completed ? new Date().toISOString() : undefined,
            };
          }
          return subtask;
        });
        
        const completedSubtasks = updatedSubtasks.filter(subtask => subtask.completed).length;
        const progress = updatedSubtasks.length > 0 ? completedSubtasks / updatedSubtasks.length : 0;
        
        // Check if all subtasks are completed
        const allCompleted = updatedSubtasks.every(subtask => subtask.completed);
        const status = allCompleted ? 'completed' : 'in_progress';
        
        // Award XP for completing subtask
        if (updatedSubtasks.find(s => s.id === subtaskId)?.completed) {
          awardXP(XP_REWARDS.GOAL_SUBTASK_COMPLETED, 'Goal subtask completed');
        }
        
        return {
          ...goal,
          subtasks: updatedSubtasks,
          progress,
          status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addSubtask = (goalId: string, title: string) => {
    setLongTermGoals(prev => 
      prev.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const newSubtask: SubTask = {
          id: generateId(),
          title,
          completed: false,
          order: goal.subtasks.length,
        };
        
        const updatedSubtasks = [...goal.subtasks, newSubtask];
        const completedSubtasks = updatedSubtasks.filter(subtask => subtask.completed).length;
        const progress = updatedSubtasks.length > 0 ? completedSubtasks / updatedSubtasks.length : 0;
        
        return {
          ...goal,
          subtasks: updatedSubtasks,
          progress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const removeSubtask = (goalId: string, subtaskId: string) => {
    setLongTermGoals(prev => 
      prev.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const updatedSubtasks = goal.subtasks.filter(subtask => subtask.id !== subtaskId);
        const completedSubtasks = updatedSubtasks.filter(subtask => subtask.completed).length;
        const progress = updatedSubtasks.length > 0 ? completedSubtasks / updatedSubtasks.length : 0;
        
        return {
          ...goal,
          subtasks: updatedSubtasks,
          progress,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Journal
  const addJournalEntry = (date: string, entryData: Partial<JournalEntry>) => {
    const newEntry: JournalEntry = {
      id: generateId(),
      date,
      type: entryData.type || 'free',
      mood: entryData.mood || 3,
      energy: entryData.energy || 3,
      stress: entryData.stress || 3,
      gratitude: entryData.gratitude || [],
      reflection: entryData.reflection || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...entryData,
    };
    
    setJournalEntries(prev => [...prev, newEntry]);
    
    // Award XP for journal entry
    awardXP(XP_REWARDS.JOURNAL_ENTRY, 'Journal entry created');
  };

  const updateJournalEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => 
      prev.map(entry => {
        if (entry.id === entryId) {
          return { 
            ...entry, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return entry;
      })
    );
  };

  const deleteJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Gamification
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return { ...prev, ...updates, updatedAt: new Date().toISOString() };
    });
  };

  const awardXP = (amount: number, reason: string) => {
    if (!userProfile) return;
    
    const newTotalXP = userProfile.totalXP + amount;
    const { level, xpToNextLevel } = calculateLevel(newTotalXP);
    
    const leveledUp = level > userProfile.level;
    
    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        level,
        xp: newTotalXP - (LEVEL_THRESHOLDS[level] || 0),
        xpToNextLevel,
        totalXP: newTotalXP,
        updatedAt: new Date().toISOString(),
      };
    });
    
    // Add achievement for level up
    if (leveledUp) {
      const levelUpAchievement: Achievement = {
        id: `level-up-${level}-${Date.now()}`,
        type: 'level_up',
        title: `Level ${level} Achieved!`,
        description: `You've reached level ${level} on your productivity journey.`,
        xpReward: 0, // No XP for level up achievement
        icon: 'Star',
        color: COLORS.warning[500],
        date: new Date().toISOString(),
      };
      
      setAchievements(prev => [...prev, levelUpAchievement]);
    }
  };

  const generateTodaysChallenge = () => {
    const completedChallengeIds = achievements
      .filter(a => a.type === 'badge_earned')
      .map(a => a.id);
    
    const challenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
    
    const newChallenge: DailyChallenge = {
      id: generateId(),
      date: today,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type as any,
      xpReward: challenge.xpReward,
      completed: false,
    };
    
    setDailyChallenge(newChallenge);
  };

  const completeDailyChallenge = () => {
    if (!dailyChallenge || dailyChallenge.completed) return;
    
    setDailyChallenge(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completed: true,
        completedAt: new Date().toISOString(),
      };
    });
    
    // Award XP
    awardXP(dailyChallenge.xpReward, `Daily challenge completed: ${dailyChallenge.title}`);
  };

  const scheduleQuizReminders = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
      }
      
      // Cancel existing reminders
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Schedule morning reminder (8 AM)
      const morningDate = new Date();
      morningDate.setHours(8, 0, 0, 0);
      if (morningDate.getTime() < Date.now()) {
        morningDate.setDate(morningDate.getDate() + 1);
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Morning Planning',
          body: 'Start your day with intention by completing your morning planning.',
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        },
      });
      
      // Schedule evening reminder (9 PM)
      const eveningDate = new Date();
      eveningDate.setHours(21, 0, 0, 0);
      if (eveningDate.getTime() < Date.now()) {
        eveningDate.setDate(eveningDate.getDate() + 1);
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening Reflection',
          body: 'Take a moment to reflect on your day and plan for tomorrow.',
        },
        trigger: {
          hour: 21,
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Error scheduling quiz reminders:', error);
    }
  };

  // Sleep & Wellness
  const addSleepData = (sleepData: Omit<SleepData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSleepData: SleepData = {
      id: generateId(),
      ...sleepData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSleepData(prev => [...prev, newSleepData]);
  };

  const updateSleepData = (sleepId: string, updates: Partial<SleepData>) => {
    setSleepData(prev => 
      prev.map(sleep => {
        if (sleep.id === sleepId) {
          return { 
            ...sleep, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return sleep;
      })
    );
  };

  // Social Media Tracking
  const addTrackedApp = (appData: Omit<TrackedApp, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApp: TrackedApp = {
      id: generateId(),
      ...appData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setTrackedApps(prev => [...prev, newApp]);
  };

  const updateTrackedApp = (appId: string, updates: Partial<TrackedApp>) => {
    setTrackedApps(prev => 
      prev.map(app => {
        if (app.id === appId) {
          return { 
            ...app, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return app;
      })
    );
  };

  const removeTrackedApp = (appId: string) => {
    setTrackedApps(prev => prev.filter(app => app.id !== appId));
  };

  const addAppUsageSession = (sessionData: Omit<AppUsageSession, 'id' | 'createdAt'>) => {
    const newSession: AppUsageSession = {
      id: generateId(),
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    
    setAppUsageSessions(prev => [...prev, newSession]);
  };

  const addIntentPromptResponse = (responseData: Omit<IntentPromptResponse, 'id' | 'createdAt'>) => {
    const newResponse: IntentPromptResponse = {
      id: generateId(),
      ...responseData,
      createdAt: new Date().toISOString(),
    };
    
    setIntentPromptResponses(prev => [...prev, newResponse]);
  };

  const addSocialMediaReflection = (reflectionData: Omit<SocialMediaReflection, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReflection: SocialMediaReflection = {
      id: generateId(),
      ...reflectionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSocialMediaReflections(prev => [...prev, newReflection]);
  };

  const addUsageAlert = (alertData: Omit<UsageAlert, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAlert: UsageAlert = {
      id: generateId(),
      ...alertData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setUsageAlerts(prev => [...prev, newAlert]);
  };

  const updateUsageAlert = (alertId: string, updates: Partial<UsageAlert>) => {
    setUsageAlerts(prev => 
      prev.map(alert => {
        if (alert.id === alertId) {
          return { 
            ...alert, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return alert;
      })
    );
  };

  const removeUsageAlert = (alertId: string) => {
    setUsageAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Digital Wellness Goals
  const addDigitalWellnessGoal = (goalData: Omit<DigitalWellnessGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: DigitalWellnessGoal = {
      id: generateId(),
      ...goalData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setDigitalWellnessGoals(prev => [...prev, newGoal]);
  };

  const updateDigitalWellnessGoal = (goalId: string, updates: Partial<DigitalWellnessGoal>) => {
    setDigitalWellnessGoals(prev => 
      prev.map(goal => {
        if (goal.id === goalId) {
          return { 
            ...goal, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return goal;
      })
    );
  };

  // Productive Activities
  const addProductiveActivity = (activityData: Omit<ProductiveActivity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newActivity: ProductiveActivity = {
      id: generateId(),
      ...activityData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProductiveActivities(prev => [...prev, newActivity]);
  };

  const updateProductiveActivity = (activityId: string, updates: Partial<ProductiveActivity>) => {
    setProductiveActivities(prev => 
      prev.map(activity => {
        if (activity.id === activityId) {
          return { 
            ...activity, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return activity;
      })
    );
  };

  const deleteProductiveActivity = (activityId: string) => {
    setProductiveActivities(prev => prev.filter(activity => activity.id !== activityId));
    
    // Remove activity entries
    setActivityEntries(prev => prev.filter(entry => entry.activityId !== activityId));
  };

  const addActivityToToday = (activityId: string) => {
    // Get the activity
    const activity = productiveActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    // Create a goal from the activity
    const activityGoal: Goal = {
      id: `activity-${activityId}-${Date.now()}`,
      title: activity.name,
      description: activity.description,
      completed: false,
      isAutomatic: false,
      hasTimer: false,
      createdAt: new Date().toISOString(),
    };
    
    // Add to today's plan
    setDailyPlans(prev => 
      prev.map(plan => {
        if (plan.date !== today) return plan;
        
        return {
          ...plan,
          goals: [...plan.goals, activityGoal],
        };
      })
    );
    
    // Create activity entry
    const newEntry: ActivityEntry = {
      id: generateId(),
      activityId,
      date: today,
      duration: activity.estimatedDuration || 0,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setActivityEntries(prev => [...prev, newEntry]);
  };

  // Analytics & Dashboard
  const updateDashboardMetric = (metricId: string, updates: Partial<DashboardMetric>) => {
    setDashboardMetrics(prev => 
      prev.map(metric => {
        if (metric.id === metricId) {
          return { ...metric, ...updates };
        }
        return metric;
      })
    );
  };

  const toggleMetricPin = (metricId: string) => {
    setDashboardMetrics(prev => 
      prev.map(metric => {
        if (metric.id === metricId) {
          return { ...metric, isPinned: !metric.isPinned };
        }
        return metric;
      })
    );
  };

  const getAnalytics = (): Analytics => {
    // Calculate habit analytics
    const totalHabitsCompleted = habitEntries.filter(entry => entry.completed).length;
    const habitCompletionRate = habits.length > 0 
      ? habitEntries.filter(entry => entry.completed).length / habitEntries.length 
      : 0;
    
    const habitCategoryBreakdown = habits.reduce((acc, habit) => {
      const category = habit.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const habitCategoryData = Object.entries(habitCategoryBreakdown).map(([category, count]) => ({
      category,
      count,
    }));
    
    // Calculate goal analytics
    const completedGoals = longTermGoals.filter(goal => goal.status === 'completed');
    const inProgressGoals = longTermGoals.filter(goal => goal.status === 'in_progress');
    
    const goalCategoryBreakdown = longTermGoals.reduce((acc, goal) => {
      const category = goal.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const goalCategoryData = Object.entries(goalCategoryBreakdown).map(([category, count]) => ({
      category,
      count,
    }));
    
    // Calculate mood analytics
    const moodEntries = journalEntries.filter(entry => entry.mood !== undefined);
    const averageMood = moodEntries.length > 0
      ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
      : 0;
    
    const moodTrend = moodEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map(entry => ({
        date: entry.date,
        mood: entry.mood,
      }));
    
    const energyTrend = journalEntries
      .filter(entry => entry.energy !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map(entry => ({
        date: entry.date,
        energy: entry.energy,
      }));
    
    const stressTrend = journalEntries
      .filter(entry => entry.stress !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map(entry => ({
        date: entry.date,
        stress: entry.stress,
      }));
    
    // Calculate sleep analytics
    const sleepEntries = sleepData.filter(entry => entry.hoursSlept > 0);
    const averageSleepHours = sleepEntries.length > 0
      ? sleepEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0) / sleepEntries.length
      : 0;
    
    const averageSleepQuality = sleepEntries.length > 0
      ? sleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / sleepEntries.length
      : 0;
    
    const sleepTrend = sleepEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map(entry => ({
        date: entry.date,
        hours: entry.hoursSlept,
        quality: entry.quality,
      }));
    
    // Calculate social media analytics
    const socialEntries = appUsageSessions;
    const dailyAverageSocial = socialEntries.length > 0
      ? socialEntries.reduce((sum, entry) => sum + entry.duration, 0) / 
        [...new Set(socialEntries.map(entry => entry.date))].length
      : 0;
    
    const appBreakdown = trackedApps.map(app => {
      const appSessions = socialEntries.filter(entry => entry.appId === app.id);
      const minutes = appSessions.reduce((sum, entry) => sum + entry.duration, 0);
      return {
        app: app.displayName,
        minutes,
      };
    }).filter(item => item.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
    
    const intentfulResponses = intentPromptResponses.filter(
      response => response.reason !== 'skipped' && response.reason !== 'bored'
    );
    
    const intentfulnessScore = intentPromptResponses.length > 0
      ? (intentfulResponses.length / intentPromptResponses.length) * 100
      : 0;
    
    const reasonCounts = intentPromptResponses.reduce((acc, response) => {
      acc[response.reason] = (acc[response.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate productivity analytics
    const tasksCompleted = dailyPlans.reduce(
      (sum, plan) => sum + plan.goalsCompleted, 
      0
    );
    
    const averageDailyProgress = dailyPlans.length > 0
      ? dailyPlans.reduce((sum, plan) => sum + plan.progress, 0) / dailyPlans.length
      : 0;
    
    const weeklyTrends = [];
    for (let i = 0; i < 4; i++) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      
      const weekPlans = dailyPlans.filter(plan => {
        const planDate = new Date(plan.date);
        return planDate >= weekStart && planDate <= weekEnd;
      });
      
      const weekProgress = weekPlans.length > 0
        ? weekPlans.reduce((sum, plan) => sum + plan.progress, 0) / weekPlans.length
        : 0;
      
      weeklyTrends.unshift({
        week: `Week ${4-i}`,
        progress: weekProgress,
      });
    }
    
    return {
      habits: {
        totalCompleted: totalHabitsCompleted,
        streakData: [],
        categoryBreakdown: habitCategoryData,
        completionRate: habitCompletionRate,
      },
      goals: {
        totalCompleted: completedGoals.length,
        inProgress: inProgressGoals.length,
        averageCompletionTime: 0,
        categoryBreakdown: goalCategoryData,
      },
      mood: {
        averageMood,
        moodTrend,
        energyTrend,
        stressTrend,
      },
      sleep: {
        averageHours: averageSleepHours,
        averageQuality: averageSleepQuality,
        sleepTrend,
        weeklyPattern: [],
      },
      socialMedia: {
        dailyAverage: dailyAverageSocial,
        weeklyTrend: [],
        appBreakdown,
        streakDaysUnderAverage: 0,
        intentfulnessScore,
        mostCommonReasons,
      },
      productivity: {
        tasksCompleted,
        averageDailyProgress,
        mostProductiveDays: [],
        weeklyTrends,
        activitiesCompleted: [],
      },
    };
  };

  return (
    <AppContext.Provider
      value={{
        // Goals
        goalsLibrary,
        todaysGoals,
        dailyPlans,
        progressToday,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalById,
        completeGoal,
        uncompleteGoal,
        setTimerForGoal,
        scheduleNotification,
        updateGoalSchedule,
        toggleAutomaticGoal,
        getAverageProgress,
        
        // Future day planning
        addGoalToFutureDay,
        addActivityToFutureDay,
        getDailyPlan,
        createDailyPlan,

        // Workouts
        workouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,

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
        addSubtask,
        removeSubtask,

        // Journal
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        canTakeMorningQuiz,
        canTakeEveningQuiz,

        // Gamification
        userProfile,
        achievements,
        dailyChallenge,
        updateUserProfile,
        awardXP,
        completeDailyChallenge,
        scheduleQuizReminders,

        // Sleep & Wellness
        sleepData,
        addSleepData,
        updateSleepData,

        // Social Media Tracking
        socialMediaData,
        trackedApps,
        appUsageSessions,
        intentPromptResponses,
        socialMediaReflections,
        usageAlerts,
        addTrackedApp,
        updateTrackedApp,
        removeTrackedApp,
        addAppUsageSession,
        addIntentPromptResponse,
        addSocialMediaReflection,
        addUsageAlert,
        updateUsageAlert,
        removeUsageAlert,

        // Digital Wellness Goals
        digitalWellnessGoals,
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
        dashboardMetrics,
        updateDashboardMetric,
        toggleMetricPin,
        getAnalytics,

        // Quotes
        quoteOfTheDay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };