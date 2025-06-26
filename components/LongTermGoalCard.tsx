import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { CircleCheck as CheckCircle, Circle, CreditCard as Edit, Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { GOAL_CATEGORIES } from '@/constants/gamification';
import { LongTermGoal } from '@/types';

interface LongTermGoalCardProps {
  goal: LongTermGoal;
  onToggleSubtask: (subtaskId: string) => void;
  onEdit: () => void;
}

const LongTermGoalCard = ({ goal, onToggleSubtask, onEdit }: LongTermGoalCardProps) => {
  const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
  const completedSubtasks = goal.subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = goal.subtasks.length;
  
  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high': return COLORS.error[500];
      case 'medium': return COLORS.warning[500];
      case 'low': return COLORS.success[500];
      default: return COLORS.neutral[400];
    }
  };

  const getStatusColor = () => {
    switch (goal.status) {
      case 'completed': return COLORS.success[500];
      case 'in_progress': return COLORS.primary[500];
      case 'paused': return COLORS.warning[500];
      default: return COLORS.neutral[400];
    }
  };

  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'completed';

  return (
    <View style={[styles.container, { borderLeftColor: goal.color }]}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{goal.title}</Text>
          <View style={styles.badges}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
              <Text style={styles.badgeText}>{goal.priority}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.badgeText}>{goal.status.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Edit size={16} color={COLORS.neutral[500]} />
        </TouchableOpacity>
      </View>
      
      {goal.description && (
        <Text style={styles.description}>{goal.description}</Text>
      )}
      
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Progress: {completedSubtasks}/{totalSubtasks} tasks
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(goal.progress * 100)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${goal.progress * 100}%`,
                backgroundColor: goal.color 
              }
            ]} 
          />
        </View>
      </View>
      
      {/* Subtasks */}
      {goal.subtasks.length > 0 && (
        <View style={styles.subtasksSection}>
          <Text style={styles.subtasksTitle}>Tasks</Text>
          {goal.subtasks.slice(0, 3).map((subtask) => (
            <TouchableOpacity
              key={subtask.id}
              style={styles.subtaskItem}
              onPress={() => onToggleSubtask(subtask.id)}
            >
              {subtask.completed ? (
                <CheckCircle size={16} color={COLORS.success[600]} />
              ) : (
                <Circle size={16} color={COLORS.neutral[400]} />
              )}
              <Text style={[
                styles.subtaskText,
                subtask.completed && styles.completedSubtaskText
              ]}>
                {subtask.title}
              </Text>
            </TouchableOpacity>
          ))}
          
          {goal.subtasks.length > 3 && (
            <Text style={styles.moreSubtasks}>
              +{goal.subtasks.length - 3} more tasks
            </Text>
          )}
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryDot, { backgroundColor: category?.color || COLORS.neutral[400] }]} />
          <Text style={styles.categoryText}>{category?.name || 'Other'}</Text>
        </View>
        
        {goal.deadline && (
          <View style={[styles.deadlineContainer, isOverdue && styles.overdueContainer]}>
            {isOverdue ? (
              <AlertCircle size={14} color={COLORS.error[600]} />
            ) : (
              <Calendar size={14} color={COLORS.neutral[600]} />
            )}
            <Text style={[
              styles.deadlineText,
              isOverdue && styles.overdueText
            ]}>
              {format(new Date(goal.deadline), 'MMM d, yyyy')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  editButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[700],
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  subtasksSection: {
    marginBottom: 12,
  },
  subtasksTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subtaskText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    marginLeft: 8,
    flex: 1,
  },
  completedSubtaskText: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[500],
  },
  moreSubtasks: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueContainer: {
    backgroundColor: COLORS.error[50],
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginLeft: 4,
  },
  overdueText: {
    color: COLORS.error[600],
  },
});

export default LongTermGoalCard;