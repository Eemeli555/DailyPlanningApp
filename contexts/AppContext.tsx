import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useRouter } from 'expo-router';
import { 
  DailyPlan, 
  Goal, 
  NotificationConfig, 
  Workout, 
  Exercise, 
  DailyEntry, 
  CustomColumn, 
  DailyPlannerSettings,
  Habit,
  HabitEntry,
  LongTermGoal,
  JournalEntry,
  UserProfile,
  Achievement,
  DailyChallenge,
  SleepData,
  SocialMediaUsage,
  ProductiveActivity,
  ActivityEntry,
  Analytics,
  DashboardMetric
} from '@/types';
import { generateId } from '@/utils/helpers';
import { calculateLevel, checkForNewAchievements, generateDailyChallenge } from '@/utils/gamification';
import { XP_REWARDS } from '@/constants/gamification';
import { COLORS } from '@/constants/theme';

interface AppContextProps {
  goalsLibrary: Goal[];
  todaysGoals: Goal[];
  dailyPlans: DailyPlan[];
  progressToday: number;
  workouts: Workout[];
  quoteOfTheDay: { text: string; author: string };
  
  // Daily Planner
  dailyEntries: DailyEntry[];
  plannerSettings: DailyPlannerSettings;
  
  // New features
  habits: Habit[];
  habitEntries: HabitEntry[];
  longTermGoals: LongTermGoal[];
  journalEntries: JournalEntry[];
  userProfile: UserProfile | null;
  achievements: Achievement[];
  dailyChallenge: DailyChallenge | null;
  sleepData: SleepData[];
  socialMediaData: SocialMediaUsage[];
  productiveActivities: ProductiveActivity[];
  activityEntries: ActivityEntry[];
  dashboardMetrics: DashboardMetric[];
  
  addGoal: (data: { 
    title: string;
    description?: string;
    addToToday?: boolean;
  }) => void;
  
  updateGoal: (goalId: string, data: {
    title: string;
    description?: string;
  }) => void;
  
  deleteGoal: (goalId: string) => void;
  completeGoal: (goalId: string) => void;
  uncompleteGoal: (goalId: string) => void;
  getGoalById: (goalId: string) => Goal | undefined;
  getAverageProgress: (startDate?: Date, endDate?: Date) => number;
  setTimerForGoal: (goalId: string) => void;
  scheduleNotification: (goalId: string, config: NotificationConfig) => void;
  updateGoalSchedule: (goalId: string, schedule: { start: string; end: string }) => void;
  
  // Workout functions
  addWorkout: (data: {
    name: string;
    description?: string;
    exercises: Exercise[];
    duration: number;
  }) => void;
  updateWorkout: (workoutId: string, data: {
    name: string;
    description?: string;
    exercises: Exercise[];
    duration: number;
  }) => void;
  deleteWorkout: (workoutId: string) => void;
  getWorkoutById: (workoutId: string) => Workout | undefined;
  
  // Daily Planner functions
  getDailyEntry: (date: string) => DailyEntry | undefined;
  updateDailyEntry: (date: string, updates: Partial<DailyEntry>) => void;
  addCustomColumn: (column: CustomColumn) => void;
  updateCustomColumn: (columnId: string, updates: Partial<CustomColumn>) => void;
  removeCustomColumn: (columnId: string) => void;
  updatePlannerSettings: (settings: Partial<DailyPlannerSettings>) => void;
  getEntriesForMonth: (year: number, month: number) => DailyEntry[];
  
  // New feature functions
  addHabit: (data: {
    title: string;
    description?: string;
    category: string;
    frequency: 'daily' | 'weekly';
    targetCount?: number;
    unit?: string;
    color: string;
    icon: string;
  }) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  
  addLongTermGoal: (data: {
    title: string;
    description?: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    subtasks: string[];
    color: string;
  }) => void;
  updateLongTermGoal: (goalId: string, updates: Partial<LongTermGoal>) => void;
  deleteLongTermGoal: (goalId: string) => void;
  toggleSubtask: (goalId: string, subtaskId: string) => void;
  
