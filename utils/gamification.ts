import { LEVEL_THRESHOLDS, XP_REWARDS, ACHIEVEMENT_BADGES } from '@/constants/gamification';
import { UserProfile, Badge, Achievement, Habit, HabitEntry, LongTermGoal, JournalEntry } from '@/types';

export const calculateLevel = (totalXP: number): { level: number; xpToNextLevel: number } => {
  let level = 0;
  
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i;
    } else {
      break;
    }
  }
  
  const nextLevelThreshold = LEVEL_THRESHOLDS[level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpToNextLevel = nextLevelThreshold - totalXP;
  
  return { level, xpToNextLevel };
};

export const calculateHabitStreak = (habitEntries: HabitEntry[], habitId: string): number => {
  const entries = habitEntries
    .filter(entry => entry.habitId === habitId && entry.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (entries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const checkForNewAchievements = (
  userProfile: UserProfile,
  habits: Habit[],
  habitEntries: HabitEntry[],
  goals: LongTermGoal[],
  journalEntries: JournalEntry[]
): Achievement[] => {
  const newAchievements: Achievement[] = [];
  const existingBadgeIds = userProfile.badges.map(badge => badge.id);
  
  // Check habit-related achievements
  const completedHabits = habitEntries.filter(entry => entry.completed);
  
  if (completedHabits.length >= 1 && !existingBadgeIds.includes('first_habit')) {
    newAchievements.push(createAchievement('first_habit'));
  }
  
  // Check streak achievements
  const maxStreak = Math.max(...habits.map(habit => 
    calculateHabitStreak(habitEntries, habit.id)
  ));
  
  if (maxStreak >= 7 && !existingBadgeIds.includes('habit_streak_7')) {
    newAchievements.push(createAchievement('habit_streak_7'));
  }
  
  if (maxStreak >= 30 && !existingBadgeIds.includes('habit_streak_30')) {
    newAchievements.push(createAchievement('habit_streak_30'));
  }
  
  // Check goal achievements
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  
  if (completedGoals.length >= 1 && !existingBadgeIds.includes('goal_achiever')) {
    newAchievements.push(createAchievement('goal_achiever'));
  }
  
  // Check journal achievements
  const journalStreak = calculateJournalStreak(journalEntries);
  
  if (journalStreak >= 7 && !existingBadgeIds.includes('journal_streak_7')) {
    newAchievements.push(createAchievement('journal_streak_7'));
  }
  
  return newAchievements;
};

const createAchievement = (badgeId: string): Achievement => {
  const badge = ACHIEVEMENT_BADGES.find(b => b.id === badgeId);
  if (!badge) throw new Error(`Badge ${badgeId} not found`);
  
  return {
    id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'badge_earned',
    title: badge.name,
    description: badge.description,
    xpReward: 50,
    icon: badge.icon,
    color: badge.color,
    date: new Date().toISOString(),
  };
};

const calculateJournalStreak = (journalEntries: JournalEntry[]): number => {
  const entries = journalEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (entries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const generateDailyChallenge = (
  habits: Habit[],
  goals: LongTermGoal[],
  completedChallenges: string[]
): any => {
  const challenges = [
    {
      id: 'habit_hero',
      type: 'habit',
      title: 'Habit Hero',
      description: 'Complete 3 habits today',
      xpReward: 30,
    },
    {
      id: 'mindful_moment',
      type: 'reflection',
      title: 'Mindful Moment',
      description: 'Write a journal entry about gratitude',
      xpReward: 25,
    },
    {
      id: 'wellness_warrior',
      type: 'wellness',
      title: 'Wellness Warrior',
      description: 'Rate your mood and energy levels',
      xpReward: 20,
    },
    {
      id: 'progress_pioneer',
      type: 'goal',
      title: 'Progress Pioneer',
      description: 'Complete a subtask for any goal',
      xpReward: 35,
    },
  ];
  
  const availableChallenges = challenges.filter(c => !completedChallenges.includes(c.id));
  
  if (availableChallenges.length === 0) {
    return challenges[Math.floor(Math.random() * challenges.length)];
  }
  
  return availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
};