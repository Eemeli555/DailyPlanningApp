import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, set, differenceInMinutes, addMinutes } from 'date-fns';
import { Plus, Clock, GripVertical, Calendar, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { AppContext } from '@/contexts/AppContext';
import { Goal } from '@/types';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';
import GoalItem from '@/components/GoalItem';
import ProgressBar from '@/components/ProgressBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import { getCompletionStatus } from '@/utils/helpers';

// Generate time slots from 5 AM to 11 PM
const TIME_SLOTS = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

const SLOT_HEIGHT = 60;

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  
  const { 
    todaysGoals, 
    progressToday, 
    completeGoal, 
    uncompleteGoal,
    setTimerForGoal,
    updateGoalSchedule,
    quoteOfTheDay
  } = useContext(AppContext);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [draggingGoal, setDraggingGoal] = useState<Goal | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const today = new Date();
  const todayFormatted = format(today, 'EEEE, MMMM d');
  const { label, color } = getCompletionStatus(progressToday);

  // Scroll to current time on mount
  useEffect(() => {
    const currentHour = new Date().getHours();
    const currentIndex = TIME_SLOTS.findIndex(slot => slot.hour === currentHour);
    if (currentIndex > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: (currentIndex - 2) * SLOT_HEIGHT,
        animated: true
      });
    }
  }, []);

  const handleDrop = (hour: number, minutes: number) => {
    if (!draggingGoal?.scheduledTime) return;

    const currentEnd = new Date(draggingGoal.scheduledTime.end);
    const currentStart = new Date(draggingGoal.scheduledTime.start);
    const durationMinutes = differenceInMinutes(currentEnd, currentStart);

    const startTime = set(new Date(), { hours: hour, minutes });
    const endTime = addMinutes(startTime, durationMinutes);

    updateGoalSchedule(draggingGoal.id, {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      if (draggingGoal) {
        setDragPosition({ x: e.x, y: e.y });
      }
    })
    .onUpdate((e) => {
      if (draggingGoal) {
        setDragPosition({ x: e.x, y: e.y });
        
        const slotIndex = Math.floor(e.absoluteY / SLOT_HEIGHT);
        if (slotIndex >= 0 && slotIndex < TIME_SLOTS.length) {
          const { hour, minutes } = TIME_SLOTS[slotIndex];
          handleDrop(hour, minutes);
        }
      }
    })
    .onFinalize(() => {
      setDraggingGoal(null);
    });

  const handleScheduleGoal = (goal: Goal, slot: { hour: number; minutes: number }) => {
    setSelectedGoal(goal);
    setSelectedTimeSlot(slot);
    setShowScheduleModal(true);
  };

  const confirmSchedule = (duration: number) => {
    if (!selectedGoal || !selectedTimeSlot) return;

    const startTime = set(new Date(), { 
      hours: selectedTimeSlot.hour, 
      minutes: selectedTimeSlot.minutes 
    });
    
    const endTime = addMinutes(startTime, duration * 60);

    updateGoalSchedule(selectedGoal.id, {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });

    setShowScheduleModal(false);
    setSelectedGoal(null);
    setSelectedTimeSlot(null);
  };

  const getScheduledGoalsForTimeSlot = (slot: { hour: number; minutes: number }) => {
    return todaysGoals.filter(goal => {
      if (!goal.scheduledTime) return false;
      
      const startTime = new Date(goal.scheduledTime.start);
      const endTime = new Date(goal.scheduledTime.end);
      const slotTime = set(new Date(), { 
        hours: slot.hour, 
        minutes: slot.minutes 
      });
      
      return slotTime >= startTime && slotTime < endTime;
    });
  };

  const getGoalSpan = (goal: Goal) => {
    if (!goal.scheduledTime) return 1;
    
    const startTime = new Date(goal.scheduledTime.start);
    const endTime = new Date(goal.scheduledTime.end);
    const durationInMinutes = differenceInMinutes(endTime, startTime);
    return Math.ceil(durationInMinutes / 30);
  };

  const formatTimeSlot = (slot: { hour: number; minutes: number }) => {
    return format(
      set(new Date(), { hours: slot.hour, minutes: slot.minutes }), 
      'h:mm a'
    );
  };

  const isCurrentTimeSlot = (slot: { hour: number; minutes: number }) => {
    const now = new Date();
    return now.getHours() === slot.hour && 
           Math.floor(now.getMinutes() / 30) * 30 === slot.minutes;
  };

  const dragStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(dragPosition.x, { damping: 20, stiffness: 200 }) },
      { translateY: withSpring(dragPosition.y, { damping: 20, stiffness: 200 }) },
      { scale: withSpring(draggingGoal ? 1.05 : 1, { damping: 15 }) },
    ],
    zIndex: draggingGoal ? 1000 : 1,
    opacity: withSpring(draggingGoal ? 0.9 : 1),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.dateText}>{todayFormatted}</Text>
              <Text style={styles.title}>Today's Plan</Text>
            </View>
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={() => router.push('/calendar')}
            >
              <Calendar size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quoteOfTheDay.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quoteOfTheDay.author}</Text>
          </View>
          
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Daily Progress</Text>
              <Text style={[styles.progressLabel, { color }]}>
                {label}
              </Text>
            </View>
            <ProgressBar progress={progressToday} />
            <Text style={styles.progressPercentage}>
              {Math.round(progressToday * 100)}% Complete
            </Text>
          </View>
        </View>

        <View style={styles.unscheduledGoalsContainer}>
          {todaysGoals.filter(goal => !goal.scheduledTime).map(goal => (
            <View key={goal.id} style={styles.unscheduledGoal}>
              <GoalItem 
                goal={goal}
                onToggleComplete={(goalId) => {
                  if (goal.completed) {
                    uncompleteGoal(goalId);
                  } else {
                    completeGoal(goalId);
                  }
                }}
                onSetTimer={() => setTimerForGoal(goal.id)}
                showTimer
              />
            </View>
          ))}
        </View>
        
        <ScrollView 
          ref={scrollRef}
          style={styles.scrollContent}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scheduleContainer}>
            {TIME_SLOTS.map((slot, index) => {
              const scheduledGoals = getScheduledGoalsForTimeSlot(slot);
              const isCurrentSlot = isCurrentTimeSlot(slot);
              
              return (
                <View 
                  key={`${slot.hour}-${slot.minutes}`}
                  style={[
                    styles.timeSlotRow,
                    isCurrentSlot && styles.currentTimeSlot,
                    index === TIME_SLOTS.length - 1 && styles.lastSlot
                  ]}
                >
                  <View style={styles.timeLabel}>
                    {slot.minutes === 0 && (
                      <Text style={styles.timeText}>
                        {formatTimeSlot(slot)}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.timeSlotContent}>
                    {scheduledGoals.map(goal => {
                      const startTime = new Date(goal.scheduledTime!.start);
                      if (startTime.getHours() === slot.hour && 
                          startTime.getMinutes() === slot.minutes) {
                        const span = getGoalSpan(goal);
                        return (
                          <Animated.View 
                            key={goal.id}
                            style={[
                              styles.scheduledGoal,
                              { height: span * SLOT_HEIGHT - 8 },
                              goal.id === draggingGoal?.id && dragStyle
                            ]}
                          >
                            <TouchableOpacity
                              style={[styles.dragHandle, { height: span * SLOT_HEIGHT - 8 }]}
                              onPressIn={() => setDraggingGoal(goal)}
                            >
                              <GripVertical size={16} color={COLORS.neutral[400]} />
                            </TouchableOpacity>
                            <GoalItem 
                              goal={goal}
                              onToggleComplete={(goalId) => {
                                if (goal.completed) {
                                  uncompleteGoal(goalId);
                                } else {
                                  completeGoal(goalId);
                                }
                              }}
                              onSetTimer={() => setTimerForGoal(goal.id)}
                              showTimer
                            />
                          </Animated.View>
                        );
                      }
                      return null;
                    })}
                    
                    {!scheduledGoals.length && (
                      <TouchableOpacity
                        style={styles.dropZone}
                        onPress={() => {
                          const unscheduledGoal = todaysGoals.find(g => !g.scheduledTime);
                          if (unscheduledGoal) {
                            handleScheduleGoal(unscheduledGoal, slot);
                          }
                        }}
                      >
                        <View style={styles.dropZoneContent}>
                          <Clock size={16} color={COLORS.neutral[400]} />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        
        <Modal
          visible={showScheduleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Duration</Text>
              <Text style={styles.modalSubtitle}>
                How long will "{selectedGoal?.title}" take?
              </Text>

              <View style={styles.durationButtons}>
                {[0.5, 1, 1.5, 2, 2.5, 3].map(duration => (
                  <TouchableOpacity
                    key={duration}
                    style={styles.durationButton}
                    onPress={() => confirmSchedule(duration)}
                  >
                    <Text style={styles.durationButtonText}>
                      {duration} {duration === 1 ? 'hour' : 'hours'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowScheduleModal(false);
                  setSelectedGoal(null);
                  setSelectedTimeSlot(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        <FloatingActionButton 
          icon={<Plus size={24} color={COLORS.white} />}
          onPress={() => router.push('/modals/add-goal')}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginTop: 4,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 8,
  },
  progressCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 8,
    textAlign: 'right',
  },
  unscheduledGoalsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  unscheduledGoal: {
    marginBottom: 8,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  scheduleContainer: {
    backgroundColor: COLORS.neutral[50],
  },
  timeSlotRow: {
    flexDirection: 'row',
    height: SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  currentTimeSlot: {
    backgroundColor: COLORS.primary[50],
  },
  lastSlot: {
    borderBottomWidth: 0,
  },
  timeLabel: {
    width: 80,
    paddingRight: 12,
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingLeft: 20,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  timeSlotContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.neutral[200],
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 4,
    position: 'relative',
  },
  scheduledGoal: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'absolute',
    left: 12,
    right: 12,
  },
  dragHandle: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZone: {
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 24,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  durationButton: {
    width: '48%',
    backgroundColor: COLORS.primary[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
});