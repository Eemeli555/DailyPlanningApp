import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, set, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';
import TaskDetailModal from './TaskDetailModal';

interface DailyScheduleOverviewProps {
  goals: Goal[];
  date?: Date;
  onToggleComplete?: (goalId: string) => void;
  onSetTimer?: (goalId: string) => void;
  onEditSchedule?: (goal: Goal) => void;
  onEditGoal?: (goal: Goal) => void;
}

interface TimeBlock {
  startTime: Date;
  endTime: Date;
  activity: string;
  isCompleted: boolean;
  goal?: Goal;
}

const DailyScheduleOverview = ({ 
  goals, 
  date = new Date(),
  onToggleComplete,
  onSetTimer,
  onEditSchedule,
  onEditGoal
}: DailyScheduleOverviewProps) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Create time blocks from scheduled goals
  const createTimeBlocks = (): TimeBlock[] => {
    const blocks: TimeBlock[] = [];
    
    // Get all scheduled goals and create blocks for them
    goals.forEach(goal => {
      if (goal.scheduledTime) {
        const startTime = new Date(goal.scheduledTime.start);
        const endTime = new Date(goal.scheduledTime.end);
        
        blocks.push({
          startTime,
          endTime,
          activity: goal.title,
          isCompleted: goal.completed,
          goal,
        });
      }
    });
    
    // Sort blocks by start time
    return blocks.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const timeBlocks = createTimeBlocks();
  const unscheduledGoals = goals.filter(goal => !goal.scheduledTime);
  const completedCount = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;

  const formatTimeRange = (startTime: Date, endTime: Date) => {
    const startHour = format(startTime, 'H');
    const endHour = format(endTime, 'H');
    const endMinutes = format(endTime, 'm');
    
    // If end time has minutes, show them
    if (endMinutes !== '0') {
      return `${startHour}-${format(endTime, 'H:mm')}`;
    }
    
    return `${startHour}-${endHour}`;
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

  const handleGoalPress = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedGoal(null);
  };

  const handleToggleComplete = (goalId: string) => {
    onToggleComplete?.(goalId);
    handleCloseModal();
  };

  const handleSetTimer = () => {
    if (selectedGoal) {
      onSetTimer?.(selectedGoal.id);
      handleCloseModal();
    }
  };

  const handleEditSchedule = () => {
    if (selectedGoal) {
      onEditSchedule?.(selectedGoal);
      handleCloseModal();
    }
  };

  const handleEditGoal = () => {
    if (selectedGoal) {
      onEditGoal?.(selectedGoal);
      handleCloseModal();
    }
  };

  return (
    <>
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
          <TouchableOpacity 
            style={styles.nextUpSection}
            onPress={() => handleGoalPress(nextGoal)}
            activeOpacity={0.7}
          >
            <View style={styles.nextUpHeader}>
              <Clock size={16} color={COLORS.primary[600]} />
              <Text style={styles.nextUpTitle}>Next Up</Text>
            </View>
            <Text style={styles.nextUpGoal}>{nextGoal.title}</Text>
            <Text style={styles.nextUpTime}>
              {formatTimeRange(
                new Date(nextGoal.scheduledTime!.start), 
                new Date(nextGoal.scheduledTime!.end)
              )}
            </Text>
          </TouchableOpacity>
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
                <TouchableOpacity
                  key={index}
                  style={styles.timelineItem}
                  onPress={() => block.goal && handleGoalPress(block.goal)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timelineTime}>
                    {formatTimeRange(block.startTime, block.endTime)}
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
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Unscheduled Tasks - Compact List */}
        {unscheduledGoals.length > 0 && (
          <View style={styles.unscheduledSection}>
            <Text style={styles.sectionTitle}>
              Unscheduled ({unscheduledGoals.length})
            </Text>
            <View style={styles.unscheduledList}>
              {unscheduledGoals.slice(0, 3).map((goal, index) => (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.unscheduledItem}
                  onPress={() => handleGoalPress(goal)}
                  activeOpacity={0.7}
                >
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
                </TouchableOpacity>
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

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={showDetailModal}
        goal={selectedGoal}
        onClose={handleCloseModal}
        onToggleComplete={handleToggleComplete}
        onSetTimer={selectedGoal && !selectedGoal.scheduledTime ? handleSetTimer : undefined}
        onEditSchedule={selectedGoal?.scheduledTime ? handleEditSchedule : undefined}
        onEdit={handleEditGoal}
      />
    </>
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