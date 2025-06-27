import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, subDays } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { SocialMediaUsage } from '@/types';

interface SocialMediaChartProps {
  socialMediaData: SocialMediaUsage[];
  days?: number;
}

const SocialMediaChart = ({ socialMediaData, days = 7 }: SocialMediaChartProps) => {
  const maxHeight = 100;
  
  // Generate last N days
  const today = new Date();
  const chartDays = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    return format(date, 'yyyy-MM-dd');
  });
  
  const getUsageForDay = (date: string) => {
    return socialMediaData.find(usage => usage.date === date);
  };

  // Calculate max minutes for scaling
  const maxMinutes = Math.max(
    ...socialMediaData.map(usage => usage.totalMinutes),
    120 // Minimum scale of 2 hours
  );

  const getUsageColor = (minutes: number, average: number) => {
    if (minutes === 0) return COLORS.success[500];
    if (minutes < average * 0.7) return COLORS.success[400];
    if (minutes < average) return COLORS.warning[500];
    if (minutes < average * 1.5) return COLORS.warning[600];
    return COLORS.error[500];
  };

  // Calculate average
  const totalMinutes = socialMediaData.reduce((sum, usage) => sum + usage.totalMinutes, 0);
  const average = socialMediaData.length > 0 ? totalMinutes / socialMediaData.length : 0;

  const formatTime = (minutes: number) => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Social Media Usage</Text>
        <Text style={styles.average}>Avg: {formatTime(Math.round(average))}/day</Text>
      </View>
      
      <View style={styles.chart}>
        {chartDays.map((date, index) => {
          const usage = getUsageForDay(date);
          const minutes = usage?.totalMinutes || 0;
          const height = Math.max((minutes / maxMinutes) * maxHeight, 4);
          const color = getUsageColor(minutes, average);
          
          return (
            <View key={date} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height,
                      backgroundColor: color,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.timeLabel}>
                {formatTime(minutes)}
              </Text>
              <Text style={styles.dateLabel}>
                {format(new Date(date), 'EEE')}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success[500] }]} />
            <Text style={styles.legendText}>No usage</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success[400] }]} />
            <Text style={styles.legendText}>Below average</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning[500] }]} />
            <Text style={styles.legendText}>Average</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.error[500] }]} />
            <Text style={styles.legendText}>High usage</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  average: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 20,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  timeLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
});

export default SocialMediaChart;