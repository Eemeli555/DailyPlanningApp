import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Target, Repeat, Dumbbell, ListTodo, Filter, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { HABIT_CATEGORIES, GOAL_CATEGORIES } from '@/constants/gamification';
import FloatingActionButton from '@/components/FloatingActionButton';
import HabitCard from '@/components/HabitCard';
import LongTermGoalCard from '@/components/LongTermGoalCard';
import GoalItem from '@/components/GoalItem';
import CreateChoiceModal from '@/components/CreateChoiceModal';

type PlanningView = 'overview' | 'habits' | 'goals' | 'workouts';

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    habits, 
    habitEntries, 
    longTermGoals, 
    goalsLibrary, 
    workouts,
    toggleHabitCompletion,
    toggleSubtask,
    toggleAutomaticGoal,
    deleteGoal
  } = useContext(AppContext);
  
  const [currentView, setCurrentView] = useState<PlanningView>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = habitEntries.filter(entry => entry.date === today);
  
  const activeHabits = habits.filter(habit => habit.isActive);
  const inProgressGoals = longTermGoals.filter(goal => goal.status === 'in_progress');
  const completedHabitsToday = todayEntries.filter(entry => entry.completed).length;

  const renderOverview = () => (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Target size={24} color={COLORS.primary[600]} />
          <Text style={styles.statNumber}>{inProgressGoals.length}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        
        <View style={styles.statCard}>
          <Repeat size={24} color={COLORS.accent[600]} />
          <Text style={styles.statNumber}>{completedHabitsToday}/{activeHabits.length}</Text>
          <Text style={styles.statLabel}>Habits Today</Text>
        </View>
        
        <View style={styles.statCard}>
          <Dumbbell size={24} color={COLORS.warning[600]} />
          <Text style={styles.statNumber}>{workouts.length}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setCurrentView('habits')}
          >
            <Repeat size={32} color={COLORS.accent[600]} />
            <Text style={styles.quickAccessTitle}>Habits</Text>
            <Text style={styles.quickAccessSubtitle}>{activeHabits.length} active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setCurrentView('goals')}
          >
            <Target size={32} color={COLORS.primary[600]} />
            <Text style={styles.quickAccessTitle}>Goals</Text>
            <Text style={styles.quickAccessSubtitle}>{longTermGoals.length} total</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => setCurrentView('workouts')}
          >
            <Dumbbell size={32} color={COLORS.warning[600]} />
            <Text style={styles.quickAccessTitle}>Workouts</Text>
            <Text style={styles.quickAccessSubtitle}>{workouts.length} saved</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard}
            onPress={() => router.push('/(tabs)/goals')}
          >
            <ListTodo size={32} color={COLORS.secondary[600]} />
            <Text style={styles.quickAccessTitle}>Daily Goals</Text>
            <Text style={styles.quickAccessSubtitle}>Library</Text>
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

        {/* Goals Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Active Goals</Text>
            <TouchableOpacity onPress={() => setCurrentView('goals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {inProgressGoals.slice(0, 3).map((goal) => (
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

  const renderHabits = () => {
    const filteredHabits = selectedCategory === 'all' 
      ? activeHabits
      : activeHabits.filter(habit => habit.category === selectedCategory);

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
          contentContainerStyle={styles.content}
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

  const renderGoals = () => (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {longTermGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={48} color={COLORS.neutral[400]} />
          <Text style={styles.emptyStateText}>No long-term goals yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Set meaningful goals to work towards your aspirations
          </Text>
        </View>
      ) : (
        longTermGoals.map((goal, index) => (
          <Animated.View
            key={goal.id}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <LongTermGoalCard
              goal={goal}
              onToggleSubtask={(subtaskId) => toggleSubtask(goal.id, subtaskId)}
              onEdit={() => router.push({
                pathname: '/modals/edit-long-term-goal',
                params: { goalId: goal.id }
              })}
            />
          </Animated.View>
        ))
      )}
    </ScrollView>
  );

  const renderWorkouts = () => (
    <ScrollView
      style={styles.scrollContent}
      contentContainerStyle={styles.content}
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
        return '/modals/add-long-term-goal';
      case 'workouts':
        return '/modals/add-workout';
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
        <Text style={styles.subtitle}>Organize your goals, habits & routines</Text>
        
        {/* View Selector */}
        <View style={styles.viewSelector}>
          {[
            { id: 'overview', label: 'Overview', icon: ListTodo },
            { id: 'habits', label: 'Habits', icon: Repeat },
            { id: 'goals', label: 'Goals', icon: Target },
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
                size={16} 
                color={currentView === id ? COLORS.white : COLORS.neutral[600]} 
              />
              <Text style={[
                styles.viewTabText,
                currentView === id && styles.activeViewTabText
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {currentView === 'overview' && renderOverview()}
      {currentView === 'habits' && renderHabits()}
      {currentView === 'goals' && renderGoals()}
      {currentView === 'workouts' && renderWorkouts()}
      
      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={handleFloatingActionPress}
      />

      <CreateChoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
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
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
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
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  activeViewTab: {
    backgroundColor: COLORS.primary[600],
  },
  viewTabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  activeViewTabText: {
    color: COLORS.white,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
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
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  quickAccessTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginTop: 8,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
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
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginLeft: 8,
  },
  categoryFilter: {
    paddingVertical: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
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