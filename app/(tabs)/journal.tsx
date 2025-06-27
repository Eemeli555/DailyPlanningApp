import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Sunrise, Sunset, CreditCard as Edit, BookOpen, Moon, Clock, Sun } from 'lucide-react-native';
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
  const todayMorningEntry = journalEntries.find(entry => entry.date === today && entry.type === 'morning');
  const todayEveningEntry = journalEntries.find(entry => entry.date === today && entry.type === 'evening');
  
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

  // Check if it's morning time (6 AM - 10 AM)
  const isMorningTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour <= 10;
  };

  // Check if it's evening time (7 PM - 10 PM)
  const isEveningTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 19 && hour <= 22;
  };

  const shouldShowMorningQuiz = () => {
    return isMorningTime() && !todayMorningEntry;
  };

  const shouldShowEveningQuiz = () => {
    return isEveningTime() && !todayEveningEntry;
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
          {/* Morning Entry */}
          {todayMorningEntry ? (
            <TouchableOpacity 
              style={styles.entryCard}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: today, mode: 'edit' }
              })}
            >
              <View style={styles.entryHeader}>
                <Sun size={16} color={COLORS.warning[600]} />
                <Text style={styles.entryTitle}>Morning Entry</Text>
                <Edit size={14} color={COLORS.primary[600]} />
              </View>
              {todayMorningEntry.mainFocus && (
                <Text style={styles.entryPreview} numberOfLines={1}>
                  Focus: {todayMorningEntry.mainFocus}
                </Text>
              )}
              {todayMorningEntry.sleepHours && (
                <Text style={styles.entryMeta}>
                  {todayMorningEntry.sleepHours}h sleep • Quality: {todayMorningEntry.sleepQuality}/10
                </Text>
              )}
            </TouchableOpacity>
          ) : shouldShowMorningQuiz() ? (
            <TouchableOpacity 
              style={styles.promptCard}
              onPress={() => router.push({
                pathname: '/modals/morning-quiz',
                params: { date: today }
              })}
            >
              <Sun size={24} color={COLORS.warning[600]} />
              <Text style={styles.promptTitle}>Start your morning planning</Text>
              <Text style={styles.promptSubtitle}>Plan your day and set your focus</Text>
            </TouchableOpacity>
          ) : null}

          {/* Evening Entry */}
          {todayEveningEntry ? (
            <TouchableOpacity 
              style={styles.entryCard}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: today, mode: 'edit' }
              })}
            >
              <View style={styles.entryHeader}>
                <Moon size={16} color={COLORS.secondary[600]} />
                <Text style={styles.entryTitle}>Evening Entry</Text>
                <Edit size={14} color={COLORS.primary[600]} />
              </View>
              <View style={styles.moodDisplay}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(todayEveningEntry.mood)}</Text>
                <Text style={styles.moodText}>{getMoodLabel(todayEveningEntry.mood)}</Text>
              </View>
              {todayEveningEntry.reflection && (
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {todayEveningEntry.reflection}
                </Text>
              )}
            </TouchableOpacity>
          ) : shouldShowEveningQuiz() ? (
            <TouchableOpacity 
              style={styles.promptCard}
              onPress={() => router.push({
                pathname: '/modals/evening-quiz',
                params: { date: today }
              })}
            >
              <Moon size={24} color={COLORS.secondary[600]} />
              <Text style={styles.promptTitle}>Evening reflection time</Text>
              <Text style={styles.promptSubtitle}>Reflect on your day</Text>
            </TouchableOpacity>
          ) : null}
          
          {/* Streak Card */}
          <View style={styles.streakCard}>
            <Text style={styles.streakNumber}>{journalStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
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
                    
                    <View style={styles.entryTypeIndicator}>
                      {entry.type === 'morning' && <Sun size={16} color={COLORS.warning[600]} />}
                      {entry.type === 'evening' && <Moon size={16} color={COLORS.secondary[600]} />}
                      {entry.type === 'free' && <Edit size={16} color={COLORS.primary[600]} />}
                    </View>
                    
                    <View style={styles.entryMood}>
                      <Text style={styles.entryMoodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                      <Text style={styles.entryMoodLabel}>{getMoodLabel(entry.mood)}</Text>
                    </View>
                  </View>
                  
                  {/* Show different content based on entry type */}
                  {entry.type === 'morning' && entry.mainFocus && (
                    <Text style={styles.entryText} numberOfLines={2}>
                      Today's focus: {entry.mainFocus}
                    </Text>
                  )}
                  
                  {entry.type === 'evening' && entry.reflection && (
                    <Text style={styles.entryText} numberOfLines={3}>
                      {entry.reflection}
                    </Text>
                  )}
                  
                  {entry.type === 'free' && entry.reflection && (
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
  entryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    flex: 1,
    marginLeft: 6,
  },
  entryTypeIndicator: {
    marginRight: 8,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  entryPreview: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 14,
  },
  entryMeta: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  promptCard: {
    flex: 1,
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary[500],
  },
  promptTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
    marginTop: 6,
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    marginTop: 2,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  streakNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.warning[700],
  },
  streakLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning[600],
    marginTop: 2,
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
  entryDate: {
    flex: 1,
  },
  entryDateText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  entryDayText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 1,
  },
  entryMood: {
    alignItems: 'center',
  },
  entryMoodEmoji: {
    fontSize: 20,
  },
  entryMoodLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  entryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    lineHeight: 16,
    marginBottom: 6,
  },
  gratitudeSection: {
    backgroundColor: COLORS.success[50],
    borderRadius: 6,
    padding: 6,
  },
  gratitudeLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.success[700],
    marginBottom: 2,
  },
  gratitudeText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.success[600],
  },
});