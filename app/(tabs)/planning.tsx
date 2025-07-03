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
import TaskItem from '@/components/TaskItem';
import ProductiveActivityCard from '@/components/ProductiveActivityCard';
import CreateChoiceModal from '@/components/CreateChoiceModal';
import FutureDayPlannerModal from '@/components/FutureDayPlannerModal';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isTablet = screenWidth > 768;

type PlanningView = 'overview' | 'habits' | 'goals' | 'workouts' | 'activities';

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
  const [showFuturePlannerModal, setShowFuturePlannerModal] = useState(false);
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
      <TouchableOpacity 
        style={styles.futurePlanningButton}
        onPress={() => setShowFuturePlannerModal(true)}
      >
        <Calendar size={20} color={COLORS.white} />
        <Text style={styles.futurePlanningText}>Plan Future Days</Text>
      </TouchableOpacity>

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
              {longTermGoals.length + goalsLibrary.length} total
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
          
          <TouchableOpacity 
            style={[styles.quickAccessCard, isSmallScreen && styles.quickAccessCardSmall]}
            onPress={() => setCurrentView('workouts')}
          >
            <Dumbbell size={isSmallScreen ? 28 : 32} color={COLORS.secondary[600]} />
            <Text style={[styles.quickAccessTitle, isSmallScreen && styles.quickAccessTitleSmall]}>
              Workouts
            </Text>
            <Text style={[styles.quickAccessSubtitle, isSmallScreen && styles.quickAccessSubtitleSmall]}>
              {workouts.length} saved
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

        {/* Tasks & Goals Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Recent Tasks & Goals</Text>
            <TouchableOpacity onPress={() => setCurrentView('goals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Daily Tasks Preview */}
          {goalsLibrary.slice(0, 2).map((goal) => (
            <View key={goal.id} style={styles.miniGoalItem}>
              <View style={[styles.goalDot, { backgroundColor: COLORS.primary[500] }]} />
              <View style={styles.miniGoalContent}>
                <Text style={styles.miniGoalText}>{goal.title}</Text>
                <Text style={styles.miniGoalType}>Daily Task</Text>
              </View>
            </View>
          ))}

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
                  selectedCategory === category.id && styles.selectedCategoryChip
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.selectedCategoryChipText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity size={48} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No productive activities yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create reusable activities to quickly add to your daily plan
              </Text>
            </View>
          ) : (
            filteredActivities.map((activity, index) => (
              <Animated.View
                key={activity.id}
                entering={FadeInDown.delay(index * 100).springify()}
              >
                <ProductiveActivityCard
                  activity={activity}
                  onAddToToday={() => addActivityToToday(activity.id)}
                  onEdit={() => handleEditActivity(activity.id)}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>
      </>
    );
  };

  const renderHabits = () => {
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
            
            {HABIT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.selectedCategoryChip
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.selectedCategoryChipText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Repeat size={48} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No habits yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start building positive habits to improve your daily routine
              </Text>
            </View>
          ) : (
            filteredHabits.map((habit, index) => {
              const todayEntry = todayEntries.find(entry => entry.habitId === habit.id);
              
              return (
                <Animated.View
                  key={habit.id}
                  entering={FadeInDown.delay(index * 100).springify()}
                >
                  <HabitCard
                    habit={habit}
                    entry={todayEntry}
                    onToggle={() => toggleHabitCompletion(habit.id, today)}
                    onEdit={() => router.push({
                      pathname: '/modals/edit-habit',
                      params: { habitId: habit.id }
                    })}
                  />
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </>
    );
  };

  const renderGoals = () => {
    const renderGoalViewSelector = () => (
      <View style={styles.goalViewSelector}>
        {[
          { id: 'all', label: 'All' },
          { id: 'daily', label: 'Daily Tasks' },
          { id: 'longterm', label: 'Long-term Goals' },
        ].map(({ id, label }) => (
          <TouchableOpacity
            key={id}
            style={[
              styles.goalViewTab,
              goalView === id && styles.activeGoalViewTab
            ]}
            onPress={() => setGoalView(id as any)}
          >
            <Text style={[
              styles.goalViewTabText,
              goalView === id && styles.activeGoalViewTabText
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    return (
      <>
        {renderGoalViewSelector()}
        
        {/* Category Filter for Long-term Goals */}
        {(goalView === 'longterm' || goalView === 'all') && (
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
              
              {GOAL_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.selectedCategoryChipText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Daily Tasks Section */}
          {(goalView === 'all' || goalView === 'daily') && (
            <>
              {goalView === 'all' && filteredDailyGoals.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Daily Tasks</Text>
                  <TouchableOpacity onPress={() => setGoalView('daily')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {goalView === 'daily' && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Daily Tasks ({filteredDailyGoals.length})
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Tasks for your daily planning
                  </Text>
                </View>
              )}

              {filteredDailyGoals.length === 0 && goalView === 'daily' ? (
                <View style={styles.emptyState}>
                  <ListTodo size={48} color={COLORS.neutral[400]} />
                  <Text style={styles.emptyStateText}>No daily tasks yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Create daily tasks to organize your day-to-day activities
                  </Text>
                </View>
              ) : (
                (goalView === 'daily' ? filteredDailyGoals : filteredDailyGoals.slice(0, 3)).map((goal, index) => (
                  <Animated.View
                    key={goal.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    style={styles.goalCard}
                  >
                    <TaskItem
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
            </>
          )}

          {/* Long-term Goals Section */}
          {(goalView === 'all' || goalView === 'longterm') && (
            <>
              {goalView === 'all' && filteredLongTermGoals.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Long-term Goals</Text>
                  <TouchableOpacity onPress={() => setGoalView('longterm')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
              )}

              {goalView === 'longterm' && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    Long-term Goals ({filteredLongTermGoals.length})
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Your bigger aspirations and projects
                  </Text>
                </View>
              )}

              {filteredLongTermGoals.length === 0 && goalView === 'longterm' ? (
                <View style={styles.emptyState}>
                  <Target size={48} color={COLORS.neutral[400]} />
                  <Text style={styles.emptyStateText}>No long-term goals yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Set meaningful long-term goals to work towards your aspirations
                  </Text>
                </View>
              ) : (
                (goalView === 'longterm' ? filteredLongTermGoals : filteredLongTermGoals.slice(0, 2)).map((goal, index) => (
                  <Animated.View
                    key={goal.id}
                    entering={FadeInDown.delay((goalView === 'all' ? filteredDailyGoals.length : 0) + index * 100).springify()}
                  >
                    <LongTermGoalCard
                      goal={goal}
                      onToggleSubtask={(subtaskId) => toggleSubtask(goal.id, subtaskId)}
                      onEdit={() => handleEditLongTermGoal(goal.id)}
                    />
                  </Animated.View>
                ))
              )}
            </>
          )}

          {/* Empty State for All Goals */}
          {goalView === 'all' && filteredDailyGoals.length === 0 && filteredLongTermGoals.length === 0 && (
            <View style={styles.emptyState}>
              <Target size={48} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No tasks or goals yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by creating your first task or goal to organize your aspirations
              </Text>
            </View>
          )}
        </ScrollView>
      </>
    );
  };

  const renderWorkouts = () => (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Dumbbell size={48} color={COLORS.neutral[400]} />
          <Text style={styles.emptyStateText}>No workouts yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create workout routines to stay fit and healthy
          </Text>
        </View>
      ) : (
        workouts.map((workout, index) => (
          <Animated.View
            key={workout.id}
            entering={FadeInDown.delay(index * 100).springify()}
            style={styles.workoutCard}
          >
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>{workout.name}</Text>
              <Text style={styles.workoutDuration}>{workout.duration}min</Text>
            </View>
            {workout.description && (
              <Text style={styles.workoutDescription}>{workout.description}</Text>
            )}
            <Text style={styles.workoutExercises}>
              {workout.exercises.length} exercises
            </Text>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );

  const getFloatingActionRoute = () => {
    switch (currentView) {
      case 'habits':
        return '/modals/add-habit';
      case 'goals':
        return null; // Show choice modal for goals
      case 'workouts':
        return '/modals/add-workout';
      case 'activities':
        return '/modals/add-productive-activity';
      default:
        return null; // Show choice modal for overview
    }
  };

  const handleFloatingActionPress = () => {
    const route = getFloatingActionRoute();
    if (route) {
      router.push(route as any);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning</Text>
        <Text style={styles.subtitle}>Organize your tasks, goals, habits & routines</Text>
        
        {/* View Selector */}
        <View style={styles.viewSelector}>
          {[
            { id: 'overview', label: 'Overview', icon: ListTodo },
            { id: 'habits', label: 'Habits', icon: Repeat },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'activities', label: 'Activities', icon: Activity },
            { id: 'workouts', label: 'Workouts', icon: Dumbbell },
          ].map(({ id, label, icon: Icon }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.viewTab,
                currentView === id && styles.activeViewTab
              ]}
              onPress={() => setCurrentView(id as PlanningView)}
            >
              <Icon 
                size={isSmallScreen ? 12 : 14} 
                color={currentView === id ? COLORS.white : COLORS.neutral[600]} 
              />
              <Text style={[
                styles.viewTabText,
                currentView === id && styles.activeViewTabText,
                isSmallScreen && styles.viewTabTextSmall
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search Bar */}
      {currentView !== 'overview' && (
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${currentView}...`}
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {currentView === 'overview' && renderOverview()}
      {currentView === 'habits' && renderHabits()}
      {currentView === 'goals' && renderGoals()}
      {currentView === 'activities' && renderActivities()}
      {currentView === 'workouts' && renderWorkouts()}
      
      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={handleFloatingActionPress}
      />

      <CreateChoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <FutureDayPlannerModal
        visible={showFuturePlannerModal}
        onClose={() => setShowFuturePlannerModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: isSmallScreen ? 26 : 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
    marginBottom: 16,
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 6 : 8,
    paddingHorizontal: isSmallScreen ? 2 : 4,
    borderRadius: 6,
    gap: 2,
  },
  activeViewTab: {
    backgroundColor: COLORS.primary[600],
  },
  viewTabText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  viewTabTextSmall: {
    fontSize: 9,
  },
  activeViewTabText: {
    color: COLORS.white,
  },
  searchContainer: {
    marginHorizontal: isSmallScreen ? 16 : 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: Platform.select({
      ios: 44,
      android: 48,
      default: 44,
    }),
    backgroundColor: COLORS.white,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: COLORS.neutral[800],
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  goalViewSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
    marginHorizontal: isSmallScreen ? 16 : 20,
    marginTop: 16,
    marginBottom: 8,
  },
  goalViewTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeGoalViewTab: {
    backgroundColor: COLORS.primary[600],
  },
  goalViewTabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  activeGoalViewTabText: {
    color: COLORS.white,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingBottom: 100,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  statsSectionSmall: {
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardSmall: {
    padding: 12,
    borderRadius: 10,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginTop: 8,
  },
  statNumberSmall: {
    fontSize: 18,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },
  statLabelSmall: {
    fontSize: 11,
  },
  futurePlanningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  futurePlanningText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAccessGridSmall: {
    gap: 8,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessCardSmall: {
    padding: 12,
    borderRadius: 10,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginTop: 8,
  },
  quickAccessTitleSmall: {
    fontSize: 13,
    marginTop: 6,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  quickAccessSubtitleSmall: {
    fontSize: 11,
  },
  recentSection: {
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  miniHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  habitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  miniHabitText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[500],
  },
  completedIcon: {
    fontSize: 16,
    color: COLORS.success[600],
  },
  miniActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  activityIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  miniActivityContent: {
    flex: 1,
  },
  miniActivityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
  },
  miniActivityCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textTransform: 'capitalize',
  },
  addToTodayButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  miniGoalContent: {
    flex: 1,
  },
  miniGoalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    marginBottom: 4,
  },
  miniGoalType: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginLeft: 8,
  },
  categoryFilter: {
    paddingVertical: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: isSmallScreen ? 16 : 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  selectedCategoryChipText: {
    color: COLORS.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[100],
  },
  deleteButton: {
    backgroundColor: COLORS.error[100],
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  deleteButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.error[700],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[600],
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  workoutCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  workoutDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  workoutDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  workoutExercises: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
  },
});