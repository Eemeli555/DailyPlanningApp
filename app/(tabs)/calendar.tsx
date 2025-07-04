import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, parse, set } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, CircleCheck as CheckCircle, Circle, Calendar as CalendarIcon, ChartBar as BarChart3, Plus, Target, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import GoalItem from '@/components/GoalItem';
import { Goal } from '@/types';
import { getCompletionColorForProgress } from '@/utils/helpers';
import DailyScheduleOverview from '@/components/DailyScheduleOverview';
import EnhancedCalendarView from '@/components/EnhancedCalendarView';
import FutureDayPlanningModal from '@/components/FutureDayPlanningModal';

type CalendarView = 'calendar' | 'planner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth > 768;

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    dailyPlans, 
    updateGoalSchedule, 
    journalEntries, 
    sleepData, 
    socialMediaData, 
    habits, 
    habitEntries,
    getDailyEntry,
    getDailyPlan
  } = useContext(AppContext);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('calendar');
  const [showPlanningModal, setShowPlanningModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const getDayData = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dailyEntry = getDailyEntry(dateString);
    const dailyPlan = getDailyPlan(dateString);
    
    return {
      hasEntry: !!dailyEntry,
      hasPlan: !!dailyPlan,
      mood: dailyEntry?.mood,
      activities: dailyPlan?.schedule?.length || 0
    };
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (calendarView === 'planner') {
      // Open planning modal for future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      if (date >= today) {
        setShowPlanningModal(true);
      }
    }
  };

  const renderCalendarDay = (date: Date) => {
    const dayData = getDayData(date);
    const isSelected = isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isCurrentDay = isToday(date);

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.calendarDay,
          !isCurrentMonth && styles.calendarDayInactive,
          isSelected && styles.calendarDaySelected,
          isCurrentDay && styles.calendarDayToday,
        ]}
        onPress={() => handleDateSelect(date)}
      >
        <Text style={[
          styles.calendarDayText,
          !isCurrentMonth && styles.calendarDayTextInactive,
          isSelected && styles.calendarDayTextSelected,
          isCurrentDay && styles.calendarDayTextToday,
        ]}>
          {format(date, 'd')}
        </Text>
        
        {/* Activity indicators */}
        <View style={styles.dayIndicators}>
          {dayData.hasEntry && (
            <View style={[
              styles.dayIndicator,
              { backgroundColor: dayData.mood ? getCompletionColorForProgress(dayData.mood * 10) : COLORS.primary }
            ]} />
          )}
          {dayData.hasPlan && (
            <View style={[styles.dayIndicator, { backgroundColor: COLORS.accent }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Get the daily plan for the selected date
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const todaysPlan = getDailyPlan(selectedDateString);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Text style={styles.headerSubtitle}>Plan and track your progress</Text>
        </View>
        
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              calendarView === 'calendar' && styles.viewToggleButtonActive
            ]}
            onPress={() => setCalendarView('calendar')}
          >
            <CalendarIcon size={16} color={calendarView === 'calendar' ? COLORS.white : COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              calendarView === 'planner' && styles.viewToggleButtonActive
            ]}
            onPress={() => setCalendarView('planner')}
          >
            <BarChart3 size={16} color={calendarView === 'planner' ? COLORS.white : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {calendarView === 'calendar' ? (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <Text style={styles.monthTitle}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {/* Day headers */}
            <View style={styles.calendarWeekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar days */}
            <View style={styles.calendarGrid}>
              {calendarDays.map(renderCalendarDay)}
            </View>
          </View>

          {/* Selected Date Details */}
          <Animated.View entering={FadeInDown} style={styles.selectedDateSection}>
            <Text style={styles.selectedDateTitle}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
            
            <DailyScheduleOverview 
              date={selectedDate}
              goals={todaysPlan?.goals || []}
            />
          </Animated.View>
        </ScrollView>
      ) : (
        <EnhancedCalendarView 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onPlanDay={() => setShowPlanningModal(true)}
        />
      )}

      {/* Future Day Planning Modal */}
      <FutureDayPlanningModal
        visible={showPlanningModal}
        date={selectedDate}
        onClose={() => setShowPlanningModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  calendar: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  calendarDayToday: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  calendarDayTextInactive: {
    color: COLORS.textSecondary,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  calendarDayTextToday: {
    color: COLORS.white,
    fontWeight: '600',
  },
  dayIndicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
  },
  dayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDateSection: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
});