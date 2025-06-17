import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Plus, Calendar, CircleCheck as CheckCircle2, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { Goal } from '@/types';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';
import GoalItem from '@/components/GoalItem';
import ProgressBar from '@/components/ProgressBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import DailyScheduleOverview from '@/components/DailyScheduleOverview';
import ScheduleGoalModal from '@/components/ScheduleGoalModal';
import { getCompletionStatus } from '@/utils/helpers';

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
    quoteOfTheDay
  } = useContext(AppContext);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGoalForScheduling, setSelectedGoalForScheduling] = useState<Goal | null>(null);
  
  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d');
  const { label, color } = getCompletionStatus(progressToday);

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

  // Get current time for "happening now" indicator
  const getCurrentActivity = () => {
    const now = new Date();
    return todaysGoals.find(goal => {
      if (!goal.scheduledTime) return false;
      const start = new Date(goal.scheduledTime.start);
      const end = new Date(goal.scheduledTime.end);
      return now >= start && now <= end;
    });
  };

  const currentActivity = getCurrentActivity();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.dateText}>{todayFormatted}</Text>
            <Text style={styles.title}>Today's Plan</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => router.push('/calendar')}
          >
            <Calendar size={20} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
        
        {/* Compact Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={[styles.progressLabel, { color }]}>
              {Math.round(progressToday * 100)}%
            </Text>
          </View>
          <ProgressBar progress={progressToday} height={6} />
        </View>

        {/* Current Activity Indicator */}
        {currentActivity && (
          <View style={styles.currentActivityCard}>
            <View style={styles.currentActivityHeader}>
              <Clock size={14} color={COLORS.accent[600]} />
              <Text style={styles.currentActivityLabel}>Happening Now</Text>
            </View>
            <Text style={styles.currentActivityTitle}>{currentActivity.title}</Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Daily Schedule Overview */}
        <DailyScheduleOverview goals={todaysGoals} date={today} />
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/modals/add-goal')}
            >
              <Plus size={20} color={COLORS.primary[600]} />
              <Text style={styles.quickActionText}>Add Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/calendar')}
            >
              <Calendar size={20} color={COLORS.accent[600]} />
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/stats')}
            >
              <CheckCircle2 size={20} color={COLORS.success[600]} />
              <Text style={styles.quickActionText}>Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unscheduled Goals - Compact List */}
        {todaysGoals.filter(goal => !goal.scheduledTime).length > 0 && (
          <View style={styles.unscheduledSection}>
            <Text style={styles.sectionTitle}>
              Unscheduled Goals ({todaysGoals.filter(goal => !goal.scheduledTime).length})
            </Text>
            
            <View style={styles.unscheduledGoalsContainer}>
              {todaysGoals.filter(goal => !goal.scheduledTime).map((goal, index) => (
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
        onPress={() => router.push('/modals/add-goal')}
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
    marginBottom: 12,
  },
  dateText: {
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
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
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
  quickActionsSection: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
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
});