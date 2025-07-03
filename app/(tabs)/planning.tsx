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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Productive Activities ({filteredActivities.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Activities to boost your productivity
            </Text>
          </View>

          {filteredActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity size={48} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No activities found</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedCategory === 'all' 
                  ? 'Create productive activities to enhance your daily routine'
                  : `No activities in the ${ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory)?.name} category`
                }
              </Text>
            </View>
          ) : (
            filteredActivities.map((activity, index) => (
              <Animated.View
                key={activity.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.activityCard}
              >
                <ProductiveActivityCard
                  activity={activity}
                  onAddToToday={() => addActivityToToday(activity.id)}
                  onEdit={() => handleEditActivity(activity.id)}
                  onUpdate={(updates) => updateProductiveActivity(activity.id, updates)}
                  onDelete={() => deleteProductiveActivity(activity.id)}
                />
              </Animated.View>
            ))
          )}
        </ScrollView>
      </>
    );
  };

  const renderHabits = () => (
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Habits ({filteredHabits.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Build consistency with daily habits
          </Text>
        </View>

        {filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Repeat size={48} color={COLORS.neutral[400]} />
            <Text style={styles.emptyStateText}>No habits found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedCategory === 'all' 
                ? 'Create habits to build positive routines'
                : `No habits in the ${HABIT_CATEGORIES.find(c => c.id === selectedCategory)?.name} category`
              }
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit, index) => {
            const todayEntry = todayEntries.find(entry => entry.habitId === habit.id);
            return (
              <Animated.View
                key={habit.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.habitCard}
              >
                <HabitCard
                  habit={habit}
                  isCompleted={todayEntry?.completed || false}
                  onToggle={() => toggleHabitCompletion(habit.id)}
                  showStreak={true}
                />
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </>
  );

  const renderGoals = () => (
    <>
      {/* Goal Type Filter */}
      <View style={styles.goalTypeFilter}>
        <TouchableOpacity
          style={[
            styles.goalTypeChip,
            goalView === 'all' && styles.selectedGoalTypeChip
          ]}
          onPress={() => setGoalView('all')}
        >
          <Text style={[
            styles.goalTypeChipText,
            goalView === 'all' && styles.selectedGoalTypeChipText
          ]}>
            All Goals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.goalTypeChip,
            goalView === 'daily' && styles.selectedGoalTypeChip
          ]}
          onPress={() => setGoalView('daily')}
        >
          <Text style={[
            styles.goalTypeChipText,
            goalView === 'daily' && styles.selectedGoalTypeChipText
          ]}>
            Daily Tasks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.goalTypeChip,
            goalView === 'longterm' && styles.selectedGoalTypeChip
          ]}
          onPress={() => setGoalView('longterm')}
        >
          <Text style={[
            styles.goalTypeChipText,
            goalView === 'longterm' && styles.selectedGoalTypeChipText
          ]}>
            Long-term Goals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter for Long-term Goals */}
      {goalView === 'longterm' && (
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
        {/* Daily Tasks */}
        {(goalView === 'all' || goalView === 'daily') && (
          <>
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
          </>
        )}

        {/* Long-term Goals */}
        {(goalView === 'all' || goalView === 'longterm') && (
          <>
            <View style={[styles.sectionHeader, goalView === 'all' && { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>
                Long-term Goals ({filteredLongTermGoals.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Your bigger aspirations and projects
              </Text>
            </View>

            {filteredLongTermGoals.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={48} color={COLORS.neutral[400]} />
                <Text style={styles.emptyStateText}>No long-term goals found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {selectedCategory === 'all' 
                    ? 'Create long-term goals to work towards bigger achievements'
                    : `No goals in the ${GOAL_CATEGORIES.find(c => c.id === selectedCategory)?.name} category`
                  }
                </Text>
              </View>
            ) : (
              filteredLongTermGoals.map((goal, index) => (
                <Animated.View
                  key={goal.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={styles.goalCard}
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
      </ScrollView>
    </>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'habits':
        return renderHabits();
      case 'goals':
        return renderGoals();
      case 'tasks':
        return renderTasks();
      case 'activities':
        return renderActivities();
      default:
        return renderOverview();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Planning</Text>
          <Text style={styles.headerSubtitle}>
            Organize your habits, goals, and activities
          </Text>
        </View>
      </View>

      {/* View Selector */}
      {currentView !== 'overview' && (
        <View style={styles.viewSelector}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.viewSelectorContent}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentView('overview')}
            >
              <Text style={styles.backButtonText}>← Overview</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewChip,
                currentView === 'habits' && styles.selectedViewChip
              ]}
              onPress={() => setCurrentView('habits')}
            >
              <Repeat size={16} color={currentView === 'habits' ? COLORS.white : COLORS.accent[600]} />
              <Text style={[
                styles.viewChipText,
                currentView === 'habits' && styles.selectedViewChipText
              ]}>
                Habits
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewChip,
                currentView === 'goals' && styles.selectedViewChip
              ]}
              onPress={() => setCurrentView('goals')}
            >
              <Target size={16} color={currentView === 'goals' ? COLORS.white : COLORS.primary[600]} />
              <Text style={[
                styles.viewChipText,
                currentView === 'goals' && styles.selectedViewChipText
              ]}>
                Goals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewChip,
                currentView === 'tasks' && styles.selectedViewChip
              ]}
              onPress={() => setCurrentView('tasks')}
            >
              <ListTodo size={16} color={currentView === 'tasks' ? COLORS.white : COLORS.secondary[600]} />
              <Text style={[
                styles.viewChipText,
                currentView === 'tasks' && styles.selectedViewChipText
              ]}>
                Tasks
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewChip,
                currentView === 'activities' && styles.selectedViewChip
              ]}
              onPress={() => setCurrentView('activities')}
            >
              <Activity size={16} color={currentView === 'activities' ? COLORS.white : COLORS.warning[600]} />
              <Text style={[
                styles.viewChipText,
                currentView === 'activities' && styles.selectedViewChipText
              ]}>
                Activities
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Search Bar */}
      {currentView !== 'overview' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={COLORS.neutral[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${currentView}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.neutral[400]}
            />
          </View>
        </View>
      )}

      {/* Content */}
      {renderContent()}

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setShowCreateModal(true)} />

      {/* Modals */}
      <CreateChoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <FutureDayPlanningModal
        visible={showFuturePlanningModal}
        onClose={() => setShowFuturePlanningModal(false)}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  viewSelector: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingVertical: 12,
  },
  viewSelectorContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 20,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  viewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 20,
    gap: 6,
  },
  selectedViewChip: {
    backgroundColor: COLORS.primary[600],
  },
  viewChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  selectedViewChipText: {
    color: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsSectionSmall: {
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardSmall: {
    padding: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginTop: 8,
    marginBottom: 4,
  },
  statNumberSmall: {
    fontSize: 20,
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  statLabelSmall: {
    fontSize: 11,
  },
  futurePlanningSection: {
    marginBottom: 24,
  },
  futurePlanningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  futurePlanningContent: {
    flex: 1,
  },
  futurePlanningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  futurePlanningSubtitle: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
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
    width: (screenWidth - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessCardSmall: {
    width: (screenWidth - 48) / 2,
    padding: 16,
    borderRadius: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginTop: 12,
    marginBottom: 4,
  },
  quickAccessTitleSmall: {
    fontSize: 14,
    marginTop: 8,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  quickAccessSubtitleSmall: {
    fontSize: 11,
  },
  recentSection: {
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  miniHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  habitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  miniHabitText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.neutral[500],
  },
  completedIcon: {
    fontSize: 14,
    color: COLORS.success[600],
  },
  miniActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  miniActivityContent: {
    flex: 1,
  },
  miniActivityText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[900],
  },
  miniActivityCategory: {
    fontSize: 12,
    color: COLORS.neutral[600],
    textTransform: 'capitalize',
  },
  addToTodayButton: {
    padding: 6,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
  },
  miniGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  goalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  miniGoalContent: {
    flex: 1,
  },
  miniGoalText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral[600],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryFilter: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingVertical: 12,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 20,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary[600],
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  selectedCategoryChipText: {
    color: COLORS.white,
  },
  goalTypeFilter: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  goalTypeChip: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedGoalTypeChip: {
    backgroundColor: COLORS.primary[600],
  },
  goalTypeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  selectedGoalTypeChipText: {
    color: COLORS.white,
  },
  habitCard: {
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityCard: {
    marginBottom: 12,
  },
  goalActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  deleteButton: {
    backgroundColor: COLORS.error[50],
  },
  deleteButtonText: {
    color: COLORS.error[600],
  },
});