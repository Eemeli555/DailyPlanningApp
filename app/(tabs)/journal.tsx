import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Sunrise, Sunset, Edit, BookOpen, Moon, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { MOOD_LABELS } from '@/constants/gamification';
import FloatingActionButton from '@/components/FloatingActionButton';
import MoodChart from '@/components/MoodChart';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { journalEntries, userProfile } = useContext(AppContext);
  
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = journalEntries.find(entry => entry.date === today);
  
  const recentEntries = journalEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  
  const journalStreak = calculateJournalStreak();
  
  function calculateJournalStreak(): number {
    const entries = journalEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  const getMoodEmoji = (mood: number) => {
    const moodData = MOOD_LABELS.find(m => m.value === mood);
    return moodData?.emoji || '😐';
  };

  const getMoodLabel = (mood: number) => {
    const moodData = MOOD_LABELS.find(m => m.value === mood);
    return moodData?.label || 'Okay';
  };

  // Check if it's evening time (7 PM - 10 PM)
  const isEveningTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 19 && hour <= 22; // 7 PM to 10 PM
  };

  const shouldShowEveningQuiz = () => {
    return isEveningTime() && !todayEntry;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Reflect & Grow 📝</Text>
            <Text style={styles.title}>Journal</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => router.push('/calendar')}
          >
            <Calendar size={20} color={COLORS.primary[600]} />
          </TouchableOpacity>
        </View>
        
        {/* Today's Status */}
        <View style={styles.todaySection}>
          {todayEntry ? (
            <TouchableOpacity 
              style={styles.todayCard}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: today, mode: 'edit' }
              })}
            >
              <View style={styles.todayHeader}>
                <Text style={styles.todayTitle}>Today's Entry</Text>
                <Edit size={16} color={COLORS.primary[600]} />
              </View>
              <View style={styles.moodDisplay}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(todayEntry.mood)}</Text>
                <Text style={styles.moodText}>{getMoodLabel(todayEntry.mood)}</Text>
              </View>
              {todayEntry.reflection && (
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {todayEntry.reflection}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.promptCard}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: today, mode: 'create' }
              })}
            >
              <Sunrise size={24} color={COLORS.accent[600]} />
              <Text style={styles.promptTitle}>Start your day with reflection</Text>
              <Text style={styles.promptSubtitle}>How are you feeling today?</Text>
            </TouchableOpacity>
          )}
          
          {/* Streak Card */}
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>{journalStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Evening Quiz Prompt */}
        {shouldShowEveningQuiz() && (
          <Animated.View 
            entering={FadeInDown.springify()}
            style={styles.eveningQuizCard}
          >
            <View style={styles.eveningQuizHeader}>
              <Moon size={20} color={COLORS.secondary[600]} />
              <Text style={styles.eveningQuizTitle}>Evening Reflection</Text>
              <Clock size={16} color={COLORS.secondary[500]} />
            </View>
            <Text style={styles.eveningQuizSubtitle}>
              Take a moment to reflect on your day with our guided evening quiz
            </Text>
            <TouchableOpacity
              style={styles.eveningQuizButton}
              onPress={() => router.push({
                pathname: '/modals/evening-quiz',
                params: { date: today }
              })}
            >
              <Text style={styles.eveningQuizButtonText}>Start Evening Reflection</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood Chart */}
        {journalEntries.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Mood Trends</Text>
            <MoodChart entries={journalEntries.slice(-14)} />
          </View>
        )}

        {/* Recent Entries */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          
          {recentEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No journal entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start journaling to track your thoughts and mood over time
              </Text>
            </View>
          ) : (
            recentEntries.map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.delay(index * 100).springify()}
              >
                <TouchableOpacity
                  style={styles.entryCard}
                  onPress={() => router.push({
                    pathname: '/modals/journal-entry',
                    params: { date: entry.date, mode: 'view' }
                  })}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDate}>
                      <Text style={styles.entryDateText}>
                        {format(new Date(entry.date), 'MMM d')}
                      </Text>
                      <Text style={styles.entryDayText}>
                        {format(new Date(entry.date), 'EEEE')}
                      </Text>
                    </View>
                    
                    <View style={styles.entryMood}>
                      <Text style={styles.entryMoodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                      <Text style={styles.entryMoodLabel}>{getMoodLabel(entry.mood)}</Text>
                    </View>
                  </View>
                  
                  {entry.reflection && (
                    <Text style={styles.entryText} numberOfLines={3}>
                      {entry.reflection}
                    </Text>
                  )}
                  
                  {entry.gratitude && entry.gratitude.length > 0 && (
                    <View style={styles.gratitudeSection}>
                      <Text style={styles.gratitudeLabel}>Grateful for:</Text>
                      <Text style={styles.gratitudeText} numberOfLines={1}>
                        {entry.gratitude.join(', ')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
      
      <FloatingActionButton
        icon={<Plus size={24} color={COLORS.white} />}
        onPress={() => router.push({
          pathname: '/modals/journal-entry',
          params: { date: today, mode: 'create' }
        })}
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
  todaySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  todayCard: {
    flex: 1,
    backgroundColor: COLORS.accent[50],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent[500],
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.accent[700],
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.accent[700],
  },
  entryPreview: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.accent[600],
    lineHeight: 16,
  },
  promptCard: {
    flex: 1,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
    marginTop: 8,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    marginTop: 4,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  streakNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.warning[700],
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning[600],
    marginTop: 4,
  },
  eveningQuizCard: {
    backgroundColor: COLORS.secondary[50],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary[500],
  },
  eveningQuizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eveningQuizTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.secondary[700],
    marginLeft: 8,
    flex: 1,
  },
  eveningQuizSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.secondary[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  eveningQuizButton: {
    backgroundColor: COLORS.secondary[600],
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  eveningQuizButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  chartSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  entriesSection: {
    marginHorizontal: 20,
    marginTop: 24,
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
  entryCard: {
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
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    flex: 1,
  },
  entryDateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  entryDayText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  entryMood: {
    alignItems: 'center',
  },
  entryMoodEmoji: {
    fontSize: 24,
  },
  entryMoodLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  entryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    lineHeight: 20,
    marginBottom: 8,
  },
  gratitudeSection: {
    backgroundColor: COLORS.success[50],
    borderRadius: 8,
    padding: 8,
  },
  gratitudeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.success[700],
    marginBottom: 2,
  },
  gratitudeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.success[600],
  },
});