import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Target, Repeat, Dumbbell, ListTodo, Filter, Search, Activity, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { HABIT_CATEGORIES, GOAL_CATEGORIES } from '@/constants/gamification';
import FloatingActionButton from '@/components/FloatingActionButton';
import HabitCard from '@/components/HabitCard';
import LongTermGoalCard from '@/components/LongTermGoalCard';
import GoalItem from '@/components/GoalItem';
import ProductiveActivityCard from '@/components/ProductiveActivityCard';
import CreateChoiceModal from '@/components/CreateChoiceModal';
import FutureDayPlanningModal from '@/components/FutureDayPlanningModal';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth > 768;

type PlanningView = 'overview' | 'habits' | 'goals' | 'tasks' | 'workouts' | 'activities';

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    habits, 
    habitEntries, 
    longTermGoals, 
    goalsLibrary, 
    workouts,
    productiveActivities,
    toggleHabitCompletion,
    toggleSubtask,
    toggleAutomaticGoal,
    deleteGoal,
    completeGoal,
    uncompleteGoal,
    setTimerForGoal,
    updateGoalSchedule,
    addActivityToToday,
    updateProductiveActivity,
    deleteProductiveActivity
  } = useContext(AppContext);
  
  const [currentView, setCurrentView] = useState<PlanningView>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFuturePlanningModal, setShowFuturePlanningModal] = useState(false);
  const [goalView, setGoalView] = useState<'all' | 'daily' | 'longterm'>('all');
  
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = habitEntries.filter(entry => entry.date === today);
  
  const activeHabits = habits.filter(habit => habit.isActive);
  const inProgressGoals = longTermGoals.filter(goal => goal.status === 'in_progress');
  const completedHabitsToday = todayEntries.filter(entry => entry.completed).length;
  const activeActivities = productiveActivities.filter(activity => activity.isActive);

  // Filter goals based on search and category
  const filteredDailyGoals = goalsLibrary.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLongTermGoals = longTermGoals.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || goal.category === selectedCategory)
  );

  const filteredHabits = selectedCategory === 'all' 
    ? activeHabits.filter(habit => habit.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeHabits.filter(habit => 
        habit.category === selectedCategory && 
        habit.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredActivities = selectedCategory === 'all'
    ? activeActivities.filter(activity => activity.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeActivities.filter(activity =>
        activity.category === selectedCategory &&
        activity.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleEditDailyGoal = (goalId: string) => {
    router.push({
      pathname: '/modals/edit-goal',
      params: { goalId }
    });
  };

  const handleEditLongTermGoal = (goalId: string) => {
    router.push({
      pathname: '/modals/edit-long-term-goal',
      params: { goalId }
    });
  };

  const handleEditActivity = (activityId: string) => {
    router.push({
      pathname: '/modals/edit-productive-activity',
      params: { activityId }
    });
  };

  const renderOverview = () => (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Quick Stats */}
      <View style={[styles.statsSection, isSmallScreen && styles.statsSectionSmall]}>
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Target size={isSmallScreen ? 20 : 24} color={COLORS.primary[600]} />
          <Text style={[styles.statNumber, isSmallScreen && styles.statNumberSmall]}>
            {inProgressGoals.length}
          </Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Active Goals
          </Text>
        </View>
        
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Repeat size={isSmallScreen ? 20 : 24} color={COLORS.accent[600]} />
          <Text style={[styles.statNumber, isSmallScreen && styles.statNumberSmall]}>
            {completedHabitsToday}/{activeHabits.length}
          </Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Habits Today
          </Text>
        </View>
        
        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <Activity size={isSmallScreen ? 20 : 24} color={COLORS.warning[600]} />
          <Text style={[styles.statNumber, isSmallScreen && styles.statNumberSmall]}>
            {activeActivities.length}
          </Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Activities
          </Text>
        </View>

        <View style={[styles.statCard, isSmallScreen && styles.statCardSmall]}>
          <ListTodo size={isSmallScreen ? 20 : 24} color={COLORS.secondary[600]} />
          <Text style={[styles.statNumber, isSmallScreen && styles.statNumberSmall]}>
            {goalsLibrary.length}
          </Text>
          <Text style={[styles.statLabel, isSmallScreen && styles.statLabelSmall]}>
            Daily Tasks
          </Text>
        </View>
      </View>

      {/* Future Planning Button */}
      <View style={styles.futurePlanningSection}>
        <TouchableOpacity 
          style={styles.futurePlanningButton}
          onPress={() => setShowFuturePlanningModal(true)}
        >
          <Calendar size={24} color={COLORS.primary[600]} />
          <View style={styles.futurePlanningContent}>
            <Text style={styles.futurePlanningTitle}>Plan Future Days</Text>
            <Text style={styles.futurePlanningSubtitle}>
              Add tasks and activities to upcoming days
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={[styles.quickAccessGrid, isSmallScreen && styles.quickAccessGridSmall]}>
          <TouchableOpacity 
            style={[styles.quickAccessCard, isSmallScreen && styles.quickAccessCardSmall]}
            onPress={() => setCurrentView('habits')}
          >
            <Repeat size={isSmallScreen ? 28 : 32} color={COLORS.accent[600]} />
            <Text style={[styles.quickAccessTitle, isSmallScreen && styles.quickAccessTitleSmall]}>
              Habits
            </Text>
            <Text style={[styles.quickAccessSubtitle, isSmallScreen && styles.quickAccessSubtitleSmall]}>
              {activeHabits.length} active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAccessCard, isSmallScreen && styles.quickAccessCardSmall]}
            onPress={() => setCurrentView('goals')}
          >
            <Target size={isSmallScreen ? 28 : 32} color={COLORS.primary[600]} />
            <Text style={[styles.quickAccessTitle, isSmallScreen && styles.quickAccessTitleSmall]}>
              Goals
            </Text>
            <Text style={[styles.quickAccessSubtitle, isSmallScreen && styles.quickAccessSubtitleSmall]}>
              {longTermGoals.length} total
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAccessCard, isSmallScreen && styles.quickAccessCardSmall]}
            onPress={() => setCurrentView('tasks')}
          >
            <ListTodo size={isSmallScreen ? 28 : 32} color={COLORS.secondary[600]} />
            <Text style={[styles.quickAccessTitle, isSmallScreen && styles.quickAccessTitleSmall]}>
              Tasks
            </Text>
            <Text style={[styles.quickAccessSubtitle, isSmallScreen && styles.quickAccessSubtitleSmall]}>
              {goalsLibrary.length} daily
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickAccessCard, isSmallScreen && styles.quickAccessCardSmall]}
            onPress={() => setCurrentView('activities')}
          >
            <Activity size={isSmallScreen ? 28 : 32} color={COLORS.warning[600]} />
            <Text style={[styles.quickAccessTitle, isSmallScreen && styles.quickAccessTitleSmall]}>
              Activities
            </Text>
            <Text style={[styles.quickAccessSubtitle, isSmallScreen && styles.quickAccessSubtitleSmall]}>
              {activeActivities.length} saved
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {/* Today's Habits Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Today's Habits</Text>
            <TouchableOpacity onPress={() => setCurrentView('habits')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {activeHabits.slice(0, 3).map((habit) => {
            const todayEntry = todayEntries.find(entry => entry.habitId === habit.id);
            return (
              <View key={habit.id} style={styles.miniHabitItem}>
                <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
                <Text style={[
                  styles.miniHabitText,
                  todayEntry?.completed && styles.completedText
                ]}>
                  {habit.title}
                </Text>
                {todayEntry?.completed && (
                  <Text style={styles.completedIcon}>✓</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Productive Activities Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Productive Activities</Text>
            <TouchableOpacity onPress={() => setCurrentView('activities')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {activeActivities.slice(0, 3).map((activity) => (
            <View key={activity.id} style={styles.miniActivityItem}>
              <Text style={styles.activityIcon}>{activity.icon}</Text>
              <View style={styles.miniActivityContent}>
                <Text style={styles.miniActivityText}>{activity.name}</Text>
                <Text style={styles.miniActivityCategory}>{activity.category}</Text>
              </View>
              <TouchableOpacity
                style={styles.addToTodayButton}
                onPress={() => addActivityToToday(activity.id)}
              >
                <Plus size={14} color={COLORS.primary[600]} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Goals Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Recent Goals</Text>
            <TouchableOpacity onPress={() => setCurrentView('goals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Long-term Goals Preview */}
          {inProgressGoals.slice(0, 2).map((goal) => (
            <View key={goal.id} style={styles.miniGoalItem}>
              <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
              <View style={styles.miniGoalContent}>
                <Text style={styles.miniGoalText}>{goal.title}</Text>
                <View style={styles.miniProgressBar}>
                  <View 
                    style={[
                      styles.miniProgressFill, 
                      { 
                        width: `${goal.progress * 100}%`,
                        backgroundColor: goal.color 
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.progressText}>{Math.round(goal.progress * 100)}%</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderTasks = () => {
    return (
      <>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Daily Tasks ({filteredDailyGoals.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Tasks for your daily planning
            </Text>
          </View>

          {filteredDailyGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <ListTodo size={48} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No daily tasks yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create daily tasks to organize your day-to-day activities
              </Text>
            </View>
          ) : (
            filteredDailyGoals.map((goal, index) => (
              <Animated.View
                key={goal.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.goalCard}
              >
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
                  showTimer={false}
                  showSchedule={false}
                />
                
                <View style={styles.goalActions}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditDailyGoal(goal.id)}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => deleteGoal(goal.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </>
    );
  };

  const renderActivities = () => {
    const ACTIVITY_CATEGORIES = [
      { id: 'mind', name: 'Mind' },
      { id: 'body', name: 'Body' },
      { id: 'work', name: 'Work' },
      { id: 'creative', name: 'Creative' },
      { id: 'social', name: 'Social' },
      { id: 'other', name: 'Other' },
    ];

    return (
      <>
        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === 'all' && styles.selectedCategoryChipText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {ACTIVITY_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategoryI'll implement the future day planning feature and improve the scheduling functionality. This will include:

1. **Future Day Planning**: Allow users to add tasks and activities to future dates
2. **Enhanced Scheduling**: Improved scheduling modal with time selection during task creation
3. **Better Calendar Integration**: Enhanced calendar view for planning future days
4. **Automatic Habit Addition**: Habits will be automatically added to future days

Let me start by creating the enhanced scheduling components:

<boltArtifact id="future-day-planning" title="Future Day Planning and Enhanced Scheduling">