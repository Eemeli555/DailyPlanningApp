import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { MOOD_LABELS } from '@/constants/gamification';
import { JournalEntry } from '@/types';

interface MoodChartProps {
  entries: JournalEntry[];
}

const MoodChart = ({ entries }: MoodChartProps) => {
  const maxHeight = 80;
  
  const getMoodColor = (mood: number) => {
    const moodData = MOOD_LABELS.find(m => m.value === mood);
    return moodData?.color || COLORS.neutral[400];
  };

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {entries.map((entry, index) => {
          const height = (entry.mood / 5) * maxHeight;
          const color = getMoodColor(entry.mood);
          
          return (
            <View key={entry.id} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.max(height, 4),
                      backgroundColor: color,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dateLabel}>
                {format(new Date(entry.date), 'M/d')}
              </Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Mood Scale</Text>
        <View style={styles.legendItems}>
          {MOOD_LABELS.map((mood) => (
            <View key={mood.value} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: mood.color }]} />
              <Text style={styles.legendText}>{mood.emoji} {mood.label}</Text>
            </View>
          ))}
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
    height: 100,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 16,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 4,
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
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
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

export default MoodChart;