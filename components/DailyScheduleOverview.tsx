import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, set, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';

interface DailyScheduleOverviewProps {
  goals: Goal[];
  date?: Date;
}

// Generate time slots from 6 AM to 10 PM (16 hours) in 1-hour intervals for mobile
const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6;
  return { hour, minutes: 0 };
});

interface TimeBlock {
  startTime: Date;
  endTime: Date;
  activity: string;
  isCompleted: boolean;
  goal?: Goal;
}

const DailyScheduleOverview = ({ goals, date = new Date() }: DailyScheduleOverviewProps) => {
  // Create simplified time blocks for mobile view
  const createTimeBlocks = (): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    
    TIME_SLOTS.forEach((slot) => {
      const slotTime = set(date, { 
        hours: slot.hour, 
        minutes: slot.minutes 
      });
      
      const nextSlotTime = set(date, { 
        hours: slot.hour + 1, 
        minutes: slot.minutes 
      });
      
      // Find scheduled goal for this hour
      const scheduledGoal = goals.find(goal => {
        if (!goal.scheduledTime) return false;
        
        const startTime = new Date(goal.scheduledTime.start);
        const endTime = new Date(goal.scheduledTime.end);
        
        return isWithinInterval(slotTime, { start: startTime, end: endTime }) ||
               (startTime >= slotTime && startTime < nextSlotTime);
      });
      
      if (scheduledGoal) {
        blocks.push({
          startTime: slotTime,
          endTime: nextSlotTime,
          activity: scheduledGoal.title,
          isCompleted: scheduledGoal.completed,
          goal: scheduledGoal,
        });
      }
    });
    
    return blocks;
  };

  const timeBlocks = createTimeBlocks();
  const unscheduledGoals = goals.filter(goal => !goal.scheduledTime);
  const completedCount = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;

  const formatTime = (time: Date) => {
    return format(time, 'HH:mm');
  };

  const getNextScheduledGoal = () => {
    const now = new Date();
    const upcomingGoals = goals
      .filter(goal => goal.scheduledTime && !goal.completed)
      .filter(goal => new Date(goal.scheduledTime!.start) > now)
      .sort((a, b) => 
        new Date(a.scheduledTime!.start).getTime() - new Date(b.scheduledTime!.start).getTime()
      );
    
    return upcomingGoals[0];
  };

  const nextGoal = getNextScheduledGoal();

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>TODAY'S PLAN</Text>
          <Text style={styles.subtitle}>
            {completedCount}/{totalGoals} completed
          </Text>
        </View>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            {Math.round((completedCount / Math.max(totalGoals, 1)) * 100)}%
          </Text>
        </View>
      </View>

      {/* Next Up Section */}
      {nextGoal && (
        <View style={styles.nextUpSection}>
          <View style={styles.nextUpHeader}>
            <Clock size={16} color={COLORS.primary[600]} />
            <Text style={styles.nextUpTitle}>Next Up</Text>
          </View>
          <Text style={styles.nextUpGoal}>{nextGoal.title}</Text>
          <Text style={styles.nextUpTime}>
            {format(new Date(nextGoal.scheduledTime!.start), 'HH:mm')} - 
            {format(new Date(nextGoal.scheduledTime!.end), 'HH:mm')}
          </Text>
        </View>
      )}

      {/* Compact Schedule Timeline */}
      {timeBlocks.length > 0 && (
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Scheduled</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timelineContainer}
          >
            {timeBlocks.map((block, index) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.timelineTime}>
                  {formatTime(block.startTime)}
                </Text>
                <View style={[
                  styles.timelineBlock,
                  block.isCompleted && styles.completedBlock
                ]}>
                  {block.isCompleted && (
                    <CheckCircle size={12} color={COLORS.white} />
                  )}
                  <Text style={[
                    styles.timelineActivity,
                    block.isCompleted && styles.completedActivity
                  ]} numberOfLines={2}>
                    {block.activity}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Unscheduled Goals - Compact List */}
      {unscheduledGoals.length > 0 && (
        <View style={styles.unscheduledSection}>
          <Text style={styles.sectionTitle}>
            Unscheduled ({unscheduledGoals.length})
          </Text>
          <View style={styles.unscheduledList}>
            {unscheduledGoals.slice(0, 3).map((goal, index) => (
              <View key={goal.id} style={styles.unscheduledItem}>
                <View style={[
                  styles.unscheduledDot,
                  goal.completed && styles.completedDot
                ]} />
                <Text style={[
                  styles.unscheduledText,
                  goal.completed && styles.completedText
                ]} numberOfLines={1}>
                  {goal.title}
                </Text>
              </View>
            ))}
            {unscheduledGoals.length > 3 && (
              <Text style={styles.moreText}>
                +{unscheduledGoals.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  progressIndicator: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[700],
  },
  nextUpSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  nextUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextUpTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextUpGoal: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[800],
    marginBottom: 2,
  },
  nextUpTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
  },
  timelineSection: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  timelineItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  timelineTime: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  timelineBlock: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  completedBlock: {
    backgroundColor: COLORS.success[500],
  },
  timelineActivity: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
    textAlign: 'center',
    lineHeight: 12,
  },
  completedActivity: {
    color: COLORS.white,
  },
  unscheduledSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unscheduledList: {
    gap: 6,
  },
  unscheduledItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unscheduledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neutral[400],
    marginRight: 8,
  },
  completedDot: {
    backgroundColor: COLORS.success[500],
  },
  unscheduledText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[500],
  },
  moreText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    fontStyle: 'italic',
    marginLeft: 14,
    marginTop: 2,
  },
});

export default DailyScheduleOverview;