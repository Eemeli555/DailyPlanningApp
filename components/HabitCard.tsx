import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { CheckCircle, Circle, Edit3, Flame } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { HABIT_CATEGORIES } from '@/constants/gamification';
import { Habit, HabitEntry } from '@/types';
import { calculateHabitStreak } from '@/utils/gamification';

interface HabitCardProps {
  habit: Habit;
  entry?: HabitEntry;
  onToggle: () => void;
  onEdit: () => void;
  showStreak?: boolean;
}

const HabitCard = ({ habit, entry, onToggle, onEdit, showStreak = true }: HabitCardProps) => {
  const category = HABIT_CATEGORIES.find(c => c.id === habit.category);
  const isCompleted = entry?.completed || false;
  
  // For demo purposes, we'll show a mock streak
  const streak = Math.floor(Math.random() * 15) + 1;

  return (
    <View style={[styles.container, { borderLeftColor: habit.color }]}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
        {isCompleted ? (
          <CheckCircle size={24} color={COLORS.success[600]} />
        ) : (
          <Circle size={24} color={COLORS.neutral[400]} />
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>
            {habit.title}
          </Text>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Edit3 size={16} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        </View>
        
        {habit.description && (
          <Text style={[styles.description, isCompleted && styles.completedDescription]}>
            {habit.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryDot, { backgroundColor: category?.color || COLORS.neutral[400] }]} />
            <Text style={styles.categoryText}>{category?.name || 'Other'}</Text>
          </View>
          
          {showStreak && streak > 0 && (
            <View style={styles.streakContainer}>
              <Flame size={14} color={COLORS.warning[600]} />
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          )}
        </View>
        
        {habit.targetCount && habit.unit && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Target: {habit.targetCount} {habit.unit}
              {entry?.count && ` • Completed: ${entry.count} ${habit.unit}`}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[500],
  },
  editButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 8,
    lineHeight: 20,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[400],
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning[700],
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
});

export default HabitCard;