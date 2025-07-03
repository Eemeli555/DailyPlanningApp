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
      id: 'workout',
      title: 'Workout',
      description: 'Plan a workout session',
      icon: Dumbbell,
      color: COLORS.success[600],
      backgroundColor: COLORS.success[50],
      route: '/modals/add-workout',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>What would you like to create?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.gray[600]} />
            </TouchableOpacity>
          </View>

          <View style={styles.choicesContainer}>
            {choices.map((choice, index) => (
              <Animated.View
                key={choice.id}
                entering={FadeInDown.delay(index * 100).duration(300)}
              >
                <TouchableOpacity
                  style={[styles.choiceItem, { backgroundColor: choice.backgroundColor }]}
                  onPress={() => handleChoice(choice.route)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: choice.color }]}>
                    <choice.icon size={24} color="white" />
                  </View>
                  <View style={styles.choiceContent}>
                    <Text style={styles.choiceTitle}>{choice.title}</Text>
                    <Text style={styles.choiceDescription}>{choice.description}</Text>
                  </View>
                  <Plus size={20} color={COLORS.gray[400]} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray[900],
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceContent: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  choiceDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
});

export default CreateChoiceModal;