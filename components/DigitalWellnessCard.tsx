import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Smartphone, TrendingDown, TrendingUp, Target, Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { formatUsageTime } from '@/utils/socialMediaTracking';

interface DigitalWellnessCardProps {
  totalUsage: number;
  weeklyAverage: number;
  topApp: { name: string; usage: number; color: string } | null;
  intentfulnessScore: number; // 0-100
  onPress?: () => void;
}

const DigitalWellnessCard = ({
  totalUsage,
  weeklyAverage,
  topApp,
  intentfulnessScore,
  onPress
}: DigitalWellnessCardProps) => {
  const usageTrend = totalUsage > weeklyAverage ? 'up' : totalUsage < weeklyAverage ? 'down' : 'stable';
  const trendPercentage = weeklyAverage > 0 
    ? Math.abs(Math.round(((totalUsage - weeklyAverage) / weeklyAverage) * 100))
    : 0;

  const getTrendColor = () => {
    switch (usageTrend) {
      case 'up':
        return COLORS.error[600];
      case 'down':
        return COLORS.success[600];
      default:
        return COLORS.neutral[500];
    }
  };

  const getTrendIcon = () => {
    switch (usageTrend) {
      case 'up':
        return <TrendingUp size={14} color={getTrendColor()} />;
      case 'down':
        return <TrendingDown size={14} color={getTrendColor()} />;
      default:
        return <Clock size={14} color={getTrendColor()} />;
    }
  };

  const getIntentfulnessColor = () => {
    if (intentfulnessScore >= 80) return COLORS.success[600];
    if (intentfulnessScore >= 60) return COLORS.warning[500];
    return COLORS.error[600];
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Smartphone size={16} color={COLORS.primary[600]} />
          </View>
          <Text style={styles.title}>Digital Wellness</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalUsage}>{formatUsageTime(totalUsage)}</Text>
          <Text style={styles.totalLabel}>today</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Usage Trend */}
        <View style={styles.trendContainer}>
          <View style={styles.trendItem}>
            {getTrendIcon()}
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {usageTrend === 'stable' ? 'Same as usual' : 
               `${trendPercentage}% ${usageTrend === 'up' ? 'more' : 'less'} than usual`}
            </Text>
          </View>
        </View>

        {/* Top App */}
        {topApp && (
          <View style={styles.topAppContainer}>
            <View style={[styles.topAppIcon, { backgroundColor: topApp.color + '20' }]}>
              <Text style={[styles.topAppIconText, { color: topApp.color }]}>
                {topApp.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.topAppInfo}>
              <Text style={styles.topAppName}>{topApp.name}</Text>
              <Text style={styles.topAppUsage}>{formatUsageTime(topApp.usage)}</Text>
            </View>
            <Text style={styles.topAppLabel}>most used</Text>
          </View>
        )}

        {/* Intentfulness Score */}
        <View style={styles.intentfulnessContainer}>
          <View style={styles.intentfulnessHeader}>
            <Target size={14} color={getIntentfulnessColor()} />
            <Text style={styles.intentfulnessLabel}>Mindful Usage</Text>
          </View>
          <View style={styles.intentfulnessBar}>
            <View 
              style={[
                styles.intentfulnessFill,
                { 
                  width: `${intentfulnessScore}%`,
                  backgroundColor: getIntentfulnessColor()
                }
              ]} 
            />
          </View>
          <Text style={[styles.intentfulnessScore, { color: getIntentfulnessColor() }]}>
            {intentfulnessScore}% intentional
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
    marginBottom: 16,
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
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  totalUsage: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  content: {
    gap: 12,
  },
  trendContainer: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 8,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  topAppContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 8,
  },
  topAppIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  topAppIconText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  topAppInfo: {
    flex: 1,
  },
  topAppName: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  topAppUsage: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  topAppLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  intentfulnessContainer: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 8,
  },
  intentfulnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  intentfulnessLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  intentfulnessBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  intentfulnessFill: {
    height: '100%',
    borderRadius: 2,
  },
  intentfulnessScore: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'right',
  },
});

export default DigitalWellnessCard;