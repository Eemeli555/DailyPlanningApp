import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns';
import { X, Calendar, Plus, Target, Repeat, Activity, Clock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { Goal, ProductiveActivity, Habit } from '@/types';
import Button from './Button';
import GoalItem from './GoalItem';
import ProductiveActivityCard from './ProductiveActivityCard';
import HabitCard from './HabitCard';

interface FutureDayPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

type PlanningMode = 'goals' | 'activities' | 'habits';

const FutureDayPlannerModal = ({ visible, onClose, initialDate }: FutureDayPlannerModalProps) => {
  const { 
    goalsLibrary, 
    productiveActivities, 
    habits,
    addGoalToFutureDay,
    addActivityToFutureDay,
    getDailyPlan,
    createDailyPlan,
    updateGoalSchedule
  } = useContext(AppContext);

  const [selectedDate, setSelectedDate] = useState(initialDate || addDays(new Date(), 1));
  const [planningMode, setPlanningMode] = useState<PlanningMode>('goals');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDate(initialDate || addDays(new Date(), 1));
      setSearchQuery('');
    }
  }, [visible, initialDate]);

  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const existingPlan = getDailyPlan(selectedDateStr);

  // Filter items based on search
  const filteredGoals = goalsLibrary.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredActivities = productiveActivities.filter(activity => 
    activity.isActive && (
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const activeHabits = habits.filter(habit => habit.isActive);

  const handleAddGoal = (goal: Goal) => {
    addGoalToFutureDay(selectedDateStr, goal.id);
    Alert.alert('Success', `"${goal.title}" added to ${format(selectedDate, 'MMM d, yyyy')}`);
  };

  const handleAddActivity = (activity: ProductiveActivity) => {
    addActivityToFutureDay(selectedDateStr, activity.id);
    Alert.alert('Success', `"${activity.name}" added to ${format(selectedDate, 'MMM d, yyyy')}`);
  };

  const goToPreviousWeek = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const goToNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };

  const renderDatePicker = () => (
    <View style={styles.datePickerContainer}>
      <View style={styles.weekNavigation}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.weekNavButton}>
          <ChevronLeft size={20} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        
        <Text style={styles.weekTitle}>
          {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d, yyyy')}
        </Text>
        
        <TouchableOpacity onPress={goToNextWeek} style={styles.weekNavButton}>
          <ChevronRight size={20} color={COLORS.neutral[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isPast = isBefore(day, new Date()) && !isToday(day);
          const dayPlan = getDailyPlan(format(day, 'yyyy-MM-dd'));
          
          return (
            <TouchableOpacity
              key={day.toString()}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton,
                isPast && styles.pastDayButton,
              ]}
              onPress={() => !isPast && setSelectedDate(day)}
              disabled={isPast}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedDayText,
                isPast && styles.pastDayText,
              ]}>
                {format(day, 'EEE')}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedDayText,
                isPast && styles.pastDayText,
              ]}>
                {format(day, 'd')}
              </Text>
              {dayPlan && (
                <View style={[
                  styles.planIndicator,
                  { backgroundColor: isSelected ? COLORS.white : COLORS.primary[500] }
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          planningMode === 'goals' && styles.activeModeButton
        ]}
        onPress={() => setPlanningMode('goals')}
      >
        <Target size={16} color={planningMode === 'goals' ? COLORS.white : COLORS.neutral[600]} />
        <Text style={[
          styles.modeButtonText,
          planningMode === 'goals' && styles.activeModeButtonText
        ]}>
          Goals
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          planningMode === 'activities' && styles.activeModeButton
        ]}
        onPress={() => setPlanningMode('activities')}
      >
        <Activity size={16} color={planningMode === 'activities' ? COLORS.white : COLORS.neutral[600]} />
        <Text style={[
          styles.modeButtonText,
          planningMode === 'activities' && styles.activeModeButtonText
        ]}>
          Activities
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          planningMode === 'habits' && styles.activeModeButton
        ]}
        onPress={() => setPlanningMode('habits')}
      >
        <Repeat size={16} color={planningMode === 'habits' ? COLORS.white : COLORS.neutral[600]} />
        <Text style={[
          styles.modeButtonText,
          planningMode === 'habits' && styles.activeModeButtonText
        ]}>
          Habits
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (planningMode) {
      case 'goals':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>
              Add Goals to {format(selectedDate, 'EEEE, MMM d')}
            </Text>
            <Text style={styles.contentSubtitle}>
              Select goals from your library to add to this day
            </Text>
            
            {filteredGoals.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={48} color={COLORS.neutral[400]} />
                <Text style={styles.emptyStateText}>No goals available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create some goals in the Planning tab first
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {filteredGoals.map((goal, index) => (
                  <Animated.View
                    key={goal.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    style={styles.itemContainer}
                  >
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{goal.title}</Text>
                      {goal.description && (
                        <Text style={styles.itemDescription}>{goal.description}</Text>
                      )}
                      {goal.isAutomatic && (
                        <View style={styles.automaticBadge}>
                          <Text style={styles.automaticBadgeText}>Automatic</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddGoal(goal)}
                    >
                      <Plus size={20} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            )}
          </View>
        );

      case 'activities':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>
              Add Activities to {format(selectedDate, 'EEEE, MMM d')}
            </Text>
            <Text style={styles.contentSubtitle}>
              Select productive activities to schedule for this day
            </Text>
            
            {filteredActivities.length === 0 ? (
              <View style={styles.emptyState}>
                <Activity size={48} color={COLORS.neutral[400]} />
                <Text style={styles.emptyStateText}>No activities available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create some activities in the Planning tab first
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {filteredActivities.map((activity, index) => (
                  <Animated.View
                    key={activity.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    style={styles.itemContainer}
                  >
                    <View style={styles.itemContent}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.activityIcon}>{activity.icon}</Text>
                        <View style={styles.activityInfo}>
                          <Text style={styles.itemTitle}>{activity.name}</Text>
                          <Text style={styles.activityCategory}>{activity.category}</Text>
                        </View>
                      </View>
                      {activity.description && (
                        <Text style={styles.itemDescription}>{activity.description}</Text>
                      )}
                      {activity.estimatedDuration && (
                        <View style={styles.durationContainer}>
                          <Clock size={12} color={COLORS.neutral[500]} />
                          <Text style={styles.durationText}>
                            {activity.estimatedDuration} min
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddActivity(activity)}
                    >
                      <Plus size={20} color={COLORS.primary[600]} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            )}
          </View>
        );

      case 'habits':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>
              Habits for {format(selectedDate, 'EEEE, MMM d')}
            </Text>
            <Text style={styles.contentSubtitle}>
              Active habits will be automatically added to all future days
            </Text>
            
            {activeHabits.length === 0 ? (
              <View style={styles.emptyState}>
                <Repeat size={48} color={COLORS.neutral[400]} />
                <Text style={styles.emptyStateText}>No active habits</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create some habits in the Planning tab first
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
                {activeHabits.map((habit, index) => (
                  <Animated.View
                    key={habit.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    style={styles.habitContainer}
                  >
                    <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitTitle}>{habit.title}</Text>
                      {habit.description && (
                        <Text style={styles.habitDescription}>{habit.description}</Text>
                      )}
                      <Text style={styles.habitNote}>
                        Will be automatically added to this day
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </ScrollView>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Plan Future Days</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.neutral[600]} />
          </TouchableOpacity>
        </View>

        {renderDatePicker()}
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${planningMode}...`}
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {renderModeSelector()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
  },
  closeButton: {
    padding: 4,
  },
  datePickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekNavButton: {
    padding: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 44,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary[600],
  },
  pastDayButton: {
    opacity: 0.5,
  },
  dayName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  selectedDayText: {
    color: COLORS.white,
  },
  pastDayText: {
    color: COLORS.neutral[400],
  },
  planIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  activeModeButton: {
    backgroundColor: COLORS.primary[600],
  },
  modeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  activeModeButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 20,
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  automaticBadge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  automaticBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textTransform: 'capitalize',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  habitNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.accent[600],
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[600],
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FutureDayPlannerModal;