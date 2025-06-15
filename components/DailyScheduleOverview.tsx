import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, set, isWithinInterval } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';

interface DailyScheduleOverviewProps {
  goals: Goal[];
  date?: Date;
}

// Generate time slots from 6 AM to 10 PM (16 hours)
const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

// Color palette for time slots (similar to the printable schedule)
const TIME_COLORS = [
  '#FF4444', // Red
  '#FF8800', // Orange
  '#FFAA00', // Yellow-Orange
  '#44AA44', // Green
  '#44AAAA', // Teal
  '#4488FF', // Blue
  '#FF8888', // Light Red
  '#FF4400', // Red-Orange
  '#FFCC00', // Yellow
  '#88AA44', // Light Green
  '#44CCCC', // Light Teal
  '#8888FF', // Light Blue
  '#FF6666', // Pink-Red
  '#FFAA44', // Orange-Yellow
  '#CCCC44', // Olive
  '#66AA66', // Medium Green
];

const DailyScheduleOverview = ({ goals, date = new Date() }: DailyScheduleOverviewProps) => {
  const getScheduledGoalForTimeSlot = (slot: { hour: number; minutes: number }) => {
    const slotTime = set(date, { 
      hours: slot.hour, 
      minutes: slot.minutes 
    });
    
    return goals.find(goal => {
      if (!goal.scheduledTime) return false;
      
      const startTime = new Date(goal.scheduledTime.start);
      const endTime = new Date(goal.scheduledTime.end);
      
      return isWithinInterval(slotTime, { start: startTime, end: endTime });
    });
  };

  const formatTime = (slot: { hour: number; minutes: number }) => {
    const time = set(new Date(), { hours: slot.hour, minutes: slot.minutes });
    return format(time, 'h:mm');
  };

  const getColorForIndex = (index: number) => {
    return TIME_COLORS[index % TIME_COLORS.length];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DAILY ROUTINE</Text>
      </View>
      
      <ScrollView 
        style={styles.scheduleContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scheduleContent}
      >
        {TIME_SLOTS.map((slot, index) => {
          const scheduledGoal = getScheduledGoalForTimeSlot(slot);
          const activity = scheduledGoal ? scheduledGoal.title : 'Free Time';
          const isCompleted = scheduledGoal?.completed || false;
          
          return (
            <View key={`${slot.hour}-${slot.minutes}`} style={styles.timeSlotRow}>
              <View style={[
                styles.timeBlock,
                { backgroundColor: getColorForIndex(index) }
              ]}>
                <Text style={styles.timeText}>
                  {formatTime(slot)}
                </Text>
              </View>
              
              <View style={[
                styles.activityBlock,
                isCompleted && styles.completedActivity
              ]}>
                <Text style={[
                  styles.activityText,
                  isCompleted && styles.completedActivityText
                ]}>
                  {activity}
                </Text>
                {isCompleted && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.notesBlock} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.neutral[200],
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    textAlign: 'center',
    letterSpacing: 2,
  },
  scheduleContainer: {
    maxHeight: 400,
  },
  scheduleContent: {
    paddingVertical: 8,
  },
  timeSlotRow: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  timeBlock: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: COLORS.white,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activityBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedActivity: {
    backgroundColor: COLORS.success[50],
  },
  activityText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
    flex: 1,
  },
  completedActivityText: {
    color: COLORS.success[700],
    textDecorationLine: 'line-through',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  notesBlock: {
    width: 60,
    backgroundColor: COLORS.neutral[50],
    borderLeftWidth: 1,
    borderLeftColor: COLORS.neutral[200],
  },
});

export default DailyScheduleOverview;