import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Smartphone, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';
import { TrackedApp, AppUsageSession } from '@/types';
import { formatUsageTime, getUsageColor, calculateWeeklyAverage } from '@/utils/socialMediaTracking';

interface SocialMediaUsageChartProps {
  apps: TrackedApp[];
  usageSessions: AppUsageSession[];
  days?: number;
  onAppPress?: (app: TrackedApp) => void;
}

const SocialMediaUsageChart = ({ 
  apps, 
  usageSessions, 
  days = 7, 
  onAppPress 
}: SocialMediaUsageChartProps) => {
  const maxHeight = 120;
  
  // Generate last N days
  const today = new Date();
  const chartDays = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    return format(date, 'yyyy-MM-dd');
  });
  
  // Calculate daily usage for each app
  const getAppUsageForDay = (appId: string, date: string): number => {
    const sessions = usageSessions.filter(
      session => session.appId === appId && session.date === date
    );
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  // Get today's usage data
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayUsage = apps.map(app => {
    const usage = getAppUsageForDay(app.id, todayStr);
    const weeklyUsages = chartDays.map(date => getAppUsageForDay(app.id, date));
    const weeklyAverage = calculateWeeklyAverage(weeklyUsages);
    
    return {
      app,
      usage,
      weeklyAverage,
      trend: usage > weeklyAverage * 1.2 ? 'up' : usage < weeklyAverage * 0.8 ? 'down' : 'stable',
      weeklyUsages,
    };
  }).filter(item => item.usage > 0 || item.weeklyAverage > 0)
    .sort((a, b) => b.usage - a.usage);

  const totalTodayUsage = todayUsage.reduce((sum, item) => sum + item.usage, 0);
  const totalWeeklyAverage = todayUsage.reduce((sum, item) => sum + item.weeklyAverage, 0);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} color={COLORS.error[600]} />;
      case 'down':
        return <TrendingDown size={12} color={COLORS.success[600]} />;
      default:
        return <Minus size={12} color={COLORS.neutral[500]} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return COLORS.error[600];
      case 'down':
        return COLORS.success[600];
      default:
        return COLORS.neutral[500];
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Smartphone size={20} color={COLORS.primary[600]} />
          <Text style={styles.title}>Screen Time</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalUsage}>{formatUsageTime(totalTodayUsage)}</Text>
          <Text style={styles.totalLabel}>today</Text>
        </View>
      </View>

      {/* Weekly Trend */}
      <View style={styles.trendContainer}>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Weekly avg</Text>
          <Text style={styles.trendValue}>{formatUsageTime(Math.round(totalWeeklyAverage))}</Text>
        </View>
        <View style={styles.trendDivider} />
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>vs yesterday</Text>
          <View style={styles.trendChange}>
            {getTrendIcon(totalTodayUsage > totalWeeklyAverage ? 'up' : 'down')}
            <Text style={[
              styles.trendChangeText,
              { color: getTrendColor(totalTodayUsage > totalWeeklyAverage ? 'up' : 'down') }
            ]}>
              {Math.abs(Math.round(((totalTodayUsage - totalWeeklyAverage) / totalWeeklyAverage) * 100))}%
            </Text>
          </View>
        </View>
      </View>

      {/* App Usage List */}
      <ScrollView style={styles.appsList} showsVerticalScrollIndicator={false}>
        {todayUsage.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={32} color={COLORS.neutral[400]} />
            <Text style={styles.emptyStateText}>No usage data today</Text>
            <Text style={styles.emptyStateSubtext}>
              Start using tracked apps to see your usage patterns
            </Text>
          </View>
        ) : (
          todayUsage.map((item, index) => (
            <Animated.View
              key={item.app.id}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <TouchableOpacity
                style={styles.appItem}
                onPress={() => onAppPress?.(item.app)}
                activeOpacity={0.7}
              >
                <View style={styles.appInfo}>
                  <View style={[styles.appIcon, { backgroundColor: item.app.color + '20' }]}>
                    <Text style={[styles.appIconText, { color: item.app.color }]}>
                      {item.app.displayName.charAt(0)}
                    </Text>
                  </View>
                  
                  <View style={styles.appDetails}>
                    <Text style={styles.appName}>{item.app.displayName}</Text>
                    <View style={styles.appMeta}>
                      <Text style={styles.appCategory}>{item.app.category}</Text>
                      {item.app.dailyLimit && (
                        <>
                          <Text style={styles.metaDivider}>•</Text>
                          <Text style={[
                            styles.limitText,
                            { color: item.usage > item.app.dailyLimit ? COLORS.error[600] : COLORS.neutral[500] }
                          ]}>
                            {formatUsageTime(item.app.dailyLimit)} limit
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.appUsage}>
                  <Text style={[
                    styles.usageTime,
                    { color: getUsageColor(item.usage, item.app.dailyLimit) }
                  ]}>
                    {formatUsageTime(item.usage)}
                  </Text>
                  
                  <View style={styles.trendIndicator}>
                    {getTrendIcon(item.trend)}
                    <Text style={[
                      styles.trendPercentage,
                      { color: getTrendColor(item.trend) }
                    ]}>
                      {item.weeklyAverage > 0 
                        ? Math.abs(Math.round(((item.usage - item.weeklyAverage) / item.weeklyAverage) * 100))
                        : 0}%
                    </Text>
                  </View>
                </View>

                {/* Mini Chart */}
                <View style={styles.miniChart}>
                  {item.weeklyUsages.map((usage, dayIndex) => {
                    const height = Math.max((usage / Math.max(...item.weeklyUsages)) * 20, 2);
                    const isToday = dayIndex === item.weeklyUsages.length - 1;
                    
                    return (
                      <View
                        key={dayIndex}
                        style={[
                          styles.miniBar,
                          {
                            height,
                            backgroundColor: isToday ? item.app.color : item.app.color + '60',
                          }
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Progress Bar for Daily Limit */}
                {item.app.dailyLimit && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min((item.usage / item.app.dailyLimit) * 100, 100)}%`,
                            backgroundColor: getUsageColor(item.usage, item.app.dailyLimit),
                          }
                        ]}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  totalUsage: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  trendContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  trendItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  trendDivider: {
    width: 1,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: 12,
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendChangeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  appsList: {
    maxHeight: 300,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[600],
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: 4,
  },
  appItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  appMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textTransform: 'capitalize',
  },
  metaDivider: {
    fontSize: 12,
    color: COLORS.neutral[400],
    marginHorizontal: 6,
  },
  limitText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  appUsage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTime: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 8,
  },
  miniBar: {
    width: 4,
    borderRadius: 2,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default SocialMediaUsageChart;