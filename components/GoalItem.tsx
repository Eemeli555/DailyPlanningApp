import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';
import Checkbox from './Checkbox';
import { Clock, Edit } from 'lucide-react-native';
import { format } from 'date-fns';

interface GoalItemProps {
  goal: Goal;
  onToggleComplete?: (goalId: string) => void;
  onSetTimer?: () => void;
  onEditSchedule?: () => void;
  disabled?: boolean;
  showTimer?: boolean;
}

const GoalItem = ({ 
  goal, 
  onToggleComplete, 
  onSetTimer,
  onEditSchedule,
  disabled = false,
  showTimer = false,
}: GoalItemProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        disabled={disabled}
        onPress={() => onToggleComplete?.(goal.id)}
      >
        <Checkbox
          checked={goal.completed}
          onPress={() => onToggleComplete?.(goal.id)}
          disabled={disabled}
        />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={[
          styles.title, 
          goal.completed && styles.completedTitle
        ]}>
          {goal.title}
        </Text>
        
        {goal.description ? (
          <Text style={[
            styles.description, 
            goal.completed && styles.completedDescription
          ]}>
            {goal.description}
          </Text>
        ) : null}
        
        {goal.scheduledTime && (
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleText}>
              {format(new Date(goal.scheduledTime.start), 'HH:mm')} - 
              {format(new Date(goal.scheduledTime.end), 'HH:mm')}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditSchedule}
              disabled={disabled}
            >
              <Edit size={14} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
        )}
        
        {goal.isAutomatic && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Automatic</Text>
            </View>
          </View>
        )}
      </View>
      
      {showTimer && onSetTimer && !goal.scheduledTime && (
        <TouchableOpacity 
          style={styles.timerButton} 
          onPress={onSetTimer}
          disabled={disabled}
        >
          <Clock 
            size={18} 
            color={goal.hasTimer ? COLORS.primary[600] : COLORS.neutral[400]} 
            strokeWidth={goal.hasTimer ? 2.5 : 2}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  checkbox: {
    paddingRight: 12,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[500],
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[400],
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  editButton: {
    padding: 4,
    marginLeft: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
  },
  timerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});

export default GoalItem;