import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, subDays } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { SleepData } from '@/types';

interface SleepChartProps {
  sleepData: SleepData[];
  days?: number;
}

const SleepChart = ({ sleepData, days = 7 }: SleepChartProps) => {
  const maxHeight = 100;
  const maxHours = 12;
  
  // Generate last N days
  const today = new Date();
  const chartDays = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    return format(date, 'yyyy-MM-dd');
  });
  
  const getSleepForDay = (date: string) => {
    return sleepData.find(sleep => sleep.date === date);
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return COLORS.success[500];
    if (quality >= 6) return COLORS.warning[500];
    if (quality >= 4) return COLORS.warning[600];
    return COLORS.error[500];
  };

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {chartDays.map((date, index) => {
          const sleep = getSleepForDay(date);
          const hours = sleep?.hoursSlept || 0;
          const quality = sleep?.quality || 0;
          const height = Math.max((hours / maxHours) * maxHeight, 4);
          const color = sleep ? getQualityColor(quality) : COLORS.neutral[200];
          
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
              <Text style={styles.hoursLabel}>
                {hours > 0 ? `${hours}h` : '-'}
              </Text>
              <Text style={styles.dateLabel}>
                {format(new Date(date), 'EEE')}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Sleep Quality Scale</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success[500] }]} />
            <Text style={styles.legendText}>Great (8-10)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning[500] }]} />
            <Text style={styles.legendText}>Good (6-7)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning[600] }]} />
            <Text style={styles.legendText}>Fair (4-5)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.error[500] }]} />
            <Text style={styles.legendText}>Poor (1-3)</Text>
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
  hoursLabel: {
    fontSize: 10,
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
  legendTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    marginBottom: 8,
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

export default SleepChart;