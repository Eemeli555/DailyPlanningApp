import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';
import Checkbox from './Checkbox';
import { Clock, CreditCard as Edit, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

interface GoalItemProps {
  goal: Goal;
  onToggleComplete?: (goalId: string) => void;
  onSetTimer?: () => void;
  onEditSchedule?: () => void;
  onSchedule?: () => void;
  disabled?: boolean;
  showTimer?: boolean;
  showSchedule?: boolean;
}

const GoalItem = ({ 
  goal, 
  onToggleComplete, 
  onSetTimer,
  onEditSchedule,
  onSchedule,
  disabled = false,
  showTimer = false,
  showSchedule = true,
}: GoalItemProps) => {
  // Format time in compact format (e.g., "11" for 11:00, "11:30" for 11:30)
  const formatTimeCompact = (time: Date) => {
    const minutes = time.getMinutes();
    const hours = time.getHours();
    return minutes === 0 ? hours.toString() : format(time, 'H:mm');
  };

  // Format time range in compact format (e.g., "11-13" or "11:30-13:00")
  const formatTimeRange = (start: Date, end: Date) => {
    const startFormatted = formatTimeCompact(start);
    const endFormatted = formatTimeCompact(end);
    return `${startFormatted}-${endFormatted}`;
  };

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
          <TouchableOpacity
            style={styles.scheduleInfo}
            onPress={onEditSchedule}
            disabled={disabled}
          >
            <Text style={styles.scheduleText}>
              {formatTimeRange(
                new Date(goal.scheduledTime.start),
                new Date(goal.scheduledTime.end)
              )}
            </Text>
            <Edit size={14} color={COLORS.primary[600]} />
          </TouchableOpacity>
        )}
        
        {goal.isAutomatic && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Automatic</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        {showSchedule && !goal.scheduledTime && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onSchedule}
            disabled={disabled}
          >
            <Calendar 
              size={18} 
              color={COLORS.primary[600]} 
            />
          </TouchableOpacity>
        )}
        
        {showTimer && onSetTimer && !goal.scheduledTime && (
          <TouchableOpacity 
            style={styles.actionButton} 
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
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  scheduleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginRight: 4,
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
  },
});

export default GoalItem;