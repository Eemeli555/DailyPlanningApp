import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, set, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';

interface DailyScheduleOverviewProps {
  goals: Goal[];
  date?: Date;
}

// Generate time slots from 6 AM to 10 PM (16 hours) in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

// Color palette for time slots
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

interface TimeBlock {
  startTime: Date;
  endTime: Date;
  activity: string;
  isCompleted: boolean;
  colorIndex: number;
}

const DailyScheduleOverview = ({ goals, date = new Date() }: DailyScheduleOverviewProps) => {
  // Create time blocks by merging consecutive slots with the same activity
  const createTimeBlocks = (): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    let currentBlock: TimeBlock | null = null;
    
    TIME_SLOTS.forEach((slot, index) => {
      const slotTime = set(date, { 
        hours: slot.hour, 
        minutes: slot.minutes 
      });
      
      // Find scheduled goal for this time slot
      const scheduledGoal = goals.find(goal => {
        if (!goal.scheduledTime) return false;
        
        const startTime = new Date(goal.scheduledTime.start);
        const endTime = new Date(goal.scheduledTime.end);
        
        return isWithinInterval(slotTime, { start: startTime, end: endTime });
      });
      
      const activity = scheduledGoal ? scheduledGoal.title : 'Free Time';
      const isCompleted = scheduledGoal?.completed || false;
      
      // If this is the same activity as the current block, extend the current block
      if (currentBlock && 
          currentBlock.activity === activity && 
          currentBlock.isCompleted === isCompleted) {
        // Extend the current block
        currentBlock.endTime = set(date, { 
          hours: slot.hour, 
          minutes: slot.minutes + 30 
        });
      } else {
        // Start a new block
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        
        currentBlock = {
          startTime: slotTime,
          endTime: set(date, { 
            hours: slot.hour, 
            minutes: slot.minutes + 30 
          }),
          activity,
          isCompleted,
          colorIndex: blocks.length % TIME_COLORS.length,
        };
      }
    });
    
    // Add the last block
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    
    return blocks;
  };

  const timeBlocks = createTimeBlocks();

  const formatTimeRange = (startTime: Date, endTime: Date) => {
    const start = format(startTime, 'H:mm');
    const end = format(endTime, 'H:mm');
    return `${start} - ${end}`;
  };

  const getColorForIndex = (index: number) => {
    return TIME_COLORS[index % TIME_COLORS.length];
  };

  const calculateBlockHeight = (startTime: Date, endTime: Date) => {
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    // Base height of 44px for 30 minutes, scale proportionally
    return Math.max(44, (durationMinutes / 30) * 44);
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
        {timeBlocks.map((block, index) => {
          const blockHeight = calculateBlockHeight(block.startTime, block.endTime);
          
          return (
            <View key={index} style={[styles.timeSlotRow, { height: blockHeight }]}>
              <View style={[
                styles.timeBlock,
                { 
                  backgroundColor: getColorForIndex(block.colorIndex),
                  height: blockHeight 
                }
              ]}>
                <Text style={styles.timeText}>
                  {formatTimeRange(block.startTime, block.endTime)}
                </Text>
              </View>
              
              <View style={[
                styles.activityBlock,
                { height: blockHeight },
                block.isCompleted && styles.completedActivity
              ]}>
                <Text style={[
                  styles.activityText,
                  block.isCompleted && styles.completedActivityText
                ]}>
                  {block.activity}
                </Text>
                {block.isCompleted && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              
              <View style={[styles.notesBlock, { height: blockHeight }]} />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  timeBlock: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 2,
    borderRightColor: COLORS.white,
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    lineHeight: 16,
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