  addJournalEntry: (date: string, data: {
    type?: 'morning' | 'evening' | 'free';
    mood: number;
    energy?: number;
    stress?: number;
    reflection?: string;
    gratitude?: string[];
    highlights?: string;
    challenges?: string;
    tomorrowFocus?: string;
    sleepHours?: number;
    sleepQuality?: number;
    morningFeeling?: string;
    mainFocus?: string;
    dailyGoals?: string[];
    morningGratitude?: string;
  }) => void;
  updateJournalEntry: (entryId: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (entryId: string) => void;
  
  // Sleep tracking
  addSleepData: (data: {
    date: string;
    hoursSlept: number;
    quality: number;
    bedTime?: string;
    wakeTime?: string;
    notes?: string;
  }) => void;
  updateSleepData: (sleepId: string, updates: Partial<SleepData>) => void;
  
  // Social media tracking
  addSocialMediaUsage: (data: {
    date: string;
    totalMinutes: number;
    apps: { name: string; minutes: number; category: string }[];
    notes?: string;
  }) => void;
  updateSocialMediaUsage: (usageId: string, updates: Partial<SocialMediaUsage>) => void;
  
  // Productive activities
  addProductiveActivity: (data: {
    name: string;
    description?: string;
    category: 'mind' | 'body' | 'work' | 'creative' | 'social' | 'other';
    color: string;
    icon: string;
    estimatedDuration?: number;
  }) => void;
  updateProductiveActivity: (activityId: string, updates: Partial<ProductiveActivity>) => void;
  deleteProductiveActivity: (activityId: string) => void;
  addActivityToToday: (activityId: string) => void;
  
  // Dashboard metrics
  updateDashboardMetric: (metricId: string, updates: Partial<DashboardMetric>) => void;
  toggleMetricPin: (metricId: string) => void;
  getAnalytics: () => Analytics;
  
  awardXP: (amount: number, reason: string) => void;
  completeDailyChallenge: () => void;
}

export const AppContext = createContext<AppContextProps>({
  goalsLibrary: [],
  todaysGoals: [],
  dailyPlans: [],
  progressToday: 0,
  workouts: [],
  quoteOfTheDay: { text: '', author: '' },
  dailyEntries: [],
  plannerSettings: { customColumns: [], autoFillEnabled: true },
  habits: [],
  habitEntries: [],
  longTermGoals: [],
  journalEntries: [],
  userProfile: null,
  achievements: [],
  dailyChallenge: null,
  sleepData: [],
  socialMediaData: [],
  productiveActivities: [],
  activityEntries: [],
  dashboardMetrics: [],
  
  addGoal: () => {},
  updateGoal: () => {},
  deleteGoal: () => {},
  completeGoal: () => {},
  uncompleteGoal: () => {},
  getGoalById: () => undefined,
  getAverageProgress: () => 0,
  setTimerForGoal: () => {},
  scheduleNotification: () => {},
  updateGoalSchedule: () => {},
  
  addWorkout: () => {},
  updateWorkout: () => {},
  deleteWorkout: () => {},
  getWorkoutById: () => undefined,
  
  getDailyEntry: () => undefined,
  updateDailyEntry: () => {},
  addCustomColumn: () => {},
  updateCustomColumn: () => {},
  removeCustomColumn: () => {},
  updatePlannerSettings: () => {},
  getEntriesForMonth: () => [],
  
  addHabit: () => {},
  updateHabit: () => {},
  deleteHabit: () => {},
  toggleHabitCompletion: () => {},
  
  addLongTermGoal: () => {},
  updateLongTermGoal: () => {},
  deleteLongTermGoal: () => {},
  toggleSubtask: () => {},
  
  addJournalEntry: () => {},
  updateJournalEntry: () => {},
  deleteJournalEntry: () => {},
  
  addSleepData: () => {},
  updateSleepData: () => {},
  
  addSocialMediaUsage: () => {},
  updateSocialMediaUsage: () => {},
  
  addProductiveActivity: () => {},
  updateProductiveActivity: () => {},
  deleteProductiveActivity: () => {},
  addActivityToToday: () => {},
  
  updateDashboardMetric: () => {},
  toggleMetricPin: () => {},
  getAnalytics: () => ({
    habits: { totalCompleted: 0, streakData: [], categoryBreakdown: [], completionRate: 0 },
    goals: { totalCompleted: 0, inProgress: 0, averageCompletionTime: 0, categoryBreakdown: [] },
    mood: { averageMood: 0, moodTrend: [], energyTrend: [], stressTrend: [] },
    sleep: { averageHours: 0, averageQuality: 0, sleepTrend: [], weeklyPattern: [] },
    socialMedia: { dailyAverage: 0, weeklyTrend: [], appBreakdown: [], streakDaysUnderAverage: 0 },
    productivity: { tasksCompleted: 0, averageDailyProgress: 0, mostProductiveDays: [], weeklyTrends: [], activitiesCompleted: [] },
  }),
  
  awardXP: () => {},
  completeDailyChallenge: () => {},
});

const QUOTES = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    text: "It's not about being the best. It's about being better than you were yesterday.",
    author: "Unknown"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  }
];

