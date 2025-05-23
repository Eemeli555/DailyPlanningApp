import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Search, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';
import FloatingActionButton from '@/components/FloatingActionButton';
import Checkbox from '@/components/Checkbox';
import { Goal } from '@/types';

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { goalsLibrary, toggleAutomaticGoal, deleteGoal } = useContext(AppContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredGoals = goalsLibrary.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditGoal = (goal: Goal) => {
    router.push({
      pathname: '/modals/edit-goal',
      params: { goalId: goal.id }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Goals Library</Text>
        <Text style={styles.subtitle}>Manage your goals collection</Text>
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
      
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {goalsLibrary.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Your goals library is empty
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add goals to your library that you can reuse in your daily plans
            </Text>
            <Button 
              title="Add First Goal" 
              onPress={() => router.push('/modals/add-goal')}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Your Goals ({filteredGoals.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                Automatic goals repeat daily
              </Text>
            </View>
            
            {filteredGoals.length === 0 ? (
              <Text style={styles.noResultsText}>No goals match your search</Text>
            ) : (
              filteredGoals.map((goal, index) => (
                <Animated.View
                  key={goal.id}
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={styles.goalCard}
                >
                  <View style={styles.goalContent}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    {goal.description ? (
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    ) : null}
                  </View>
                  
                  <View style={styles.goalActions}>
                    <View style={styles.automaticContainer}>
                      <Checkbox
                        checked={goal.isAutomatic}
                        onPress={() => toggleAutomaticGoal(goal.id)}
                      />
                      <Text style={styles.automaticText}>Auto</Text>
                    </View>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditGoal(goal)}
                      >
                        <Edit size={16} color={COLORS.neutral[600]} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => deleteGoal(goal.id)}
                      >
                        <Trash2 size={16} color={COLORS.error[600]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </>
        )}
      </ScrollView>
      
      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => router.push('/modals/add-goal')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
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
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: 24,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  goalContent: {
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  automaticContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  automaticText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});