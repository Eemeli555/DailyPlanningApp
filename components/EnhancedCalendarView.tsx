import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays, isToday, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, Target, Activity } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { getCompletionColorForProgress } from '@/utils/helpers';
import FutureDayPlanningModal from './FutureDayPlanningModal';

interface EnhancedCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onDayPress?: (date: Date) => void;
  onPlanDay?: (date: Date) => void;
}

const EnhancedCalendarView = ({ currentDate, onDateChange, onDayPress, onPlanDay }: EnhancedCalendarViewProps) => {
  const { 
    dailyPlans, 
    journalEntries, 
    sleepData, 
    habitEntries,
    habits,
    getDailyPlan
  } = useContext(AppContext);
  
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedPlanningDate, setSelectedPlanningDate] = useState<Date | null>(null);
  
  // Get the first day of the month and calculate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = subDays(monthStart, getDay(monthStart));
  const calendarEnd = addDays(monthEnd, 6 - getDay(monthEnd));
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Group days into weeks for the board layout
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const getDateData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPlan = getDailyPlan(dateStr);
    const dayJournal = journalEntries.find(journal => journal.date === dateStr);
    const daySleep = sleepData.find(sleep => sleep.date === dateStr);
    const dayHabits = habitEntries.filter(entry => entry.date === dateStr);
    
    return {
      plan: dayPlan,
      journal: dayJournal,
      sleep: daySleep,
      habits: dayHabits,
      hasData: !!(dayPlan || dayJournal || daySleep || dayHabits.length > 0)
    };
  };

  const getDateColor = (date: Date) => {
    const data = getDateData(date);
    
    if (!data.hasData) {
      return 'transparent';
    }
    
    if (data.plan) {
      // Filter out habit-goals when calculating progress color
      const realGoals = data.plan.goals.filter(goal => !goal.id.startsWith('habit-'));
      const realGoalsProgress = realGoals.length > 0 
        ? realGoals.filter(goal => goal.completed).length / realGoals.length 
        : 0;
      
      return getCompletionColorForProgress(realGoalsProgress);
    }
    
    // If no plan but has other data, show neutral color
    return COLORS.neutral[300];
  };

  const getTaskCount = (date: Date) => {
    const data = getDateData(date);
    if (!data.plan) return 0;
    
    // Count only real tasks, not habits
    return data.plan.goals.filter(goal => !goal.id.startsWith('habit-')).length;
  };

  const handleDayPress = (date: Date) => {
    if (onDayPress) {
      onDayPress(date);
    }
  };

  const handlePlanDay = (date: Date) => {
    if (onPlanDay) {
      onPlanDay(date);
    } else {
      setSelectedPlanningDate(date);
      setShowPlanningModal(true);
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <View style={styles.container}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <ChevronLeft size={24} color={COLORS.neutral[600]} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {format(currentDate, 'MMMM yyyy')}
          </Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <ChevronRight size={24} color={COLORS.neutral[600]} />
          </TouchableOpacity>
        </View>
        
        {/* Days of Week Header */}
        <View style={styles.daysOfWeek}>
          {weekdays.map(day => (
            <Text key={day} style={styles.dayOfWeek}>
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((day, dayIndex) => {
                const dateColor = getDateColor(day);
                const taskCount = getTaskCount(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const data = getDateData(day);
                
                return (
                  <View key={dayIndex} style={styles.dayContainer}>
                    <TouchableOpacity
                      style={[
                        styles.calendarDay,
                        isTodayDate && styles.today,
                        !isCurrentMonth && styles.outsideMonth,
                      ]}
                      onPress={() => handleDayPress(day)}
                    >
                      <View
                        style={[
                          styles.dateCircle,
                          dateColor !== 'transparent' && { backgroundColor: dateColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            !isCurrentMonth && styles.outsideMonthText,
                            isTodayDate && styles.todayText,
                          ]}
                        >
                          {format(day, 'd')}
                        </Text>
                      </View>
                      
                      {/* Task Count Indicator */}
                      {taskCount > 0 && (
                        <View style={styles.taskCountBadge}>
                          <Text style={styles.taskCountText}>{taskCount}</Text>
                        </View>
                      )}
                      
                      {/* Data Indicators */}
                      <View style={styles.dataIndicators}>
                        {data.journal && (
                          <View style={[styles.dataIndicator, { backgroundColor: COLORS.secondary[500] }]} />
                        )}
                        {data.sleep && (
                          <View style={[styles.dataIndicator, { backgroundColor: COLORS.accent[500] }]} />
                        )}
                        {data.habits.length > 0 && (
                          <View style={[styles.dataIndicator, { backgroundColor: COLORS.warning[500] }]} />
                        )}
                      </View>
                    </TouchableOpacity>
                    
                    {/* Plan Button for Future Days */}
                    {!isSameDay(day, new Date()) && isCurrentMonth && (
                      <TouchableOpacity
                        style={styles.planButton}
                        onPress={() => handlePlanDay(day)}
                      >
                        <Plus size={12} color={COLORS.primary[600]} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success[500] }]} />
              <Text style={styles.legendText}>High Progress</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning[500] }]} />
              <Text style={styles.legendText}>Medium Progress</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.error[500] }]} />
              <Text style={styles.legendText}>Low Progress</Text>
            </View>
          </View>
          
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: COLORS.secondary[500] }]} />
              <Text style={styles.legendText}>Journal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: COLORS.accent[500] }]} />
              <Text style={styles.legendText}>Sleep</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: COLORS.warning[500] }]} />
              <Text style={styles.legendText}>Habits</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Future Day Planning Modal */}
      <FutureDayPlanningModal
        visible={showPlanningModal}
        onClose={() => {
          setShowPlanningModal(false);
          setSelectedPlanningDate(null);
        }}
        initialDate={selectedPlanningDate || undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    marginBottom: 16,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  calendarDay: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  outsideMonth: {
    opacity: 0.3,
  },
  outsideMonthText: {
    color: COLORS.neutral[400],
  },
  today: {
    // Handled by dateCircle styling
  },
  todayText: {
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  taskCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary[600],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCountText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  dataIndicators: {
    position: 'absolute',
    bottom: -6,
    flexDirection: 'row',
    gap: 2,
  },
  dataIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  planButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[300],
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    paddingTop: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendIndicator: {
    width: 8,
    height: 4,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
});

export default EnhancedCalendarView;