import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Clock, Dumbbell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyState}>
          <Dumbbell size={48} color={COLORS.neutral[400]} />
          <Text style={styles.emptyStateText}>
            No workouts yet
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first workout to get started
          </Text>
        </View>
      </ScrollView>

      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => router.push('/modals/add-workout')}
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 8,
    textAlign: 'center',
  },
});