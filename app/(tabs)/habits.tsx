import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Flame, Calendar, Filter, Repeat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { HABIT_CATEGORIES } from '@/constants/gamification';
import FloatingActionButton from '@/components/FloatingActionButton';
import HabitCard from '@/components/HabitCard';
import HabitStreakCard from '@/components/HabitStreakCard';

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, habitEntries, toggleHabitCompletion, userProfile } = useContext(AppContext);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = habitEntries.filter(entry => entry.date === today);
  
  const filteredHabits = selectedCategory === 'all' 
    ? habits.filter(habit => habit.isActive)
    : habits.filter(habit => habit.isActive && habit.category === selectedCategory);
  
  const completedToday = todayEntries.filter(entry => entry.completed).length;
  const totalHabits = habits.filter(habit => habit.isActive).length;
  
  const currentStreak = userProfile?.streaks.current || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Keep it up! 🔥</Text>
            <Text style={styles.title}>Daily Habits</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => router.push('/calendar')}
          >
            <Calendar size={20} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
        
        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <View style={styles.progressCard}>
            <Text style={styles.progressNumber}>{completedToday}/{totalHabits}</Text>
            <Text style={styles.progressLabel}>Completed Today</Text>
          </View>
          
          <HabitStreakCard streak={currentStreak} />
        </View>
      </View>

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
            <Text style={styles.emptyStateText}>
              {selectedCategory === 'all' ? 'No habits yet' : 'No habits in this category'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Start building positive habits to improve your daily routine
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Habits' : `${HABIT_CATEGORIES.find(c => c.id === selectedCategory)?.name} Habits`} ({filteredHabits.length})
            </Text>
            
            {filteredHabits.map((habit, index) => {
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
            })}
          </>
        )}
      </ScrollView>
      
      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => router.push('/modals/add-habit')}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginTop: 2,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[700],
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 4,
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
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
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