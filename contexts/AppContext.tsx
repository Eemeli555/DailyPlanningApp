import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useRouter } from 'expo-router';
import { DailyPlan, Goal, NotificationConfig, Workout, Exercise, DailyEntry, CustomColumn, DailyPlannerSettings } from '@/types';
import { generateId } from '@/utils/helpers';

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
  
  addGoal: (data: { 
    title: string;
    description?: string;
    isAutomatic: boolean;
    addToToday: boolean;
  }) => void;
  
  updateGoal: (goalId: string, data: {
    title: string;
    description?: string;
    isAutomatic: boolean;
  }) => void;
  
  deleteGoal: (goalId: string) => void;
  toggleAutomaticGoal: (goalId: string) => void;
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
  
  addGoal: () => {},
  updateGoal: () => {},
  deleteGoal: () => {},
  toggleAutomaticGoal: () => {},
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
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load goals library
        const storedGoalsLibrary = await AsyncStorage.getItem('goalsLibrary');
        if (storedGoalsLibrary) {
          setGoalsLibrary(JSON.parse(storedGoalsLibrary));
        }
        
        // Load daily plans
        const storedDailyPlans = await AsyncStorage.getItem('dailyPlans');
        if (storedDailyPlans) {
          setDailyPlans(JSON.parse(storedDailyPlans));
        }
        
        // Load workouts
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          setWorkouts(JSON.parse(storedWorkouts));
        }
        
        // Load daily entries
        const storedDailyEntries = await AsyncStorage.getItem('dailyEntries');
        if (storedDailyEntries) {
          setDailyEntries(JSON.parse(storedDailyEntries));
        }
        
        // Load planner settings
        const storedPlannerSettings = await AsyncStorage.getItem('plannerSettings');
        if (storedPlannerSettings) {
          setPlannerSettings(JSON.parse(storedPlannerSettings));
        }
        
        // Set quote of the day
        const today = new Date().getDate();
        const quoteIndex = today % QUOTES.length;
        setQuoteOfTheDay(QUOTES[quoteIndex]);
        
        // Initialize today's plan if it doesn't exist
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const todayPlan = JSON.parse(storedDailyPlans || '[]').find(
          (plan: DailyPlan) => plan.date === todayStr
        );
        
        if (todayPlan) {
          setTodaysGoals(todayPlan.goals);
        } else {
          // If no plan exists for today, create one with automatic goals
          const storedLibrary = JSON.parse(storedGoalsLibrary || '[]');
          const automaticGoals = storedLibrary.filter((goal: Goal) => goal.isAutomatic);
          setTodaysGoals(automaticGoals);
          
          // Create today's plan with automatic goals
          if (automaticGoals.length > 0) {
            const newPlan: DailyPlan = {
              date: todayStr,
              goals: automaticGoals,
              goalsCompleted: 0,
              progress: 0,
              quote: quoteOfTheDay,
            };
            
            const updatedPlans = [...JSON.parse(storedDailyPlans || '[]'), newPlan];
            setDailyPlans(updatedPlans);
            await AsyncStorage.setItem('dailyPlans', JSON.stringify(updatedPlans));
          }
        }
        
        // Create today's daily entry if it doesn't exist
        const todayEntry = JSON.parse(storedDailyEntries || '[]').find(
          (entry: DailyEntry) => entry.date === todayStr
        );
        
        if (!todayEntry) {
          const newEntry = createDailyEntry(todayStr);
          const updatedEntries = [...JSON.parse(storedDailyEntries || '[]'), newEntry];
          setDailyEntries(updatedEntries);
          await AsyncStorage.setItem('dailyEntries', JSON.stringify(updatedEntries));
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

  // Create a new daily entry with default values
  const createDailyEntry = (date: string): DailyEntry => {
    const todayGoals = todaysGoals.map(goal => goal.title);
    const completedGoals = todaysGoals.filter(goal => goal.completed).length;
    const rating = todaysGoals.length > 0 ? Math.round((completedGoals / todaysGoals.length) * 100) : 0;
    
    const customFields: { [key: string]: any } = {};
    plannerSettings.customColumns.forEach(column => {
      customFields[column.id] = column.defaultValue || '';
    });
    
    return {
      id: generateId(),
      date,
      goals: todayGoals,
      sleep: {
        hours: 0,
        quality: 'fair',
      },
      meals: {},
      workouts: {
        completed: [],
        duration: 0,
      },
      thoughts: '',
      rating,
      customFields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Calculate progress for today
  const progressToday = todaysGoals.length > 0
    ? todaysGoals.filter(goal => goal.completed).length / todaysGoals.length
    : 0;
  
  // Update progress whenever todaysGoals changes
  useEffect(() => {
    if (!loaded) return;
    
    const updateTodaysPlan = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const completedGoals = todaysGoals.filter(goal => goal.completed).length;
      const progress = todaysGoals.length > 0 ? completedGoals / todaysGoals.length : 0;
      
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
      
      // Update today's daily entry with current goals and rating
      const entryIndex = dailyEntries.findIndex(entry => entry.date === today);
      if (entryIndex >= 0) {
        const updatedEntries = [...dailyEntries];
        updatedEntries[entryIndex] = {
          ...updatedEntries[entryIndex],
          goals: todaysGoals.map(goal => goal.title),
          rating: Math.round(progress * 100),
          updatedAt: new Date().toISOString(),
        };
        setDailyEntries(updatedEntries);
        await AsyncStorage.setItem('dailyEntries', JSON.stringify(updatedEntries));
      }
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
    };
    
    saveData();
  }, [goalsLibrary, dailyEntries, plannerSettings, loaded]);
  
  // Add a new goal
  const addGoal = (data: { 
    title: string; 
    description?: string; 
    isAutomatic: boolean;
    addToToday: boolean;
  }) => {
    const newGoal: Goal = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      completed: false,
      isAutomatic: data.isAutomatic,
      hasTimer: false,
      createdAt: new Date().toISOString(),
    };
    
    // Add to goals library
    setGoalsLibrary(prev => [...prev, newGoal]);
    
    // Add to today's goals if requested
    if (data.addToToday) {
      setTodaysGoals(prev => [...prev, { ...newGoal }]);
    }
  };
  
  // Update an existing goal
  const updateGoal = (goalId: string, data: {
    title: string;
    description?: string;
    isAutomatic: boolean;
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
        ? { ...goal, title: data.title, description: data.description || '', isAutomatic: data.isAutomatic } 
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
  
  // Toggle automatic status for a goal
  const toggleAutomaticGoal = (goalId: string) => {
    setGoalsLibrary(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, isAutomatic: !goal.isAutomatic } 
        : goal
    ));
  };
  
  // Mark a goal as complete
  const completeGoal = (goalId: string) => {
    setTodaysGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: true } 
        : goal
    ));
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
  
  // Calculate average progress
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
    
    const total = filteredPlans.reduce((sum, plan) => sum + plan.progress, 0);
    return total / filteredPlans.length;
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
          ...createDailyEntry(date),
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
        
        addGoal,
        updateGoal,
        deleteGoal,
        toggleAutomaticGoal,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};