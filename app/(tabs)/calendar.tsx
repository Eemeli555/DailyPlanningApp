import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parse, set } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, GripVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import GoalItem from '@/components/GoalItem';
import { Goal } from '@/types';
import { getCompletionColorForProgress } from '@/utils/helpers';

// Generate time slots for every 30 minutes
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { dailyPlans, updateGoalSchedule } = useContext(AppContext);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [draggingGoal, setDraggingGoal] = useState<Goal | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ hour: number; minutes: number } | null>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Get the goals for selected date
  const selectedDayPlan = dailyPlans.find(plan => 
    isSameDay(new Date(plan.date), selectedDate)
  );
  
  const getDateColor = (date: Date) => {
    const dayPlan = dailyPlans.find(plan => isSameDay(new Date(plan.date), date));
    
    if (!dayPlan) return 'transparent';
    
    return getCompletionColorForProgress(dayPlan.progress);
  };

  const handleScheduleGoal = (goal: Goal, slot: { hour: number; minutes: number }) => {
    setSelectedGoal(goal);
    setSelectedTimeSlot(slot);
    setShowScheduleModal(true);
  };

  const confirmSchedule = (duration: number) => {
    if (!selectedGoal || !selectedTimeSlot) return;

    const startTime = set(selectedDate, { 
      hours: selectedTimeSlot.hour, 
      minutes: selectedTimeSlot.minutes 
    });
    
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + duration * 60);

    updateGoalSchedule(selectedGoal.id, {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });

    setShowScheduleModal(false);
    setSelectedGoal(null);
    setSelectedTimeSlot(null);
  };

  const handleDragStart = (goal: Goal) => {
    setDraggingGoal(goal);
  };

  const handleDragOver = (slot: { hour: number; minutes: number }) => {
    setDragOverSlot(slot);
  };

  const handleDragEnd = () => {
    if (draggingGoal && dragOverSlot) {
      const currentEnd = new Date(draggingGoal.scheduledTime?.end || '');
      const currentStart = new Date(draggingGoal.scheduledTime?.start || '');
      const durationMinutes = (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60);

      const startTime = set(selectedDate, { 
        hours: dragOverSlot.hour, 
        minutes: dragOverSlot.minutes 
      });
      
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + durationMinutes);

      updateGoalSchedule(draggingGoal.id, {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      });
    }
    setDraggingGoal(null);
    setDragOverSlot(null);
  };

  const getScheduledGoalsForTimeSlot = (slot: { hour: number; minutes: number }) => {
    if (!selectedDayPlan?.goals) return [];
    
    return selectedDayPlan.goals.filter(goal => {
      if (!goal.scheduledTime) return false;
      
      const startTime = new Date(goal.scheduledTime.start);
      const endTime = new Date(goal.scheduledTime.end);
      const slotTime = set(selectedDate, { 
        hours: slot.hour, 
        minutes: slot.minutes 
      });
      
      return slotTime >= startTime && slotTime < endTime;
    });
  };

  const formatTimeSlot = (slot: { hour: number; minutes: number }) => {
    return format(
      set(new Date(), { hours: slot.hour, minutes: slot.minutes }), 
      'h:mm a'
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Track your daily progress</Text>
      </View>
      
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <ChevronLeft size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <ChevronRight size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysOfWeek}>
        {weekdays.map(day => (
          <Text key={day} style={styles.dayOfWeek}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.calendar}>
        {monthDays.map((day, i) => {
          const dateColor = getDateColor(day);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <TouchableOpacity
              key={day.toString()}
              style={[
                styles.calendarDay,
                isToday(day) && styles.today,
                isSelected && styles.selectedDay,
              ]}
              onPress={() => setSelectedDate(day)}
            >
              <View
                style={[
                  styles.dateCircle,
                  dateColor !== 'transparent' && { backgroundColor: dateColor },
                  isSelected && styles.selectedDateCircle,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !isSameMonth(day, currentMonth) && styles.outsideMonthText,
                    isToday(day) && styles.todayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {format(day, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.success[500] }]} />
          <Text style={styles.legendText}>Great (80-100%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.warning[500] }]} />
          <Text style={styles.legendText}>OK (50-80%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.error[500] }]} />
          <Text style={styles.legendText}>Poor (0-50%)</Text>
        </View>
      </View>
      
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateTitle}>
          {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        
        <ScrollView
          style={styles.scheduleScrollView}
          contentContainerStyle={styles.scheduleContent}
          showsVerticalScrollIndicator={false}
        >
          {TIME_SLOTS.map((slot, index) => {
            const scheduledGoals = getScheduledGoalsForTimeSlot(slot);
            const isDropTarget = dragOverSlot?.hour === slot.hour && 
                               dragOverSlot?.minutes === slot.minutes;
            const showTime = slot.minutes === 0 || scheduledGoals.length > 0;
            
            return (
              <View 
                key={`${slot.hour}-${slot.minutes}`}
                style={[
                  styles.timeSlotRow,
                  isDropTarget && styles.dropTarget
                ]}
                onStartShouldSetResponder={() => true}
                onResponderMove={() => handleDragOver(slot)}
              >
                {showTime && (
                  <View style={styles.timeLabel}>
                    <Text style={styles.timeText}>
                      {formatTimeSlot(slot)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.timeSlotContent}>
                  {scheduledGoals.map(goal => (
                    <Animated.View 
                      key={goal.id} 
                      style={[
                        styles.scheduledGoal,
                        draggingGoal?.id === goal.id && styles.dragging
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.dragHandle}
                        onPressIn={() => handleDragStart(goal)}
                        onPressOut={handleDragEnd}
                      >
                        <GripVertical size={16} color={COLORS.neutral[400]} />
                      </TouchableOpacity>
                      <GoalItem goal={goal} disabled />
                    </Animated.View>
                  ))}
                  
                  {selectedDayPlan?.goals.map(goal => (
                    !goal.scheduledTime && (
                      <TouchableOpacity
                        key={goal.id}
                        style={styles.scheduleButton}
                        onPress={() => handleScheduleGoal(goal, slot)}
                      >
                        <Clock size={16} color={COLORS.primary[600]} />
                        <Text style={styles.scheduleButtonText}>
                          Schedule "{goal.title}"
                        </Text>
                      </TouchableOpacity>
                    )
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

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
              onPress={() => setShowScheduleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  dayOfWeek: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  calendarDay: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[800],
  },
  outsideMonthText: {
    color: COLORS.neutral[400],
  },
  today: {
    // Handled by dateCircle and todayText
  },
  todayText: {
    fontFamily: 'Inter-SemiBold',
  },
  selectedDay: {
    // Handled by selectedDateCircle
  },
  selectedDateCircle: {
    borderWidth: 2,
    borderColor: COLORS.primary[600],
  },
  selectedDayText: {
    fontFamily: 'Inter-SemiBold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  selectedDateContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  scheduleScrollView: {
    flex: 1,
  },
  scheduleContent: {
    paddingBottom: 24,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 30,
    marginBottom: 4,
  },
  timeLabel: {
    width: 80,
    paddingRight: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 4,
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
  },
  scheduledGoal: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    top: 0,
  },
  dragHandle: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  dragging: {
    opacity: 0.5,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  dropTarget: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
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