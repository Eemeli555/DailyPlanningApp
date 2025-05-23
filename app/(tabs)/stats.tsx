import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import ProgressCircle from '@/components/ProgressCircle';
import BarChart from '@/components/BarChart';
import { getCompletionStatus } from '@/utils/helpers';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { dailyPlans, getAverageProgress } = useContext(AppContext);
  
  // Calculate overall average
  const overallAverage = getAverageProgress();
  
  // Calculate weekly average
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekAverage = getAverageProgress(weekStart, weekEnd);
  
  // Generate data for weekly chart
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weeklyData = weekDays.map(day => {
    const dayPlan = dailyPlans.find(plan => 
      format(new Date(plan.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
    return {
      day: format(day, 'EEE'),
      progress: dayPlan ? dayPlan.progress : 0,
    };
  });
  
  // Generate data for last 30 days
  const thirtyDaysAgo = subDays(today, 29);
  const last30Days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
  
  // Group by week for the last 4 weeks
  const last4Weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekStartDate = subDays(today, 7 * (i + 1) - 1);
    const weekEndDate = subDays(today, 7 * i);
    
    const weekPlans = dailyPlans.filter(plan => {
      const planDate = new Date(plan.date);
      return isWithinInterval(planDate, { start: weekStartDate, end: weekEndDate });
    });
    
    const weekProgress = weekPlans.length > 0
      ? weekPlans.reduce((sum, plan) => sum + plan.progress, 0) / weekPlans.length
      : 0;
    
    last4Weeks.unshift({
      week: `Week ${4-i}`,
      progress: weekProgress,
    });
  }
  
  const { label: overallLabel, color: overallColor } = getCompletionStatus(overallAverage);
  const { label: weeklyLabel, color: weeklyColor } = getCompletionStatus(weekAverage);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Track your progress over time</Text>
      </View>
      
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryContainer}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <ProgressCircle
              percentage={overallAverage * 100}
              color={overallColor}
              size={80}
            />
            <Text style={[styles.progressLabel, { color: overallColor }]}>
              {overallLabel}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(overallAverage * 100)}%
            </Text>
          </View>
          
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>This Week</Text>
            <ProgressCircle
              percentage={weekAverage * 100}
              color={weeklyColor}
              size={80}
            />
            <Text style={[styles.progressLabel, { color: weeklyColor }]}>
              {weeklyLabel}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(weekAverage * 100)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <Text style={styles.sectionSubtitle}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </Text>
          
          <View style={styles.chartContainer}>
            <BarChart 
              data={weeklyData}
              valueKey="progress"
              labelKey="day"
            />
          </View>
        </View>
        
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Monthly Trend</Text>
          <Text style={styles.sectionSubtitle}>Last 4 weeks</Text>
          
          <View style={styles.chartContainer}>
            <BarChart 
              data={last4Weeks}
              valueKey="progress"
              labelKey="week"
            />
          </View>
        </View>
        
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Productivity Breakdown</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dailyPlans.length}
              </Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dailyPlans.reduce((sum, plan) => sum + plan.goalsCompleted, 0)}
              </Text>
              <Text style={styles.statLabel}>Goals Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dailyPlans.reduce((sum, plan) => sum + plan.goals.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 12,
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
    textAlign: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  chartSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
    marginBottom: 12,
  },
  chartContainer: {
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  statsSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },
});