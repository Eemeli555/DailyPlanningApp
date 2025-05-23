import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';
import { getCompletionColorForProgress } from '@/utils/helpers';

interface BarChartProps {
  data: { [key: string]: any }[];
  valueKey: string;
  labelKey: string;
  maxValue?: number;
  height?: number;
}

const BarChart = ({
  data,
  valueKey,
  labelKey,
  maxValue = 1,
  height = 200,
}: BarChartProps) => {
  // Find the real max value if not specified
  const actualMaxValue = maxValue || Math.max(...data.map(item => item[valueKey]));
  
  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { height }]}>
        {data.map((item, index) => {
          const value = item[valueKey];
          const normalizedValue = actualMaxValue > 0 ? value / actualMaxValue : 0;
          const barHeight = Math.max(normalizedValue * height, 4); // Minimum bar height
          const color = getCompletionColorForProgress(normalizedValue);
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelsContainer}>
                <Text style={styles.barValueLabel}>
                  {Math.round(value * 100)}%
                </Text>
              </View>
              
              <View style={styles.barWrapper}>
                <Animated.View 
                  entering={FadeInUp.delay(index * 100).springify()}
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      backgroundColor: color,
                    }
                  ]}
                />
              </View>
              
              <Text style={styles.barLabel}>
                {item[labelKey]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 24,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barLabelsContainer: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
    width: '100%',
  },
  barValueLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  barWrapper: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 20,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BarChart;