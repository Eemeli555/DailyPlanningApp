import { COLORS } from './theme';

export const XP_REWARDS = {
  HABIT_COMPLETED: 10,
  GOAL_SUBTASK_COMPLETED: 15,
  GOAL_COMPLETED: 100,
  JOURNAL_ENTRY: 20,
  DAILY_CHALLENGE: 25,
  STREAK_MILESTONE: 50,
  PERFECT_DAY: 75, // All habits + journal entry
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 2900, 3500, // Levels 0-10
  4200, 5000, 5900, 6900, 8000, 9200, 10500, 11900, 13400, 15000, // Levels 11-20
];

export const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health', icon: 'Heart', color: COLORS.error[500] },
  { id: 'productivity', name: 'Productivity', icon: 'Zap', color: COLORS.warning[500] },
  { id: 'mindfulness', name: 'Mindfulness', icon: 'Brain', color: COLORS.primary[500] },
  { id: 'learning', name: 'Learning', icon: 'BookOpen', color: COLORS.accent[500] },
  { id: 'social', name: 'Social', icon: 'Users', color: COLORS.secondary[500] },
  { id: 'other', name: 'Other', icon: 'Star', color: COLORS.neutral[500] },
];

export const GOAL_CATEGORIES = [
  { id: 'health', name: 'Health', icon: 'Heart', color: COLORS.error[500] },
  { id: 'career', name: 'Career', icon: 'Briefcase', color: COLORS.primary[500] },
  { id: 'personal', name: 'Personal', icon: 'User', color: COLORS.accent[500] },
  { id: 'financial', name: 'Financial', icon: 'DollarSign', color: COLORS.success[500] },
  { id: 'relationships', name: 'Relationships', icon: 'Users', color: COLORS.secondary[500] },
  { id: 'learning', name: 'Learning', icon: 'BookOpen', color: COLORS.warning[500] },
  { id: 'other', name: 'Other', icon: 'Star', color: COLORS.neutral[500] },
];

export const MOOD_LABELS = [
  { value: 1, label: 'Terrible', emoji: '😢', color: COLORS.error[500] },
  { value: 2, label: 'Poor', emoji: '😕', color: COLORS.warning[600] },
  { value: 3, label: 'Okay', emoji: '😐', color: COLORS.warning[500] },
  { value: 4, label: 'Good', emoji: '😊', color: COLORS.success[400] },
  { value: 5, label: 'Excellent', emoji: '😄', color: COLORS.success[500] },
];

export const DAILY_CHALLENGES = [
  {
    type: 'habit',
    title: 'Habit Hero',
    description: 'Complete 3 habits today',
    xpReward: 30,
  },
  {
    type: 'reflection',
    title: 'Mindful Moment',
    description: 'Write a journal entry about gratitude',
    xpReward: 25,
  },
  {
    type: 'wellness',
    title: 'Wellness Warrior',
    description: 'Rate your mood and energy levels',
    xpReward: 20,
  },
  {
    type: 'goal',
    title: 'Progress Pioneer',
    description: 'Complete a subtask for any goal',
    xpReward: 35,
  },
];

export const ACHIEVEMENT_BADGES = [
  {
    id: 'first_habit',
    name: 'First Steps',
    description: 'Complete your first habit',
    icon: 'Award',
    color: COLORS.primary[500],
    category: 'habits',
  },
  {
    id: 'habit_streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day habit streak',
    icon: 'Flame',
    color: COLORS.warning[500],
    category: 'streaks',
  },
  {
    id: 'habit_streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day habit streak',
    icon: 'Crown',
    color: COLORS.warning[600],
    category: 'streaks',
  },
  {
    id: 'goal_achiever',
    name: 'Goal Getter',
    description: 'Complete your first long-term goal',
    icon: 'Target',
    color: COLORS.success[500],
    category: 'goals',
  },
  {
    id: 'journal_streak_7',
    name: 'Reflection Rookie',
    description: 'Journal for 7 consecutive days',
    icon: 'BookOpen',
    color: COLORS.accent[500],
    category: 'journaling',
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all habits and journal every day for a week',
    icon: 'Star',
    color: COLORS.secondary[500],
    category: 'special',
  },
];