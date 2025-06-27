import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Calendar, ChartBar as BarChart3, TrendingUp, Settings, Moon, Smartphone, Activity } from 'lucide-react-native';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import ProgressCircle from '@/components/ProgressCircle';
import BarChart from '@/components/BarChart';
import DailyPlannerTable from '@/components/DailyPlannerTable';
import SleepChart from '@/components/SleepChart';
import SocialMediaChart from '@/components/SocialMediaChart';
import DashboardMetricCard from '@/components/DashboardMetricCard';
import { getCompletionStatus } from '@/utils/helpers';

type ViewMode = 'dashboard' | 'planner' | 'analytics';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    dailyPlans, 
    getAverageProgress, 
    sleepData, 
    socialMediaData, 
    journalEntries,
    dashboardMetrics,
    updateDashboardMetric,
    toggleMetricPin,
    getAnalytics
  } = useContext(AppContext);
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  
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

  // Get analytics data
  const analytics = getAnalytics();

  // Update dashboard metrics with real data
  const updateMetricsWithRealData = () => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const lastSleep = sleepData.find(sleep => sleep.date === todayStr);
    const todaySocialMedia = socialMediaData.find(usage => usage.date === todayStr);
    
    // Update metrics
    updateDashboardMetric('avg-mood', {
      value: analytics.mood.averageMood.toFixed(1),
      trend: 'stable',
    });
    
    updateDashboardMetric('sleep-hours', {
      value: lastSleep ? `${lastSleep.hoursSlept}h` : '0h',
      subtitle: lastSleep ? `Quality: ${lastSleep.quality}/10` : 'No data',
    });
    
    updateDashboardMetric('goals-completed', {
      value: `${Math.round(weekAverage * 100)}%`,
      trend: weekAverage > overallAverage ? 'up' : weekAverage < overallAverage ? 'down' : 'stable',
      trendValue: `${Math.abs(Math.round((weekAverage - overallAverage) * 100))}% vs avg`,
    });
    
    updateDashboardMetric('social-media', {
      value: todaySocialMedia ? `${Math.round(todaySocialMedia.totalMinutes / 60)}h` : '0h',
      subtitle: todaySocialMedia ? `${todaySocialMedia.totalMinutes}m total` : 'No usage logged',
    });
  };

  const renderDashboard = () => {
    const pinnedMetrics = dashboardMetrics.filter(metric => metric.isPinned);
    const unpinnedMetrics = dashboardMetrics.filter(metric => !metric.isPinned);

    return (
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Pinned Metrics */}
        {pinnedMetrics.length > 0 && (
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Your Dashboard</Text>
            <View style={styles.metricsGrid}>
              {pinnedMetrics.map(metric => (
                <DashboardMetricCard
                  key={metric.id}
                  metric={metric}
                  onTogglePin={() => toggleMetricPin(metric.id)}
                  showPinButton
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Overview */}
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

        {/* Sleep Chart */}
        {sleepData.length > 0 && (
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Moon size={20} color={COLORS.accent[600]} />
              <Text style={styles.sectionTitle}>Sleep Tracking</Text>
            </View>
            <SleepChart sleepData={sleepData} days={7} />
          </View>
        )}

        {/* Social Media Chart */}
        {socialMediaData.length > 0 && (
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Smartphone size={20} color={COLORS.warning[600]} />
              <Text style={styles.sectionTitle}>Screen Time</Text>
            </View>
            <SocialMediaChart socialMediaData={socialMediaData} days={7} />
          </View>
        )}

        {/* Weekly Overview */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Activity size={20} color={COLORS.primary[600]} />
            <Text style={styles.sectionTitle}>Weekly Goals</Text>
          </View>
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

        {/* Additional Metrics */}
        {unpinnedMetrics.length > 0 && (
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>More Metrics</Text>
            <View style={styles.metricsGrid}>
              {unpinnedMetrics.map(metric => (
                <DashboardMetricCard
                  key={metric.id}
                  metric={metric}
                  onTogglePin={() => toggleMetricPin(metric.id)}
                  showPinButton
                />
              ))}
            </View>
          </View>
        )}
        
        {/* Monthly Trend */}
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
        
        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          
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
                {journalEntries.length}
              </Text>
              <Text style={styles.statLabel}>Journal Entries</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderAnalytics = () => (
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
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics & Planning</Text>
        <Text style={styles.subtitle}>Track progress and plan your days</Text>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'dashboard' && styles.activeToggle
            ]}
            onPress={() => setViewMode('dashboard')}
          >
            <TrendingUp size={16} color={viewMode === 'dashboard' ? COLORS.white : COLORS.neutral[600]} />
            <Text style={[
              styles.toggleText,
              viewMode === 'dashboard' && styles.activeToggleText
            ]}>
              Dashboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'planner' && styles.activeToggle
            ]}
            onPress={() => setViewMode('planner')}
          >
            <Calendar size={16} color={viewMode === 'planner' ? COLORS.white : COLORS.neutral[600]} />
            <Text style={[
              styles.toggleText,
              viewMode === 'planner' && styles.activeToggleText
            ]}>
              Daily Planner
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'analytics' && styles.activeToggle
            ]}
            onPress={() => setViewMode('analytics')}
          >
            <BarChart3 size={16} color={viewMode === 'analytics' ? COLORS.white : COLORS.neutral[600]} />
            <Text style={[
              styles.toggleText,
              viewMode === 'analytics' && styles.activeToggleText
            ]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {viewMode === 'dashboard' && renderDashboard()}
      {viewMode === 'planner' && (
        <DailyPlannerTable 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      )}
      {viewMode === 'analytics' && renderAnalytics()}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
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
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  activeToggle: {
    backgroundColor: COLORS.primary[600],
  },
  toggleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  activeToggleText: {
    color: COLORS.white,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  metricsSection: {
    marginTop: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginLeft: 8,
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