const DEFAULT_DASHBOARD_METRICS: DashboardMetric[] = [
  {
    id: 'avg-mood',
    title: 'Average Mood',
    value: '0.0',
    subtitle: 'This week',
    trend: 'stable',
    color: COLORS.primary[600],
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
    subtitle: 'This week',
    trend: 'stable',
    color: COLORS.success[600],
    icon: '🎯',
    isPinned: true,
    category: 'goals',
  },
  {
    id: 'social-media',
    title: 'Screen Time',
    value: '0h',
    subtitle: 'Today',
    color: COLORS.warning[600],
    icon: '📱',
    isPinned: false,
    category: 'social',
  },
  {
    id: 'habit-streak',
    title: 'Habit Streak',
    value: '0',
    subtitle: 'Days',
    color: COLORS.secondary[600],
    icon: '🔥',
    isPinned: false,
    category: 'habits',
  },
  {
    id: 'productivity-score',
    title: 'Productivity',
    value: '0%',
    subtitle: 'This week',
    color: COLORS.primary[600],
    icon: '⚡',
    isPinned: false,
    category: 'productivity',
  },
];

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const router = useRouter();
  const [goalsLibrary, setGoalsLibrary] = useState<Goal[]>([]);
  const [todaysGoals, setTodaysGoals] = useState<Goal[]>([]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(QUOTES[0]);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [plannerSettings, setPlannerSettings] = useState<DailyPlannerSettings>({
    customColumns: [],
    autoFillEnabled: true,
  });
  
  // New state
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<LongTermGoal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaUsage[]>([]);
  const [productiveActivities, setProductiveActivities] = useState<ProductiveActivity[]>([]);
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetric[]>(DEFAULT_DASHBOARD_METRICS);
  
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load existing data
        const storedGoalsLibrary = await AsyncStorage.getItem('goalsLibrary');
        if (storedGoalsLibrary) {
          setGoalsLibrary(JSON.parse(storedGoalsLibrary));
        }
        
        const storedDailyPlans = await AsyncStorage.getItem('dailyPlans');
        if (storedDailyPlans) {
          setDailyPlans(JSON.parse(storedDailyPlans));
        }
        
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          setWorkouts(JSON.parse(storedWorkouts));
        }
        
        const storedDailyEntries = await AsyncStorage.getItem('dailyEntries');
        if (storedDailyEntries) {
          setDailyEntries(JSON.parse(storedDailyEntries));
        }
        
        const storedPlannerSettings = await AsyncStorage.getItem('plannerSettings');
        if (storedPlannerSettings) {
          setPlannerSettings(JSON.parse(storedPlannerSettings));
        }
        
        // Load new data
        const storedHabits = await AsyncStorage.getItem('habits');
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        }
        
        const storedHabitEntries = await AsyncStorage.getItem('habitEntries');
        if (storedHabitEntries) {
          setHabitEntries(JSON.parse(storedHabitEntries));
        }
        
        const storedLongTermGoals = await AsyncStorage.getItem('longTermGoals');
        if (storedLongTermGoals) {
          setLongTermGoals(JSON.parse(storedLongTermGoals));
        }
        
        const storedJournalEntries = await AsyncStorage.getItem('journalEntries');
        if (storedJournalEntries) {
          setJournalEntries(JSON.parse(storedJournalEntries));
        }
        
        const storedSleepData = await AsyncStorage.getItem('sleepData');
        if (storedSleepData) {
          setSleepData(JSON.parse(storedSleepData));
        }
        
        const storedSocialMediaData = await AsyncStorage.getItem('socialMediaData');
        if (storedSocialMediaData) {
          setSocialMediaData(JSON.parse(storedSocialMediaData));
        }
        
        const storedProductiveActivities = await AsyncStorage.getItem('productiveActivities');
        if (storedProductiveActivities) {
          setProductiveActivities(JSON.parse(storedProductiveActivities));
        }
        
        const storedActivityEntries = await AsyncStorage.getItem('activityEntries');
        if (storedActivityEntries) {
          setActivityEntries(JSON.parse(storedActivityEntries));
        }
        
        const storedDashboardMetrics = await AsyncStorage.getItem('dashboardMetrics');
        if (storedDashboardMetrics) {
          setDashboardMetrics(JSON.parse(storedDashboardMetrics));
        }
        
        const storedUserProfile = await AsyncStorage.getItem('userProfile');
        if (storedUserProfile) {
          setUserProfile(JSON.parse(storedUserProfile));
        } else {
          // Create initial user profile
          const initialProfile: UserProfile = {
            id: generateId(),
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
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUserProfile(initialProfile);
          await AsyncStorage.setItem('userProfile', JSON.stringify(initialProfile));
        }
        
        const storedAchievements = await AsyncStorage.getItem('achievements');
        if (storedAchievements) {
          setAchievements(JSON.parse(storedAchievements));
        }
        
        // Generate daily challenge
        const today = new Date().toISOString().split('T')[0];
        const storedDailyChallenge = await AsyncStorage.getItem(`dailyChallenge_${today}`);
        if (storedDailyChallenge) {
          setDailyChallenge(JSON.parse(storedDailyChallenge));
        } else {
          const challenge = generateDailyChallenge([], [], []);
          const newChallenge: DailyChallenge = {
            id: generateId(),
            date: today,
            ...challenge,
            completed: false,
          };
          setDailyChallenge(newChallenge);
          await AsyncStorage.setItem(`dailyChallenge_${today}`, JSON.stringify(newChallenge));
        }
        
        // Set quote of the day
        const todayNum = new Date().getDate();
        const quoteIndex = todayNum % QUOTES.length;
        setQuoteOfTheDay(QUOTES[quoteIndex]);
        
        // Initialize today's plan - Load existing plan or create empty one
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayPlan = JSON.parse(storedDailyPlans || '[]').find(
          (plan: DailyPlan) => plan.date === todayStr
        );
        
        if (todayPlan) {
          setTodaysGoals(todayPlan.goals);
        } else {
          // Start with empty goals - habits will be added separately
          setTodaysGoals([]);
        }
        
        // Set up notifications if needed
        if (Platform.OS !== 'web') {
          registerForPushNotificationsAsync();
        }
        
        setLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // Calculate progress for today - Only count real goals, not habits
  const progressToday = todaysGoals.length > 0
    ? todaysGoals.filter(goal => !goal.id.startsWith('habit-') && goal.completed).length / 
      todaysGoals.filter(goal => !goal.id.startsWith('habit-')).length
    : 0;
  
  // Update progress whenever todaysGoals changes
  useEffect(() => {
    if (!loaded) return;
    
    const updateTodaysPlan = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Only count real goals for progress calculation
      const realGoals = todaysGoals.filter(goal => !goal.id.startsWith('habit-'));
      const completedGoals = realGoals.filter(goal => goal.completed).length;
      const progress = realGoals.length > 0 ? completedGoals / realGoals.length : 0;
      
      // Update or create today's plan
      const planIndex = dailyPlans.findIndex(plan => plan.date === today);
      
      let updatedPlans;
      if (planIndex >= 0) {
        // Update existing plan
        updatedPlans = [...dailyPlans];
        updatedPlans[planIndex] = {
          ...updatedPlans[planIndex],
          goals: todaysGoals,
          goalsCompleted: completedGoals,
          progress,
        };
      } else {
        // Create new plan
        const newPlan: DailyPlan = {
          date: today,
          goals: todaysGoals,
          goalsCompleted: completedGoals,
          progress,
          quote: quoteOfTheDay,
        };
        updatedPlans = [...dailyPlans, newPlan];
      }
      
      setDailyPlans(updatedPlans);
      await AsyncStorage.setItem('dailyPlans', JSON.stringify(updatedPlans));
    };
    
    updateTodaysPlan();
  }, [todaysGoals, loaded]);
  
  // Persist data whenever it changes
  useEffect(() => {
    if (!loaded) return;
    
    const saveData = async () => {
      await AsyncStorage.setItem('goalsLibrary', JSON.stringify(goalsLibrary));
      await AsyncStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
      await AsyncStorage.setItem('plannerSettings', JSON.stringify(plannerSettings));
      await AsyncStorage.setItem('habits', JSON.stringify(habits));
      await AsyncStorage.setItem('habitEntries', JSON.stringify(habitEntries));
      await AsyncStorage.setItem('longTermGoals', JSON.stringify(longTermGoals));
      await AsyncStorage.setItem('journalEntries', JSON.stringify(journalEntries));
      await AsyncStorage.setItem('sleepData', JSON.stringify(sleepData));
      await AsyncStorage.setItem('socialMediaData', JSON.stringify(socialMediaData));
      await AsyncStorage.setItem('productiveActivities', JSON.stringify(productiveActivities));
      await AsyncStorage.setItem('activityEntries', JSON.stringify(activityEntries));
      await AsyncStorage.setItem('dashboardMetrics', JSON.stringify(dashboardMetrics));
      if (userProfile) {
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      }
      await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
    };
    
    saveData();
  }, [goalsLibrary, dailyEntries, plannerSettings, habits, habitEntries, longTermGoals, journalEntries, userProfile, achievements, sleepData, socialMediaData, productiveActivities, activityEntries, dashboardMetrics, loaded]);
  
  // Add a new goal
  const addGoal = (data: { 
    title: string; 
    description?: string; 
    addToToday?: boolean;
  }) => {
    const newGoal: Goal = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      completed: false,
      isAutomatic: false,
      hasTimer: false,
      createdAt: new Date().toISOString(),
    };
    
    // Add to goals library
    setGoalsLibrary(prev => [...prev, newGoal]);
    
    // Add to today's goals if requested
    if (data.addToToday) {
      setTodaysGoals(prev => [...prev, newGoal]);
    }
  };
  
  // Update an existing goal
  const updateGoal = (goalId: string, data: {
    title: string;
    description?: string;
  }) => {
    // Update in goals library
    setGoalsLibrary(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...data } 
        : goal
    ));
    
    // Update in today's goals if present
    setTodaysGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, title: data.title, description: data.description || '' } 
        : goal
    ));
  };
  
  // Delete a goal
  const deleteGoal = (goalId: string) => {
    // Remove from goals library
    setGoalsLibrary(prev => prev.filter(goal => goal.id !== goalId));
    
    // Remove from today's goals if present
    setTodaysGoals(prev => prev.filter(goal => goal.id !== goalId));
  };
  
  // Mark a goal as complete
  const completeGoal = (goalId: string) => {
    setTodaysGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: true } 
        : goal
    ));
    
    // Award XP only for real goals, not habits
    if (!goalId.startsWith('habit-')) {
      awardXP(XP_REWARDS.GOAL_SUBTASK_COMPLETED, 'Goal completed');
    }
  };
  
  // Mark a goal as incomplete
  const uncompleteGoal = (goalId: string) => {
    setTodaysGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: false } 
        : goal
    ));
  };
  
  // Get a goal by ID
  const getGoalById = (goalId: string) => {
    // First check in today's goals
    const todayGoal = todaysGoals.find(goal => goal.id === goalId);
    if (todayGoal) return todayGoal;
    
    // Then check in goals library
    return goalsLibrary.find(goal => goal.id === goalId);
  };
  
  // Calculate average progress - Only count real goals, not habits
  const getAverageProgress = (startDate?: Date, endDate?: Date) => {
    if (dailyPlans.length === 0) return 0;
    
    let filteredPlans;
    
    if (startDate && endDate) {
      filteredPlans = dailyPlans.filter(plan => {
        const planDate = new Date(plan.date);
        return isWithinInterval(planDate, { 
          start: startOfDay(startDate), 
          end: endOfDay(endDate) 
        });
      });
    } else {
      filteredPlans = dailyPlans;
    }
    
    if (filteredPlans.length === 0) return 0;
    
    // Calculate progress based on real goals only
    const progressValues = filteredPlans.map(plan => {
      const realGoals = plan.goals.filter(goal => !goal.id.startsWith('habit-'));
      if (realGoals.length === 0) return 0;
      return realGoals.filter(goal => goal.completed).length / realGoals.length;
    });
    
    const total = progressValues.reduce((sum, progress) => sum + progress, 0);
    return total / progressValues.length;
  };
  
  // Mark a goal for timer
  const setTimerForGoal = (goalId: string) => {
    // Open the set timer modal
    router.push({
      pathname: '/modals/set-timer',
      params: { goalId }
    });
  };
  
  // Schedule a notification
  const scheduleNotification = async (goalId: string, config: NotificationConfig) => {
    // Skip on web
    if (Platform.OS === 'web') return;
    
    const goal = getGoalById(goalId);
    if (!goal) return;
    
    // Calculate trigger time
    const triggerTime = new Date();
    triggerTime.setSeconds(triggerTime.getSeconds() + config.seconds);
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: config.type === 'timer' ? 'Timer Complete' : 'Reminder',
          body: `Time to work on: ${goal.title}`,
          sound: true,
        },
        trigger: triggerTime,
      });
      
      // Mark the goal as having a timer
      setTodaysGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { ...g, hasTimer: true } 
          : g
      ));
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };
  
  // Update goal schedule
  const updateGoalSchedule = (goalId: string, schedule: { start: string; end: string }) => {
    setTodaysGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, scheduledTime: schedule }
        : goal
    ));
  };
  
  // Register for push notifications (if not web)
  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Workout functions
  const addWorkout = (data: {
    name: string;
    description?: string;
    exercises: Exercise[];
    duration: number;
  }) => {
    const newWorkout: Workout = {
      id: generateId(),
      name: data.name,
      description: data.description,
      exercises: data.exercises,
      duration: data.duration,
      createdAt: new Date().toISOString(),
    };

    setWorkouts(prev => {
      const updated = [...prev, newWorkout];
      AsyncStorage.setItem('workouts', JSON.stringify(updated));
      return updated;
    });
  };

  const updateWorkout = (workoutId: string, data: {
    name: string;
    description?: string;
    exercises: Exercise[];
    duration: number;
  }) => {
    setWorkouts(prev => {
      const updated = prev.map(workout =>
        workout.id === workoutId
          ? { ...workout, ...data }
          : workout
      );
      AsyncStorage.setItem('workouts', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteWorkout = (workoutId: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(workout => workout.id !== workoutId);
      AsyncStorage.setItem('workouts', JSON.stringify(updated));
      return updated;
    });
  };

  const getWorkoutById = (workoutId: string) => {
    return workouts.find(workout => workout.id === workoutId);
  };

  // Daily Planner functions
  const getDailyEntry = (date: string) => {
    return dailyEntries.find(entry => entry.date === date);
  };

  const updateDailyEntry = (date: string, updates: Partial<DailyEntry>) => {
    setDailyEntries(prev => {
      const entryIndex = prev.findIndex(entry => entry.date === date);
      
      if (entryIndex >= 0) {
        const updated = [...prev];
        updated[entryIndex] = {
          ...updated[entryIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      } else {
        // Create new entry if it doesn't exist
        const newEntry = {
          id: generateId(),
          date,
          goals: [],
          sleep: { hours: 0, quality: 'fair' as const },
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
      }
    });
  };

  const addCustomColumn = (column: CustomColumn) => {
    setPlannerSettings(prev => ({
      ...prev,
      customColumns: [...prev.customColumns, column],
    }));
  };

  const updateCustomColumn = (columnId: string, updates: Partial<CustomColumn>) => {
    setPlannerSettings(prev => ({
      ...prev,
      customColumns: prev.customColumns.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      ),
    }));
  };

  const removeCustomColumn = (columnId: string) => {
    setPlannerSettings(prev => ({
      ...prev,
      customColumns: prev.customColumns.filter(col => col.id !== columnId),
    }));
    
    // Remove the custom field from all entries
    setDailyEntries(prev =>
      prev.map(entry => {
        const { [columnId]: removed, ...restCustomFields } = entry.customFields;
        return {
          ...entry,
          customFields: restCustomFields,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updatePlannerSettings = (settings: Partial<DailyPlannerSettings>) => {
    setPlannerSettings(prev => ({ ...prev, ...settings }));
  };

  const getEntriesForMonth = (year: number, month: number) => {
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));
    
    return dailyEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
    });
  };

  // New feature functions
  const addHabit = (data: {
    title: string;
    description?: string;
    category: string;
    frequency: 'daily' | 'weekly';
    targetCount?: number;
    unit?: string;
    color: string;
    icon: string;
  }) => {
    const newHabit: Habit = {
      id: generateId(),
      title: data.title,
      description: data.description,
      category: data.category as any,
      frequency: data.frequency,
      targetCount: data.targetCount,
      unit: data.unit,
      color: data.color,
      icon: data.icon,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setHabits(prev => [...prev, newHabit]);
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit =>
      habit.id === habitId
        ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
        : habit
    ));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
    setHabitEntries(prev => prev.filter(entry => entry.habitId !== habitId));
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existingEntry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === date
    );
    
    if (existingEntry) {
      // Toggle existing entry
      setHabitEntries(prev => prev.map(entry =>
        entry.id === existingEntry.id
          ? { ...entry, completed: !entry.completed, completedAt: !entry.completed ? new Date().toISOString() : undefined }
          : entry
      ));
      
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
      awardXP(XP_REWARDS.HABIT_COMPLETED, 'Habit completed');
    }
  };

  const addLongTermGoal = (data: {
    title: string;
    description?: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    subtasks: string[];
    color: string;
  }) => {
    const subtasks = data.subtasks.map((title, index) => ({
      id: generateId(),
      title,
      completed: false,
      order: index,
    }));
    
    const newGoal: LongTermGoal = {
      id: generateId(),
      title: data.title,
      description: data.description,
      category: data.category as any,
      priority: data.priority,
      deadline: data.deadline,
      status: 'not_started',
      progress: 0,
      subtasks,
      color: data.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLongTermGoals(prev => [...prev, newGoal]);
  };

  const updateLongTermGoal = (goalId: string, updates: Partial<LongTermGoal>) => {
    setLongTermGoals(prev => prev.map(goal =>
      goal.id === goalId
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    ));
  };

  const deleteLongTermGoal = (goalId: string) => {
    setLongTermGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const toggleSubtask = (goalId: string, subtaskId: string) => {
    setLongTermGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      
      const updatedSubtasks = goal.subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { 
              ...subtask, 
              completed: !subtask.completed,
              completedAt: !subtask.completed ? new Date().toISOString() : undefined
            }
          : subtask
      );
      
      const completedCount = updatedSubtasks.filter(s => s.completed).length;
      const progress = updatedSubtasks.length > 0 ? completedCount / updatedSubtasks.length : 0;
      const status = progress === 1 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
      
      // Award XP for subtask completion
      const subtask = goal.subtasks.find(s => s.id === subtaskId);
      if (subtask && !subtask.completed) {
        awardXP(XP_REWARDS.GOAL_SUBTASK_COMPLETED, 'Subtask completed');
      }
      
      // Award bonus XP for goal completion
      if (status === 'completed' && goal.status !== 'completed') {
        awardXP(XP_REWARDS.GOAL_COMPLETED, 'Long-term goal completed');
      }
      
      return {
        ...goal,
        subtasks: updatedSubtasks,
        progress,
        status,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const addJournalEntry = (date: string, data: {
    type?: 'morning' | 'evening' | 'free';
    mood: number;
    energy?: number;
    stress?: number;
    reflection?: string;
    gratitude?: string[];
    highlights?: string;
    challenges?: string;
    tomorrowFocus?: string;
    sleepHours?: number;
    sleepQuality?: number;
    morningFeeling?: string;
    mainFocus?: string;
    dailyGoals?: string[];
    morningGratitude?: string;
  }) => {
    const newEntry: JournalEntry = {
      id: generateId(),
      date,
      type: data.type || 'free',
      mood: data.mood,
      energy: data.energy || 3,
      stress: data.stress || 3,
      reflection: data.reflection,
      gratitude: data.gratitude,
      highlights: data.highlights,
      challenges: data.challenges,
      tomorrowFocus: data.tomorrowFocus,
      sleepHours: data.sleepHours,
      sleepQuality: data.sleepQuality,
      morningFeeling: data.morningFeeling,
      mainFocus: data.mainFocus,
      dailyGoals: data.dailyGoals,
      morningGratitude: data.morningGratitude,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setJournalEntries(prev => [...prev, newEntry]);
    awardXP(XP_REWARDS.JOURNAL_ENTRY, 'Journal entry created');
  };

  const updateJournalEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    ));
  };

  const deleteJournalEntry = (entryId: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Sleep tracking functions
  const addSleepData = (data: {
    date: string;
    hoursSlept: number;
    quality: number;
    bedTime?: string;
    wakeTime?: string;
    notes?: string;
  }) => {
    const newSleepData: SleepData = {
      id: generateId(),
      date: data.date,
      hoursSlept: data.hoursSlept,
      quality: data.quality,
      bedTime: data.bedTime,
      wakeTime: data.wakeTime,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSleepData(prev => {
      // Remove existing entry for the same date
      const filtered = prev.filter(sleep => sleep.date !== data.date);
      return [...filtered, newSleepData];
    });
  };

  const updateSleepData = (sleepId: string, updates: Partial<SleepData>) => {
    setSleepData(prev => prev.map(sleep =>
      sleep.id === sleepId
        ? { ...sleep, ...updates, updatedAt: new Date().toISOString() }
        : sleep
    ));
  };

  // Social media tracking functions
  const addSocialMediaUsage = (data: {
    date: string;
    totalMinutes: number;
    apps: { name: string; minutes: number; category: string }[];
    notes?: string;
  }) => {
    const newUsage: SocialMediaUsage = {
      id: generateId(),
      date: data.date,
      totalMinutes: data.totalMinutes,
      apps: data.apps,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSocialMediaData(prev => {
      // Remove existing entry for the same date
      const filtered = prev.filter(usage => usage.date !== data.date);
      return [...filtered, newUsage];
    });
  };

  const updateSocialMediaUsage = (usageId: string, updates: Partial<SocialMediaUsage>) => {
    setSocialMediaData(prev => prev.map(usage =>
      usage.id === usageId
        ? { ...usage, ...updates, updatedAt: new Date().toISOString() }
        : usage
    ));
  };

  // Productive activities functions
  const addProductiveActivity = (data: {
    name: string;
    description?: string;
    category: 'mind' | 'body' | 'work' | 'creative' | 'social' | 'other';
    color: string;
    icon: string;
    estimatedDuration?: number;
  }) => {
    const newActivity: ProductiveActivity = {
      id: generateId(),
      name: data.name,
      description: data.description,
      category: data.category,
      color: data.color,
      icon: data.icon,
      estimatedDuration: data.estimatedDuration,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setProductiveActivities(prev => [...prev, newActivity]);
  };

  const updateProductiveActivity = (activityId: string, updates: Partial<ProductiveActivity>) => {
    setProductiveActivities(prev => prev.map(activity =>
      activity.id === activityId
        ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
        : activity
    ));
  };

  const deleteProductiveActivity = (activityId: string) => {
    setProductiveActivities(prev => prev.filter(activity => activity.id !== activityId));
    setActivityEntries(prev => prev.filter(entry => entry.activityId !== activityId));
  };

  const addActivityToToday = (activityId: string) => {
    const activity = productiveActivities.find(a => a.id === activityId);
    if (!activity) return;
    
    const newGoal: Goal = {
      id: generateId(),
      title: activity.name,
      description: activity.description,
      completed: false,
      isAutomatic: false,
      hasTimer: false,
      createdAt: new Date().toISOString(),
    };
    
    setTodaysGoals(prev => [...prev, newGoal]);
  };

  // Dashboard metrics functions
  const updateDashboardMetric = (metricId: string, updates: Partial<DashboardMetric>) => {
    setDashboardMetrics(prev => prev.map(metric =>
      metric.id === metricId
        ? { ...metric, ...updates }
        : metric
    ));
  };

  const toggleMetricPin = (metricId: string) => {
    setDashboardMetrics(prev => prev.map(metric =>
      metric.id === metricId
        ? { ...metric, isPinned: !metric.isPinned }
        : metric
    ));
  };

  const getAnalytics = (): Analytics => {
    // Calculate habit analytics
    const totalHabitsCompleted = habitEntries.filter(entry => entry.completed).length;
    const habitStreakData = habits.map(habit => ({
      date: new Date().toISOString().split('T')[0],
      count: habitEntries.filter(entry => entry.habitId === habit.id && entry.completed).length,
    }));
    
    // Calculate mood analytics
    const moodEntries = journalEntries.filter(entry => entry.mood);
    const averageMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length 
      : 0;
    
    // Calculate sleep analytics
    const averageHours = sleepData.length > 0
      ? sleepData.reduce((sum, sleep) => sum + sleep.hoursSlept, 0) / sleepData.length
      : 0;
    const averageQuality = sleepData.length > 0
      ? sleepData.reduce((sum, sleep) => sum + sleep.quality, 0) / sleepData.length
      : 0;
    
    // Calculate social media analytics
    const totalSocialMinutes = socialMediaData.reduce((sum, usage) => sum + usage.totalMinutes, 0);
    const dailyAverageSocial = socialMediaData.length > 0 ? totalSocialMinutes / socialMediaData.length : 0;
    
    return {
      habits: {
        totalCompleted: totalHabitsCompleted,
        streakData: habitStreakData,
        categoryBreakdown: [],
        completionRate: habits.length > 0 ? totalHabitsCompleted / habits.length : 0,
      },
      goals: {
        totalCompleted: longTermGoals.filter(goal => goal.status === 'completed').length,
        inProgress: longTermGoals.filter(goal => goal.status === 'in_progress').length,
        averageCompletionTime: 0,
        categoryBreakdown: [],
      },
      mood: {
        averageMood,
        moodTrend: moodEntries.map(entry => ({ date: entry.date, mood: entry.mood })),
        energyTrend: moodEntries.map(entry => ({ date: entry.date, energy: entry.energy || 0 })),
        stressTrend: moodEntries.map(entry => ({ date: entry.date, stress: entry.stress || 0 })),
      },
      sleep: {
        averageHours,
        averageQuality,
        sleepTrend: sleepData.map(sleep => ({ 
          date: sleep.date, 
          hours: sleep.hoursSlept, 
          quality: sleep.quality 
        })),
        weeklyPattern: [],
      },
      socialMedia: {
        dailyAverage: dailyAverageSocial,
        weeklyTrend: socialMediaData.map(usage => ({ date: usage.date, minutes: usage.totalMinutes })),
        appBreakdown: [],
        streakDaysUnderAverage: 0,
      },
      productivity: {
        tasksCompleted: dailyPlans.reduce((sum, plan) => sum + plan.goalsCompleted, 0),
        averageDailyProgress: getAverageProgress(),
        mostProductiveDays: [],
        weeklyTrends: [],
        activitiesCompleted: [],
      },
    };
  };

  const awardXP = (amount: number, reason: string) => {
    if (!userProfile) return;
    
    const newTotalXP = userProfile.totalXP + amount;
    const { level, xpToNextLevel } = calculateLevel(newTotalXP);
    
    const wasLevelUp = level > userProfile.level;
    
    setUserProfile(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        xp: prev.xp + amount,
        totalXP: newTotalXP,
        level,
        xpToNextLevel,
        updatedAt: new Date().toISOString(),
      };
    });
    
    // Check for new achievements
    const newAchievements = checkForNewAchievements(
      userProfile,
      habits,
      habitEntries,
      longTermGoals,
      journalEntries
    );
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setUserProfile(prev => {
        if (!prev) return null;
        
        const newBadges = newAchievements.map(achievement => ({
          id: achievement.id,
          name: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          color: achievement.color,
          unlockedAt: achievement.date,
          category: 'special' as const,
        }));
        
        return {
          ...prev,
          badges: [...prev.badges, ...newBadges],
        };
      });
    }
    
    if (wasLevelUp) {
      const levelUpAchievement: Achievement = {
        id: generateId(),
        type: 'level_up',
        title: `Level ${level} Reached!`,
        description: `You've reached level ${level}`,
        xpReward: 0,
        icon: 'Star',
        color: '#FFD700',
        date: new Date().toISOString(),
      };
      
      setAchievements(prev => [...prev, levelUpAchievement]);
    }
  };

  const completeDailyChallenge = () => {
    if (!dailyChallenge || dailyChallenge.completed) return;
    
    const updatedChallenge = {
      ...dailyChallenge,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    
    setDailyChallenge(updatedChallenge);
    awardXP(dailyChallenge.xpReward, 'Daily challenge completed');
    
    // Save to storage
    AsyncStorage.setItem(`dailyChallenge_${dailyChallenge.date}`, JSON.stringify(updatedChallenge));
  };

  return (
    <AppContext.Provider
      value={{
        goalsLibrary,
        todaysGoals,
        dailyPlans,
        progressToday,
        workouts,
        quoteOfTheDay,
        dailyEntries,
        plannerSettings,
        habits,
        habitEntries,
        longTermGoals,
        journalEntries,
        userProfile,
        achievements,
        dailyChallenge,
        sleepData,
        socialMediaData,
        productiveActivities,
        activityEntries,
        dashboardMetrics,
        
        addGoal,
        updateGoal,
        deleteGoal,
        completeGoal,
        uncompleteGoal,
        getGoalById,
        getAverageProgress,
        setTimerForGoal,
        scheduleNotification,
        updateGoalSchedule,
        
        addWorkout,
        updateWorkout,
        deleteWorkout,
        getWorkoutById,
        
        getDailyEntry,
        updateDailyEntry,
        addCustomColumn,
        updateCustomColumn,
        removeCustomColumn,
        updatePlannerSettings,
        getEntriesForMonth,
        
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompletion,
        
        addLongTermGoal,
        updateLongTermGoal,
        deleteLongTermGoal,
        toggleSubtask,
        
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        
        addSleepData,
        updateSleepData,
        
        addSocialMediaUsage,
        updateSocialMediaUsage,
        
        addProductiveActivity,
        updateProductiveActivity,
        deleteProductiveActivity,
        addActivityToToday,
        
        updateDashboardMetric,
        toggleMetricPin,
        getAnalytics,
        
        awardXP,
        completeDailyChallenge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};