import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Plus, Calendar, CheckCircle2 } from 'lucide-react-native';
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
    quoteOfTheDay
  } = useContext(AppContext);
  
  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d');
  const { label, color } = getCompletionStatus(progressToday);

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
            <Calendar size={24} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{quoteOfTheDay.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quoteOfTheDay.author}</Text>
        </View>
        
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Daily Progress</Text>
            <Text style={[styles.progressLabel, { color }]}>
              {label}
            </Text>
          </View>
          <ProgressBar progress={progressToday} />
          <Text style={styles.progressPercentage}>
            {Math.round(progressToday * 100)}% Complete
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Schedule Overview */}
        <DailyScheduleOverview goals={todaysGoals} date={today} />
        
        {/* Unscheduled Goals Section */}
        {todaysGoals.filter(goal => !goal.scheduledTime).length > 0 && (
          <View style={styles.unscheduledSection}>
            <Text style={styles.sectionTitle}>Unscheduled Goals</Text>
            <Text style={styles.sectionSubtitle}>
              Tap to complete or schedule these goals
            </Text>
            
            <View style={styles.unscheduledGoalsContainer}>
              {todaysGoals.filter(goal => !goal.scheduledTime).map((goal, index) => (
                <Animated.View 
                  key={goal.id}
                  entering={FadeInUp.delay(index * 100).springify()}
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
                    showTimer
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        )}
        
        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CheckCircle2 size={24} color={COLORS.success[600]} />
              </View>
              <Text style={styles.statValue}>
                {todaysGoals.filter(goal => goal.completed).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={24} color={COLORS.primary[600]} />
              </View>
              <Text style={styles.statValue}>
                {todaysGoals.filter(goal => goal.scheduledTime).length}
              </Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Plus size={24} color={COLORS.neutral[600]} />
              </View>
              <Text style={styles.statValue}>
                {todaysGoals.length}
              </Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <FloatingActionButton 
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => router.push('/modals/add-goal')}
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
    paddingBottom: 8,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  },
  dateText: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginTop: 4,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 8,
  },
  progressCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 8,
    textAlign: 'right',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  unscheduledSection: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginBottom: 16,
  },
  unscheduledGoalsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 8,
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
    paddingHorizontal: 16,
  },
  statsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },
});