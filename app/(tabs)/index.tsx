import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Plus, Calendar, CircleCheck as CheckCircle2, Clock, Star, Zap, Trophy, Target, Repeat } from 'lucide-react-native';
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

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { 
    todaysGoals, 
    progressToday, 
    completeGoal, 
    uncompleteGoal,
    setTimerForGoal,
    updateGoalSchedule,
    quoteOfTheDay,
    userProfile,
    habits,
    habitEntries,
    dailyChallenge,
    completeDailyChallenge,
    achievements,
    toggleHabitCompletion
  } = useContext(AppContext);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGoalForScheduling, setSelectedGoalForScheduling] = useState<Goal | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayFormatted = format(today, 'EEEE, MMMM d');
  const { label, color } = getCompletionStatus(progressToday);

  // Separate habits from regular goals
  const habitGoals = todaysGoals.filter(goal => goal.id.startsWith('habit-'));
  const regularGoals = todaysGoals.filter(goal => !goal.id.startsWith('habit-'));

  // Get today's habit progress
  const todayHabitEntries = habitEntries.filter(entry => entry.date === todayStr);
  const activeHabits = habits.filter(habit => habit.isActive);
  const completedHabits = todayHabitEntries.filter(entry => entry.completed).length;
  const habitProgress = activeHabits.length > 0 ? completedHabits / activeHabits.length : 0;

  // Check for new achievements
  const recentAchievements = achievements.slice(-3);

  const handleScheduleGoal = (goal: Goal) => {
    setSelectedGoalForScheduling(goal);
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (goalId: string, schedule: { start: string; end: string }) => {
    updateGoalSchedule(goalId, schedule);
    setShowScheduleModal(false);
    setSelectedGoalForScheduling(null);
  };

  const handleEditSchedule = (goal: Goal) => {
    setSelectedGoalForScheduling(goal);
    setShowScheduleModal(true);
  };

  const handleToggleComplete = (goalId: string) => {
    const goal = todaysGoals.find(g => g.id === goalId);
    if (goal?.completed) {
      uncompleteGoal(goalId);
    } else {
      completeGoal(goalId);
    }
  };

  const handleToggleHabit = (habitId: string) => {
    toggleHabitCompletion(habitId, todayStr);
  };

  const handleSetTimer = (goalId: string) => {
    setTimerForGoal(goalId);
  };

  const handleEditGoal = (goal: Goal) => {
    router.push({
      pathname: '/modals/edit-goal',
      params: { goalId: goal.id }
    });
  };

  // Get current time for "happening now" indicator
  const getCurrentActivity = () => {
    const now = new Date();
    return regularGoals.find(goal => {
      if (!goal.scheduledTime) return false;
      const start = new Date(goal.scheduledTime.start);
      const end = new Date(goal.scheduledTime.end);
      return now >= start && now <= end;
    });
  };

  const currentActivity = getCurrentActivity();

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! ☀️';
    if (hour < 17) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.title}>Today's Focus</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile?.level || 1}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Goals</Text>
            <Text style={styles.progressNumber}>
              {Math.round(progressToday * 100)}%
            </Text>
            <ProgressBar progress={progressToday} height={4} />
          </View>
          
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Habits</Text>
            <Text style={styles.progressNumber}>
              {Math.round(habitProgress * 100)}%
            </Text>
            <ProgressBar progress={habitProgress} height={4} />
          </View>
          
          <TouchableOpacity 
            style={styles.xpCard}
            onPress={() => router.push('/profile')}
          >
            <Star size={16} color={COLORS.warning[600]} />
            <Text style={styles.xpText}>{userProfile?.xp || 0} XP</Text>
          </TouchableOpacity>
        </View>

        {/* Current Activity Indicator */}
        {currentActivity && (
          <Animated.View 
            entering={FadeInDown.springify()}
            style={styles.currentActivityCard}
          >
            <View style={styles.currentActivityHeader}>
              <Clock size={14} color={COLORS.accent[600]} />
              <Text style={styles.currentActivityLabel}>Happening Now</Text>
            </View>
            <Text style={styles.currentActivityTitle}>{currentActivity.title}</Text>
          </Animated.View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge */}
        {dailyChallenge && !dailyChallenge.completed && (
          <Animated.View 
            entering={FadeInUp.delay(100).springify()}
            style={styles.challengeCard}
          >
            <View style={styles.challengeHeader}>
              <View style={styles.challengeIcon}>
                <Zap size={20} color={COLORS.warning[600]} />
              </View>
              <View style={styles.challengeContent}>
                <Text style={styles.challengeTitle}>{dailyChallenge.title}</Text>
                <Text style={styles.challengeDescription}>{dailyChallenge.description}</Text>
              </View>
              <View style={styles.challengeReward}>
                <Text style={styles.challengeXP}>+{dailyChallenge.xpReward} XP</Text>
              </View>
            </View>
            <Button
              title="Complete Challenge"
              onPress={completeDailyChallenge}
              style={styles.challengeButton}
            />
          </Animated.View>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.achievementsSection}
          >
            <View style={styles.sectionHeader}>
              <Trophy size={20} color={COLORS.warning[600]} />
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsScroll}
            >
              {recentAchievements.map((achievement, index) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={styles.achievementCard}
                  onPress={() => setShowAchievementModal(true)}
                >
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <Text style={styles.achievementTitle} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementXP}>+{achievement.xpReward} XP</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Today's Habits */}
        {activeHabits.length > 0 && (
          <View style={styles.habitsSection}>
            <View style={styles.sectionHeader}>
              <Repeat size={20} color={COLORS.accent[600]} />
              <Text style={styles.sectionTitle}>Today's Habits</Text>
              <Text style={styles.habitProgress}>
                {completedHabits}/{activeHabits.length}
              </Text>
            </View>
            
            <View style={styles.habitsContainer}>
              {activeHabits.map((habit, index) => {
                const todayEntry = todayHabitEntries.find(entry => entry.habitId === habit.id);
                const streak = calculateHabitStreak(habitEntries, habit.id);
                
                return (
                  <Animated.View
                    key={habit.id}
                    entering={FadeInUp.delay(index * 50).springify()}
                  >
                    <HabitCard
                      habit={habit}
                      entry={todayEntry}
                      onToggle={() => handleToggleHabit(habit.id)}
                      onEdit={() => router.push({
                        pathname: '/modals/edit-habit',
                        params: { habitId: habit.id }
                      })}
                      streak={streak}
                    />
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}
        
        {/* Compact Daily Schedule Overview */}
        <DailyScheduleOverview 
          goals={regularGoals} 
          date={today}
          onToggleComplete={handleToggleComplete}
          onSetTimer={handleSetTimer}
          onEditSchedule={handleEditSchedule}
          onEditGoal={handleEditGoal}
        />
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/modals/add-goal')}
            >
              <Target size={20} color={COLORS.primary[600]} />
              <Text style={styles.quickActionText}>Add Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/modals/add-habit')}
            >
              <Plus size={20} color={COLORS.accent[600]} />
              <Text style={styles.quickActionText}>Add Habit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: todayStr, mode: 'create' }
              })}
            >
              <CheckCircle2 size={20} color={COLORS.success[600]} />
              <Text style={styles.quickActionText}>Journal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unscheduled Goals - Compact List */}
        {regularGoals.filter(goal => !goal.scheduledTime).length > 0 && (
          <View style={styles.unscheduledSection}>
            <Text style={styles.sectionTitle}>
              Unscheduled Goals ({regularGoals.filter(goal => !goal.scheduledTime).length})
            </Text>
            
            <View style={styles.unscheduledGoalsContainer}>
              {regularGoals.filter(goal => !goal.scheduledTime).map((goal, index) => (
                <Animated.View 
                  key={goal.id}
                  entering={FadeInUp.delay(index * 50).springify()}
                  style={styles.unscheduledGoal}
                >
                  <GoalItem 
                    goal={goal}
                    onToggleComplete={(goalId) => {
                      if (goal.completed) {
                        uncompleteGoal(goalId);
                      } else {
                        completeGoal(goalId);
                      }
                    }}
                    onSetTimer={() => setTimerForGoal(goal.id)}
                    onSchedule={() => handleScheduleGoal(goal)}
                    showTimer
                    showSchedule
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* Quote of the Day - Compact */}
        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>"{quoteOfTheDay.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quoteOfTheDay.author}</Text>
        </View>
      </ScrollView>
      
      <FloatingActionButton 
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => setShowCreateModal(true)}
      />

      <ScheduleGoalModal
        visible={showScheduleModal}
        goal={selectedGoalForScheduling}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedGoalForScheduling(null);
        }}
        onSchedule={handleScheduleConfirm}
        selectedDate={today}
      />

      <CreateChoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Achievement Modal */}
      <Modal
        visible={showAchievementModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAchievementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Achievement Unlocked!</Text>
            {recentAchievements.length > 0 && (
              <>
                <Text style={styles.modalAchievementTitle}>
                  {recentAchievements[recentAchievements.length - 1].title}
                </Text>
                <Text style={styles.modalAchievementDescription}>
                  {recentAchievements[recentAchievements.length - 1].description}
                </Text>
              </>
            )}
            <Button
              title="Awesome!"
              onPress={() => setShowAchievementModal(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  progressSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  progressCard: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  progressNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginBottom: 8,
  },
  xpCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    flexDirection: 'row',
    gap: 4,
  },
  xpText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.warning[700],
  },
  currentActivityCard: {
    backgroundColor: COLORS.accent[50],
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent[500],
  },
  currentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentActivityLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.accent[600],
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentActivityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.accent[800],
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  challengeCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.warning[800],
  },
  challengeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.warning[700],
    marginTop: 2,
  },
  challengeReward: {
    backgroundColor: COLORS.warning[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeXP: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: COLORS.warning[800],
  },
  challengeButton: {
    backgroundColor: COLORS.warning[600],
  },
  achievementsSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginLeft: 8,
    flex: 1,
  },
  habitProgress: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.accent[600],
  },
  achievementsScroll: {
    paddingRight: 20,
    gap: 12,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 100,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementXP: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning[600],
  },
  habitsSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  habitsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginTop: 6,
    textAlign: 'center',
  },
  unscheduledSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  unscheduledGoalsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unscheduledGoal: {
    paddingHorizontal: 12,
  },
  quoteSection: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary[500],
  },
  quoteText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteAuthor: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  modalAchievementTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.warning[700],
    marginBottom: 8,
    textAlign: 'center',
  },
  modalAchievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.warning[600],
    minWidth: 120,
  },
});