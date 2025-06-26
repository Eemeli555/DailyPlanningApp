import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { X, Target, Repeat, Dumbbell, Plus } from 'lucide-react-native';
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
      id: 'goal',
      title: 'Daily Goal',
      description: 'Create a goal for today or your library',
      icon: Target,
      color: COLORS.primary[600],
      backgroundColor: COLORS.primary[50],
      route: '/modals/add-goal',
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
      description: 'Design a new workout routine',
      icon: Dumbbell,
      color: COLORS.warning[600],
      backgroundColor: COLORS.warning[50],
      route: '/modals/add-workout',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        entering={FadeIn.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.modal}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Plus size={24} color={COLORS.primary[600]} />
            </View>
            <Text style={styles.title}>What would you like to create?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.neutral[600]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.choices}>
            {choices.map((choice, index) => {
              const Icon = choice.icon;
              
              return (
                <Animated.View
                  key={choice.id}
                  entering={FadeInDown.delay(200 + index * 100).springify()}
                >
                  <TouchableOpacity
                    style={[styles.choiceCard, { backgroundColor: choice.backgroundColor }]}
                    onPress={() => handleChoice(choice.route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.choiceIcon, { backgroundColor: choice.color }]}>
                      <Icon size={24} color={COLORS.white} />
                    </View>
                    
                    <View style={styles.choiceContent}>
                      <Text style={styles.choiceTitle}>{choice.title}</Text>
                      <Text style={styles.choiceDescription}>{choice.description}</Text>
                    </View>
                    
                    <View style={styles.arrow}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[900],
  },
  closeButton: {
    padding: 4,
  },
  choices: {
    padding: 20,
    gap: 12,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  choiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  choiceContent: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  choiceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: COLORS.neutral[400],
  },
});

export default CreateChoiceModal;