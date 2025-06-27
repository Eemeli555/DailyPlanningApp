import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Sunrise, Sunset, CreditCard as Edit, BookOpen, Moon, Clock, Sun, Brain, Heart, Zap } from 'lucide-react-native';
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
  const { journalEntries, userProfile, sleepData, socialMediaData } = useContext(AppContext);
  
  const today = new Date().toISOString().split('T')[0];
  const todayMorningEntry = journalEntries.find(entry => entry.date === today && entry.type === 'morning');
  const todayEveningEntry = journalEntries.find(entry => entry.date === today && entry.type === 'evening');
  const todaySleep = sleepData.find(sleep => sleep.date === today);
  const todaySocial = socialMediaData.find(social => social.date === today);
  
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

        {/* Today's Data Summary */}
        {(todaySleep || todaySocial || todayMorningEntry || todayEveningEntry) && (
          <View style={styles.todayDataSection}>
            <Text style={styles.todayDataTitle}>Today's Data</Text>
            <View style={styles.todayDataGrid}>
              {todaySleep && (
                <View style={styles.dataCard}>
                  <Brain size={16} color={COLORS.accent[600]} />
                  <Text style={styles.dataValue}>{todaySleep.hoursSlept}h</Text>
                  <Text style={styles.dataLabel}>Sleep</Text>
                  <Text style={styles.dataSubtext}>Quality: {todaySleep.quality}/10</Text>
                </View>
              )}
              
              {todayMorningEntry?.mood && (
                <View style={styles.dataCard}>
                  <Heart size={16} color={COLORS.error[500]} />
                  <Text style={styles.dataValue}>{todayMorningEntry.mood}/5</Text>
                  <Text style={styles.dataLabel}>Morning Mood</Text>
                </View>
              )}
              
              {todayEveningEntry?.mood && (
                <View style={styles.dataCard}>
                  <Moon size={16} color={COLORS.secondary[600]} />
                  <Text style={styles.dataValue}>{todayEveningEntry.mood}/5</Text>
                  <Text style={styles.dataLabel}>Evening Mood</Text>
                </View>
              )}
              
              {todaySocial && (
                <View style={styles.dataCard}>
                  <Zap size={16} color={COLORS.warning[600]} />
                  <Text style={styles.dataValue}>{Math.round(todaySocial.totalMinutes / 60)}h</Text>
                  <Text style={styles.dataLabel}>Screen Time</Text>
                  <Text style={styles.dataSubtext}>{todaySocial.totalMinutes}m total</Text>
                </View>
              )}
            </View>
          </View>
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

                  {/* Show sleep data for morning entries */}
                  {entry.type === 'morning' && entry.sleepHours && (
                    <View style={styles.sleepSection}>
                      <Text style={styles.sleepLabel}>Sleep:</Text>
                      <Text style={styles.sleepText}>
                        {entry.sleepHours}h • Quality: {entry.sleepQuality}/10
                      </Text>
                    </View>
                  )}

                  {/* Show energy and stress for evening entries */}
                  {entry.type === 'evening' && (entry.energy || entry.stress) && (
                    <View style={styles.wellnessSection}>
                      {entry.energy && (
                        <Text style={styles.wellnessText}>Energy: {entry.energy}/5</Text>
                      )}
                      {entry.stress && (
                        <Text style={styles.wellnessText}>Stress: {entry.stress}/5</Text>
                      )}
                    </View>
                  )}
                  
                  {entry.gratitude && entry.gratitude.length > 0 && (
                    <View style={styles.gratitudeSection}>
                      <Text style={styles.gratitudeLabel}>Grateful for:</Text>
                      <Text style={styles.gratitudeText} numberOfLines={1}>
                        {entry.gratitude.join(', ')}
                      </Text>
                    </View>
                  )}

                  {/* Show morning gratitude for morning entries */}
                  {entry.type === 'morning' && entry.morningGratitude && (
                    <View style={styles.gratitudeSection}>
                      <Text style={styles.gratitudeLabel}>Morning gratitude:</Text>
                      <Text style={styles.gratitudeText} numberOfLines={2}>
                        {entry.morningGratitude}
                      </Text>
                    </View>
                  )}

                  {/* Show daily goals for morning entries */}
                  {entry.type === 'morning' && entry.dailyGoals && entry.dailyGoals.length > 0 && (
                    <View style={styles.goalsSection}>
                      <Text style={styles.goalsLabel}>Daily goals:</Text>
                      <Text style={styles.goalsText} numberOfLines={2}>
                        {entry.dailyGoals.join(', ')}
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
  todayDataSection: {
    marginTop: 8,
  },
  todayDataTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  todayDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dataCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 70,
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginTop: 4,
  },
  dataLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  dataSubtext: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 1,
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
  sleepSection: {
    backgroundColor: COLORS.accent[50],
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
  },
  sleepLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.accent[700],
    marginBottom: 2,
  },
  sleepText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.accent[600],
  },
  wellnessSection: {
    backgroundColor: COLORS.secondary[50],
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
    flexDirection: 'row',
    gap: 12,
  },
  wellnessText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.secondary[600],
  },
  gratitudeSection: {
    backgroundColor: COLORS.success[50],
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
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
  goalsSection: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 6,
    padding: 6,
  },
  goalsLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
    marginBottom: 2,
  },
  goalsText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
  },
});