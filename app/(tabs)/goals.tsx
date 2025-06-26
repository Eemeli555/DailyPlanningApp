import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search, Target, ListTodo, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { GOAL_CATEGORIES } from '@/constants/gamification';
import FloatingActionButton from '@/components/FloatingActionButton';
import GoalItem from '@/components/GoalItem';
import LongTermGoalCard from '@/components/LongTermGoalCard';
import CreateChoiceModal from '@/components/CreateChoiceModal';

type GoalView = 'all' | 'daily' | 'longterm';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    goalsLibrary, 
    longTermGoals,
    toggleAutomaticGoal, 
    deleteGoal,
    toggleSubtask,
    completeGoal,
    uncompleteGoal,
    setTimerForGoal,
    updateGoalSchedule
  } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<GoalView>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const filteredDailyGoals = goalsLibrary.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || true) // Daily goals don't have categories yet
  );

  const filteredLongTermGoals = longTermGoals.filter(goal =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'all' || goal.category === selectedCategory)
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

  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      {[
        { id: 'all', label: 'All Goals', icon: Target },
        { id: 'daily', label: 'Daily Goals', icon: ListTodo },
        { id: 'longterm', label: 'Long-term', icon: Target },
      ].map(({ id, label, icon: Icon }) => (
        <TouchableOpacity
          key={id}
          style={[
            styles.viewTab,
            currentView === id && styles.activeViewTab
          ]}
          onPress={() => setCurrentView(id as GoalView)}
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
  );

  const renderCategoryFilter = () => (
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
  );

  const renderDailyGoals = () => (
    <>
      {filteredDailyGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <ListTodo size={48} color={COLORS.neutral[400]} />
          <Text style={styles.emptyStateText}>No daily goals yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create daily goals to organize your day-to-day tasks
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Daily Goals ({filteredDailyGoals.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Goals for your daily planning
            </Text>
          </View>
          
          {filteredDailyGoals.map((goal, index) => (
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
                onSchedule={() => {
                  // Handle scheduling if needed
                }}
                showTimer={false}
                showSchedule={false}
              />
              
              <View style={styles.goalActions}>
                <View style={styles.automaticContainer}>
                  <TouchableOpacity
                    style={[
                      styles.automaticButton,
                      goal.isAutomatic && styles.automaticButtonActive
                    ]}
                    onPress={() => toggleAutomaticGoal(goal.id)}
                  >
                    <Text style={[
                      styles.automaticText,
                      goal.isAutomatic && styles.automaticTextActive
                    ]}>
                      {goal.isAutomatic ? 'Auto-add enabled' : 'Enable auto-add'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
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
          ))}
        </>
      )}
    </>
  );

  const renderLongTermGoals = () => (
    <>
      {filteredLongTermGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Target size={48} color={COLORS.neutral[400]} />
          <Text style={styles.emptyStateText}>No long-term goals yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Set meaningful long-term goals to work towards your aspirations
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Long-term Goals ({filteredLongTermGoals.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Your bigger aspirations and projects
            </Text>
          </View>
          
          {filteredLongTermGoals.map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <LongTermGoalCard
                goal={goal}
                onToggleSubtask={(subtaskId) => toggleSubtask(goal.id, subtaskId)}
                onEdit={() => handleEditLongTermGoal(goal.id)}
              />
            </Animated.View>
          ))}
        </>
      )}
    </>
  );

  const renderAllGoals = () => (
    <>
      {/* Daily Goals Section */}
      {filteredDailyGoals.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Goals</Text>
            <TouchableOpacity onPress={() => setCurrentView('daily')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredDailyGoals.slice(0, 3).map((goal, index) => (
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
            </Animated.View>
          ))}
        </>
      )}

      {/* Long-term Goals Section */}
      {filteredLongTermGoals.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Long-term Goals</Text>
            <TouchableOpacity onPress={() => setCurrentView('longterm')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredLongTermGoals.slice(0, 2).map((goal, index) => (
            <Animated.View
              key={goal.id}
              entering={FadeInDown.delay((filteredDailyGoals.length + index) * 100).springify()}
            >
              <LongTermGoalCard
                goal={goal}
                onToggleSubtask={(subtaskId) => toggleSubtask(goal.id, subtaskId)}
                onEdit={() => handleEditLongTermGoal(goal.id)}
              />
            </Animated.View>
          ))}
        </>
      )}

      {/* Empty State for All */}
      {filteredDailyGoals.length === 0 && filteredLongTermGoals.length === 0 && (
        <View style={styles.emptyState}>
          <Target size={48} color={COLORS.neutral[400]} />
          <Text style={styles.emptyStateText}>No goals yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start by creating your first goal to organize your aspirations
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.subtitle}>Manage your daily tasks and long-term aspirations</Text>
        
        {renderViewSelector()}
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={18} color={COLORS.neutral[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search goals..."
          placeholderTextColor={COLORS.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {(currentView === 'longterm' || currentView === 'all') && renderCategoryFilter()}
      
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentView === 'all' && renderAllGoals()}
        {currentView === 'daily' && renderDailyGoals()}
        {currentView === 'longterm' && renderLongTermGoals()}
      </ScrollView>
      
      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => setShowCreateModal(true)}
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
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
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
  categoryFilter: {
    paddingVertical: 12,
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
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  automaticContainer: {
    flex: 1,
  },
  automaticButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  automaticButtonActive: {
    backgroundColor: COLORS.primary[100],
    borderColor: COLORS.primary[300],
  },
  automaticText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  automaticTextActive: {
    color: COLORS.primary[700],
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
});