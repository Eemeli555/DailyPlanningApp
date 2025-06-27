import { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar, Sunrise, Sunset, CreditCard as Edit, BookOpen, Moon, Clock, Sun, Brain, Heart, Zap, Target, Activity, Droplets } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { MOOD_LABELS } from '@/constants/gamification';
import FloatingActionButton from '@/components/FloatingActionButton';
import MoodChart from '@/components/MoodChart';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

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
        <View style={[styles.todaySection, isSmallScreen && styles.todaySectionSmall]}>
          {/* Morning Entry */}
          {todayMorningEntry ? (
            <TouchableOpacity 
              style={[styles.entryCard, isSmallScreen && styles.entryCardSmall]}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: today, mode: 'edit' }
              })}
            >
              <View style={styles.entryHeader}>
                <Sun size={isSmallScreen ? 14 : 16} color={COLORS.warning[600]} />
                <Text style={[styles.entryTitle, isSmallScreen && styles.entryTitleSmall]}>
                  Morning Entry
                </Text>
                <Edit size={isSmallScreen ? 12 : 14} color={COLORS.primary[600]} />
              </View>
              {todayMorningEntry.mainFocus && (
                <Text style={[styles.entryPreview, isSmallScreen && styles.entryPreviewSmall]} numberOfLines={1}>
                  Focus: {todayMorningEntry.mainFocus}
                </Text>
              )}
              {todayMorningEntry.sleepHours && (
                <Text style={[styles.entryMeta, isSmallScreen && styles.entryMetaSmall]}>
                  {todayMorningEntry.sleepHours}h sleep • Quality: {todayMorningEntry.sleepQuality}/10
                </Text>
              )}
            </TouchableOpacity>
          ) : shouldShowMorningQuiz() ? (
            <TouchableOpacity 
              style={[styles.promptCard, isSmallScreen && styles.promptCardSmall]}
              onPress={() => router.push({
                pathname: '/modals/morning-quiz',
                params: { date: today }
              })}
            >
              <Sun size={isSmallScreen ? 20 : 24} color={COLORS.warning[600]} />
              <Text style={[styles.promptTitle, isSmallScreen && styles.promptTitleSmall]}>
                Start your morning planning
              </Text>
              <Text style={[styles.promptSubtitle, isSmallScreen && styles.promptSubtitleSmall]}>
                Plan your day and set your focus
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Evening Entry */}
          {todayEveningEntry ? (
            <TouchableOpacity 
              style={[styles.entryCard, isSmallScreen && styles.entryCardSmall]}
              onPress={() => router.push({
                pathname: '/modals/journal-entry',
                params: { date: today, mode: 'edit' }
              })}
            >
              <View style={styles.entryHeader}>
                <Moon size={isSmallScreen ? 14 : 16} color={COLORS.secondary[600]} />
                <Text style={[styles.entryTitle, isSmallScreen && styles.entryTitleSmall]}>
                  Evening Entry
                </Text>
                <Edit size={isSmallScreen ? 12 : 14} color={COLORS.primary[600]} />
              </View>
              <View style={styles.moodDisplay}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(todayEveningEntry.mood)}</Text>
                <Text style={[styles.moodText, isSmallScreen && styles.moodTextSmall]}>
                  {getMoodLabel(todayEveningEntry.mood)}
                </Text>
              </View>
              {todayEveningEntry.reflection && (
                <Text style={[styles.entryPreview, isSmallScreen && styles.entryPreviewSmall]} numberOfLines={2}>
                  {todayEveningEntry.reflection}
                </Text>
              )}
            </TouchableOpacity>
          ) : shouldShowEveningQuiz() ? (
            <TouchableOpacity 
              style={[styles.promptCard, isSmallScreen && styles.promptCardSmall]}
              onPress={() => router.push({
                pathname: '/modals/evening-quiz',
                params: { date: today }
              })}
            >
              <Moon size={isSmallScreen ? 20 : 24} color={COLORS.secondary[600]} />
              <Text style={[styles.promptTitle, isSmallScreen && styles.promptTitleSmall]}>
                Evening reflection time
              </Text>
              <Text style={[styles.promptSubtitle, isSmallScreen && styles.promptSubtitleSmall]}>
                Reflect on your day
              </Text>
            </TouchableOpacity>
          ) : null}
          
          {/* Streak Card */}
          <View style={[styles.streakCard, isSmallScreen && styles.streakCardSmall]}>
            <Text style={[styles.streakNumber, isSmallScreen && styles.streakNumberSmall]}>
              {journalStreak}
            </Text>
            <Text style={[styles.streakLabel, isSmallScreen && styles.streakLabelSmall]}>
              Day Streak
            </Text>
          </View>
        </View>

        {/* Today's Data Summary */}
        {(todaySleep || todaySocial || todayMorningEntry || todayEveningEntry) && (
          <View style={styles.todayDataSection}>
            <Text style={styles.todayDataTitle}>Today's Data</Text>
            <View style={[styles.todayDataGrid, isSmallScreen && styles.todayDataGridSmall]}>
              {todaySleep && (
                <View style={[styles.dataCard, isSmallScreen && styles.dataCardSmall]}>
                  <Brain size={isSmallScreen ? 14 : 16} color={COLORS.accent[600]} />
                  <Text style={[styles.dataValue, isSmallScreen && styles.dataValueSmall]}>
                    {todaySleep.hoursSlept}h
                  </Text>
                  <Text style={[styles.dataLabel, isSmallScreen && styles.dataLabelSmall]}>
                    Sleep
                  </Text>
                  <Text style={[styles.dataSubtext, isSmallScreen && styles.dataSubtextSmall]}>
                    Quality: {todaySleep.quality}/10
                  </Text>
                </View>
              )}
              
              {todayMorningEntry?.mood && (
                <View style={[styles.dataCard, isSmallScreen && styles.dataCardSmall]}>
                  <Heart size={isSmallScreen ? 14 : 16} color={COLORS.error[500]} />
                  <Text style={[styles.dataValue, isSmallScreen && styles.dataValueSmall]}>
                    {todayMorningEntry.mood}/5
                  </Text>
                  <Text style={[styles.dataLabel, isSmallScreen && styles.dataLabelSmall]}>
                    Morning Mood
                  </Text>
                </View>
              )}
              
              {todayEveningEntry?.mood && (
                <View style={[styles.dataCard, isSmallScreen && styles.dataCardSmall]}>
                  <Moon size={isSmallScreen ? 14 : 16} color={COLORS.secondary[600]} />
                  <Text style={[styles.dataValue, isSmallScreen && styles.dataValueSmall]}>
                    {todayEveningEntry.mood}/5
                  </Text>
                  <Text style={[styles.dataLabel, isSmallScreen && styles.dataLabelSmall]}>
                    Evening Mood
                  </Text>
                </View>
              )}
              
              {todaySocial && (
                <View style={[styles.dataCard, isSmallScreen && styles.dataCardSmall]}>
                  <Zap size={isSmallScreen ? 14 : 16} color={COLORS.warning[600]} />
                  <Text style={[styles.dataValue, isSmallScreen && styles.dataValueSmall]}>
                    {Math.round(todaySocial.totalMinutes / 60)}h
                  </Text>
                  <Text style={[styles.dataLabel, isSmallScreen && styles.dataLabelSmall]}>
                    Screen Time
                  </Text>
                  <Text style={[styles.dataSubtext, isSmallScreen && styles.dataSubtextSmall]}>
                    {todaySocial.totalMinutes}m total
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
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
                    <View style={styles.contentSection}>
                      <View style={styles.contentRow}>
                        <Target size={14} color={COLORS.primary[600]} />
                        <Text style={styles.contentLabel}>Today's focus:</Text>
                      </View>
                      <Text style={styles.contentText}>{entry.mainFocus}</Text>
                    </View>
                  )}
                  
                  {entry.type === 'evening' && entry.reflection && (
                    <View style={styles.contentSection}>
                      <View style={styles.contentRow}>
                        <BookOpen size={14} color={COLORS.secondary[600]} />
                        <Text style={styles.contentLabel}>Reflection:</Text>
                      </View>
                      <Text style={styles.contentText} numberOfLines={3}>
                        {entry.reflection}
                      </Text>
                    </View>
                  )}
                  
                  {entry.type === 'free' && entry.reflection && (
                    <View style={styles.contentSection}>
                      <View style={styles.contentRow}>
                        <BookOpen size={14} color={COLORS.primary[600]} />
                        <Text style={styles.contentLabel}>Thoughts:</Text>
                      </View>
                      <Text style={styles.contentText} numberOfLines={3}>
                        {entry.reflection}
                      </Text>
                    </View>
                  )}

                  {/* Show sleep data for morning entries */}
                  {entry.type === 'morning' && entry.sleepHours && (
                    <View style={styles.dataSection}>
                      <View style={styles.dataRow}>
                        <Brain size={14} color={COLORS.accent[600]} />
                        <Text style={styles.dataLabel}>Sleep:</Text>
                        <Text style={styles.dataValue}>
                          {entry.sleepHours}h • Quality: {entry.sleepQuality}/10
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Show morning feeling */}
                  {entry.type === 'morning' && entry.morningFeeling && (
                    <View style={styles.dataSection}>
                      <View style={styles.dataRow}>
                        <Heart size={14} color={COLORS.error[500]} />
                        <Text style={styles.dataLabel}>Feeling:</Text>
                        <Text style={styles.dataValue} numberOfLines={1}>
                          {entry.morningFeeling}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Show energy and stress for evening entries */}
                  {entry.type === 'evening' && (entry.energy || entry.stress) && (
                    <View style={styles.dataSection}>
                      {entry.energy && (
                        <View style={styles.dataRow}>
                          <Zap size={14} color={COLORS.warning[600]} />
                          <Text style={styles.dataLabel}>Energy:</Text>
                          <Text style={styles.dataValue}>{entry.energy}/5</Text>
                        </View>
                      )}
                      {entry.stress && (
                        <View style={styles.dataRow}>
                          <Activity size={14} color={COLORS.error[600]} />
                          <Text style={styles.dataLabel}>Stress:</Text>
                          <Text style={styles.dataValue}>{entry.stress}/5</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Show highlights */}
                  {entry.highlights && (
                    <View style={styles.contentSection}>
                      <View style={styles.contentRow}>
                        <Sun size={14} color={COLORS.warning[600]} />
                        <Text style={styles.contentLabel}>Highlights:</Text>
                      </View>
                      <Text style={styles.contentText} numberOfLines={2}>
                        {entry.highlights}
                      </Text>
                    </View>
                  )}

                  {/* Show challenges */}
                  {entry.challenges && (
                    <View style={styles.contentSection}>
                      <View style={styles.contentRow}>
                        <Target size={14} color={COLORS.error[600]} />
                        <Text style={styles.contentLabel}>Challenges:</Text>
                      </View>
                      <Text style={styles.contentText} numberOfLines={2}>
                        {entry.challenges}
                      </Text>
                    </View>
                  )}

                  {/* Show tomorrow's focus */}
                  {entry.tomorrowFocus && (
                    <View style={styles.contentSection}>
                      <View style={styles.contentRow}>
                        <Sunrise size={14} color={COLORS.accent[600]} />
                        <Text style={styles.contentLabel}>Tomorrow's focus:</Text>
                      </View>
                      <Text style={styles.contentText} numberOfLines={1}>
                        {entry.tomorrowFocus}
                      </Text>
                    </View>
                  )}
                  
                  {/* Show gratitude */}
                  {entry.gratitude && entry.gratitude.length > 0 && (
                    <View style={styles.gratitudeSection}>
                      <View style={styles.contentRow}>
                        <Heart size={14} color={COLORS.success[600]} />
                        <Text style={styles.gratitudeLabel}>Grateful for:</Text>
                      </View>
                      <Text style={styles.gratitudeText} numberOfLines={2}>
                        {entry.gratitude.join(', ')}
                      </Text>
                    </View>
                  )}

                  {/* Show morning gratitude for morning entries */}
                  {entry.type === 'morning' && entry.morningGratitude && (
                    <View style={styles.gratitudeSection}>
                      <View style={styles.contentRow}>
                        <Heart size={14} color={COLORS.success[600]} />
                        <Text style={styles.gratitudeLabel}>Morning gratitude:</Text>
                      </View>
                      <Text style={styles.gratitudeText} numberOfLines={2}>
                        {entry.morningGratitude}
                      </Text>
                    </View>
                  )}

                  {/* Show daily goals for morning entries */}
                  {entry.type === 'morning' && entry.dailyGoals && entry.dailyGoals.length > 0 && (
                    <View style={styles.goalsSection}>
                      <View style={styles.contentRow}>
                        <Target size={14} color={COLORS.primary[600]} />
                        <Text style={styles.goalsLabel}>Daily goals:</Text>
                      </View>
                      <View style={styles.goalsList}>
                        {entry.dailyGoals.slice(0, 3).map((goal, goalIndex) => (
                          <Text key={goalIndex} style={styles.goalItem} numberOfLines={1}>
                            • {goal}
                          </Text>
                        ))}
                        {entry.dailyGoals.length > 3 && (
                          <Text style={styles.moreGoals}>
                            +{entry.dailyGoals.length - 3} more goals
                          </Text>
                        )}
                      </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: isSmallScreen ? 13 : 14,
    color: COLORS.neutral[500],
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: isSmallScreen ? 22 : 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginTop: 2,
  },
  calendarButton: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  todaySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  todaySectionSmall: {
    gap: 8,
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
  entryCardSmall: {
    padding: 10,
    borderRadius: 10,
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
  entryTitleSmall: {
    fontSize: 11,
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
  moodTextSmall: {
    fontSize: 11,
  },
  entryPreview: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 14,
  },
  entryPreviewSmall: {
    fontSize: 10,
    lineHeight: 13,
  },
  entryMeta: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  entryMetaSmall: {
    fontSize: 9,
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
  promptCardSmall: {
    padding: 10,
    borderRadius: 10,
  },
  promptTitle: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
    marginTop: 6,
    textAlign: 'center',
  },
  promptTitleSmall: {
    fontSize: 11,
    marginTop: 4,
  },
  promptSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    marginTop: 2,
    textAlign: 'center',
  },
  promptSubtitleSmall: {
    fontSize: 9,
  },
  streakCard: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isSmallScreen ? 50 : 60,
  },
  streakCardSmall: {
    padding: 10,
    borderRadius: 10,
  },
  streakNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.warning[700],
  },
  streakNumberSmall: {
    fontSize: 18,
  },
  streakLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.warning[600],
    marginTop: 2,
  },
  streakLabelSmall: {
    fontSize: 9,
  },
  todayDataSection: {
    marginTop: 8,
  },
  todayDataTitle: {
    fontSize: isSmallScreen ? 13 : 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  todayDataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  todayDataGridSmall: {
    gap: 6,
  },
  dataCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 70,
    flex: 1,
  },
  dataCardSmall: {
    padding: 6,
    borderRadius: 6,
  },
  dataValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginTop: 4,
  },
  dataValueSmall: {
    fontSize: 14,
  },
  dataLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  dataLabelSmall: {
    fontSize: 9,
  },
  dataSubtext: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 1,
  },
  dataSubtextSmall: {
    fontSize: 8,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  chartSection: {
    marginHorizontal: isSmallScreen ? 16 : 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 17 : 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  entriesSection: {
    marginHorizontal: isSmallScreen ? 16 : 20,
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
  contentSection: {
    marginBottom: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contentLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginLeft: 6,
  },
  contentText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    lineHeight: 16,
    marginLeft: 20,
  },
  dataSection: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  gratitudeSection: {
    backgroundColor: COLORS.success[50],
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  gratitudeLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.success[700],
    marginLeft: 6,
  },
  gratitudeText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.success[600],
    marginLeft: 20,
    lineHeight: 15,
  },
  goalsSection: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  goalsLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
    marginLeft: 6,
  },
  goalsList: {
    marginLeft: 20,
    marginTop: 4,
  },
  goalItem: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    lineHeight: 15,
    marginBottom: 2,
  },
  moreGoals: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[500],
    fontStyle: 'italic',
    marginTop: 2,
  },
});