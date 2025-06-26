import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface HabitStreakCardProps {
  streak: number;
}

const HabitStreakCard = ({ streak }: HabitStreakCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Flame size={20} color={streak > 0 ? COLORS.warning[600] : COLORS.neutral[400]} />
      </View>
      <Text style={styles.streakNumber}>{streak}</Text>
      <Text style={styles.streakLabel}>Day Streak</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  iconContainer: {
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.warning[700],
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning[600],
    marginTop: 4,
  },
});

export default HabitStreakCard;