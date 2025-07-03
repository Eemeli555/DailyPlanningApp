import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Plus, Calendar, CircleCheck as CheckCircle2, Clock, Star, Zap, Trophy, Target, Repeat, Smartphone, CalendarPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { Goal } from '@/types';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';
import GoalItem from '@/components/GoalItem';
import ProgressBar from '@/components/ProgressBar';
import FloatingActionButton from '@/components/FloatingActionButton';
import DailyScheduleOverview from '@/components/DailyScheduleOverview';
import ScheduleGoalModal from '@/components/ScheduleGoalModal';
import CreateChoiceModal from '@/components/CreateChoiceModal';
import HabitCard from '@/components/HabitCard';
import { getCompletionStatus } from '@/utils/helpers';
import { calculateHabitStreak } from '@I'll implement the future day planning feature and improve the scheduling functionality. This will include:

1. **Future Day Planning**: Allow users to add tasks and activities to future dates
2. **Enhanced Scheduling**: Improved scheduling modal with time selection during task creation
3. **Better Calendar Integration**: Enhanced calendar view for planning future days
4. **Automatic Habit Addition**: Habits will be automatically added to future days

Let me start by creating the enhanced scheduling components:

<boltArtifact id="future-day-planning" title="Future Day Planning and Enhanced Scheduling">