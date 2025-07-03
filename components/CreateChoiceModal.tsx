import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { X, Target, Repeat, Dumbbell, Plus, ListTodo, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

interface CreateChoiceModalProps {
  visible: boolean;
  onClose: () => void;
}

const CreateChoiceModal = ({ visible, onClose }: CreateChoiceModalProps) => {
  const router = useRouter();

  const handleChoice = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const choices = [
    {
      id: 'daily-task',
      title: 'Daily Task',
      description: 'Create a simple daily task',
      icon: ListTodo,
      color: COLORS.primary[600],
      backgroundColor: COLORS.primary[50],
      route: '/modals/add-task',
    },
    {
      id: 'long-term-goal',
      title: 'Long-term Goal',
      description: 'Set a bigger aspiration with subtasks',
      icon: Target,
      color: COLORS.secondary[600],
      backgroundColor: COLORS.secondary[50],
      route: '/modals/add-long-term-goal',
    },
    {
      id: 'habit',
      title: 'Habit',
      description: 'Build a new positive habit',
      icon: Repeat,
      color: COLORS.accent[600],
      backgroundColor: COLORS.accent[50],
      route: '/modals/add-habit',
    },
    {
      iI'll implement the future day planning feature and improve the scheduling functionality. This will include:

1. **Future Day Planning**: Allow users to add tasks and activities to future dates
2. **Enhanced Scheduling**: Improved scheduling modal with time selection during task creation
3. **Better Calendar Integration**: Enhanced calendar view for planning future days
4. **Automatic Habit Addition**: Habits will be automatically added to future days

Let me start by creating the enhanced scheduling components:

<boltArtifact id="future-day-planning" title="Future Day Planning and Enhanced Scheduling">