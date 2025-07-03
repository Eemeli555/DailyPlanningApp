import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Plus, Calendar, CircleCheck as CheckCircle2, Clock, Star, Zap, Trophy, Target, Repeat, Smartphone, CalendarPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { Goal } from '@/types';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';
import GoalItem from '@/components/GoalItem';
import ProgressBar from '@/components/ProgressBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import DailyScheduleOverview from '@/components/DailyScheduleOverview';
import ScheduleGoalModal from '@/components/ScheduleGoalModal';
import CreateChoiceModal from '@/components/CreateChoiceModal';
import HabitCard from '@/components/HabitCard';
import { getCompletionStatus } from '@/utils/helpers';
import { calculateHabitStreak } from '@/utils/gamification';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    goals, 
    tasks, 
    habits,
    habitEntries,
    updateGoal, 
    updateTask,
    getDailyEntry,
    journalEntries,
    sleepData,
    socialMediaData,
    updateGoalSchedule,
    dailyPlans,
    getDailyPlan
  } = useContext(AppContext);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  
  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');
  const dailyEntry = getDailyEntry(todayString);
  const todaysPlan = getDailyPlan(todayString);
  
  // Filter today's goals and tasks
  const todaysGoals = goals.filter(goal => {
    if (goal.schedule?.type === 'daily') return true;
    if (goal.schedule?.type === 'weekly' && goal.schedule.days?.includes(today.getDay())) return true;
    if (goal.schedule?.type === 'specific' && goal.schedule.dates?.includes(todayString)) return true;
    return false;
  });
  
  const todaysTasks = tasks.filter(task => 
    task.dueDate === todayString || 
    (task.schedule && task.schedule.dates?.includes(todayString))
  );
  
  // Get today's habits
  const todaysHabits = habits.filter(habit => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'weekly' && habit.weeklyDays?.includes(today.getDay())) return true;
    return false;
  });
  
  // Calculate completion stats
  const completedGoals = todaysGoals.filter(goal => getCompletionStatus(goal, todayString)).length;
  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const completedHabits = todaysHabits.filter(habit => {
    const entry = habitEntries.find(e => e.habitId === habit.id && e.date === todayString);
    return entry?.completed || false;
  }).length;
  
  const totalItems = todaysGoals.length + todaysTasks.length + todaysHabits.length;
  const completedItems = completedGoals + completedTasks + completedHabits;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  // Get current activity from schedule
  const currentHour = today.getHours();
  const currentActivity = todaysPlan?.schedule.find(item => 
    item.startTime <= currentHour && item.endTime > currentHour
  );
  
  const handleScheduleGoal = (goal: Goal, timeSlot: { hour: number; minutes: number }) => {
    setSelectedGoal(goal);
    setSelectedTimeSlot(timeSlot);
    setShowScheduleModal(true);
  };
  
  const handleScheduleConfirm = (startTime: string, endTime: string) => {
    if (selectedGoal && selectedTimeSlot) {
      updateGoalSchedule(selectedGoal.id, {
        type: 'specific',
        dates: [todayString],
        startTime,
        endTime
      });
      setShowScheduleModal(false);
      setSelectedGoal(null);
      setSelectedTimeSlot(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : 'Evening'}!</Text>
            <Text style={styles.date}>{format(today, 'EEEE, MMMM d')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => router.push('/(tabs)/calendar')}
          >
            <Calendar size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Daily Progress Card */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedItems} of {totalItems} completed
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressPercentage}>{Math.round(completionPercentage)}%</Text>
            </View>
          </View>
          <ProgressBar 
            progress={completionPercentage} 
            height={8}
            color={COLORS.primary}
            backgroundColor={COLORS.lightGray}
          />
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Target size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{completedGoals}/{todaysGoals.length} Goals</Text>
            </View>
            <View style={styles.statItem}>
              <CheckCircle2 size={16} color={COLORS.success} />
              <Text style={styles.statText}>{completedTasks}/{todaysTasks.length} Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Repeat size={16} color={COLORS.accent} />
              <Text style={styles.statText}>{completedHabits}/{todaysHabits.length} Habits</Text>
            </View>
          </View>
        </Animated.View>

        {/* Current Activity */}
        {currentActivity && (
          <Animated.View entering={FadeInUp.delay(300)} style={styles.currentActivityCard}>
            <View style={styles.currentActivityHeader}>
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.currentActivityTitle}>Current Activity</Text>
            </View>
            <Text style={styles.currentActivityText}>{currentActivity.title}</Text>
            <Text style={styles.currentActivityTime}>
              {currentActivity.startTime}:00 - {currentActivity.endTime}:00
            </Text>
          </Animated.View>
        )}

        {/* Daily Schedule Overview */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <DailyScheduleOverview 
            date={todayString}
            onScheduleGoal={handleScheduleGoal}
          />
        </Animated.View>

        {/* Today's Habits */}
        {todaysHabits.length > 0 && (
          <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Repeat size={20} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>Today's Habits</Text>
            </View>
            <View style={styles.habitsGrid}>
              {todaysHabits.map((habit, index) => (
                <Animated.View 
                  key={habit.id} 
                  entering={FadeInDown.delay(600 + index * 100)}
                  style={styles.habitCardWrapper}
                >
                  <HabitCard 
                    habit={habit}
                    streak={calculateHabitStreak(habit.id, habitEntries)}
                    isCompleted={habitEntries.some(e => 
                      e.habitId === habit.id && 
                      e.date === todayString && 
                      e.completed
                    )}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Today's Goals */}
        {todaysGoals.length > 0 && (
          <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Today's Goals</Text>
            </View>
            {todaysGoals.map((goal, index) => (
              <Animated.View 
                key={goal.id} 
                entering={FadeInDown.delay(700 + index * 100)}
              >
                <GoalItem 
                  goal={goal} 
                  onUpdate={updateGoal}
                  showSchedule={true}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Wellness Insights */}
        {(dailyEntry?.mood || sleepData.length > 0 || socialMediaData.length > 0) && (
          <Animated.View entering={FadeInUp.delay(700)} style={styles.wellnessCard}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>Wellness Insights</Text>
            </View>
            
            <View style={styles.wellnessGrid}>
              {dailyEntry?.mood && (
                <View style={styles.wellnessItem}>
                  <Text style={styles.wellnessLabel}>Mood</Text>
                  <Text style={styles.wellnessValue}>{dailyEntry.mood}/10</Text>
                </View>
              )}
              
              {sleepData.length > 0 && (
                <View style={styles.wellnessItem}>
                  <Text style={styles.wellnessLabel}>Sleep</Text>
                  <Text style={styles.wellnessValue}>
                    {sleepData[sleepData.length - 1]?.hours || 0}h
                  </Text>
                </View>
              )}
              
              {socialMediaData.length > 0 && (
                <View style={styles.wellnessItem}>
                  <Smartphone size={16} color={COLORS.error} />
                  <Text style={styles.wellnessLabel}>Screen Time</Text>
                  <Text style={styles.wellnessValue}>
                    {Math.round((socialMediaData[socialMediaData.length - 1]?.totalMinutes || 0) / 60)}h
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setShowCreateModal(true)} />

      {/* Modals */}
      <CreateChoiceModal 
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <ScheduleGoalModal
        visible={showScheduleModal}
        goal={selectedGoal}
        timeSlot={selectedTimeSlot}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  currentActivityCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  currentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  currentActivityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  currentActivityTime: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  habitCardWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  wellnessCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wellnessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wellnessItem: {
    alignItems: 'center',
    flex: 1,
  },
  wellnessLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  wellnessValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bottomPadding: {
    height: 100,
  },
});