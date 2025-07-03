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
import DailyPlannerTable from '@/components/DailyPlannerTable';
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
  I'll implement the future day planning feature and improve the scheduling functionality. This will include:

1. **Future Day Planning**: Allow users to add tasks and activities to future dates
2. **Enhanced Scheduling**: Improved scheduling modal with time selection during task creation
3. **Better Calendar Integration**: Enhanced calendar view for planning future days
4. **Automatic Habit Addition**: Habits will be automatically added to future days

Let me start by creating the enhanced scheduling components:

<boltArtifact id="future-day-planning" title="Future Day Planning and Enhanced Scheduling">