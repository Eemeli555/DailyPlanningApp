import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Star, Heart, CircleCheck as CheckCircle, X, Smartphone } from 'lucide-react-native';
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';
import { formatUsageTime } from '@/utils/socialMediaTracking';

interface QuizResponse {
  mood: number;
  energy: number;
  completedGoals: string[];
  incompleteReason?: string;
  gratitude: string[];
  improvements?: string;
  thoughts?: string;
  tomorrowGoal?: string;
  tomorrowPriority?: string;
  socialMediaMeaningful?: number;
  socialMediaDistraction?: boolean;
  socialMediaAlternatives?: string[];
}

const TOTAL_STEPS = 10;

export default function EveningQuizScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { 
    todaysGoals, 
    completeGoal, 
    uncompleteGoal, 
    addJournalEntry, 
    updateJournalEntry,
    journalEntries,
    addGoal,
    awardXP,
    appUsageSessions,
    trackedApps,
    addSocialMediaReflection,
    addDigitalWellnessGoal
  } = useContext(AppContext);

  const quizDate = date || new Date().toISOString().split('T')[0];
  const existingEntry = journalEntries.find(entry => entry.date === quizDate);

  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<QuizResponse>({
    mood: existingEntry?.mood || 5,
    energy: existingEntry?.energy || 5,
    completedGoals: todaysGoals.filter(g => g.completed).map(g => g.id),
    gratitude: existingEntry?.gratitude || ['', '', ''],
    improvements: existingEntry?.challenges || '',
    thoughts: existingEntry?.reflection || '',
    tomorrowGoal: '',
    tomorrowPriority: existingEntry?.tomorrowFocus || '',
    socialMediaMeaningful: 3,
    socialMediaDistraction: false,
    socialMediaAlternatives: [''],
  });

  const incompleteGoals = todaysGoals.filter(goal => !responses.completedGoals.includes(goal.id));

  // Calculate total social media usage for today
  const todayUsageSessions = appUsageSessions.filter(
    session => session.date === quizDate
  );
  
  const totalSocialMediaMinutes = todayUsageSessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  const updateResponse = (key: keyof QuizResponse, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const toggleGoalCompletion = (goalId: string) => {
    const isCompleted = responses.completedGoals.includes(goalId);
    if (isCompleted) {
      updateResponse('completedGoals', responses.completedGoals.filter(id => id !== goalId));
      uncompleteGoal(goalId);
    } else {
      updateResponse('completedGoals', [...responses.completedGoals, goalId]);
      completeGoal(goalId);
    }
  };

  const updateGratitude = (index: number, value: string) => {
    const newGratitude = [...responses.gratitude];
    newGratitude[index] = value;
    updateResponse('gratitude', newGratitude);
  };

  const updateSocialMediaAlternative = (index: number, value: string) => {
    const newAlternatives = [...(responses.socialMediaAlternatives || [''])];
    newAlternatives[index] = value;
    updateResponse('socialMediaAlternatives', newAlternatives);
  };

  const addSocialMediaAlternative = () => {
    const newAlternatives = [...(responses.socialMediaAlternatives || ['']), ''];
    updateResponse('socialMediaAlternatives', newAlternatives);
  };

  const removeSocialMediaAlternative = (index: number) => {
    if ((responses.socialMediaAlternatives?.length || 0) <= 1) return;
    
    const newAlternatives = (responses.socialMediaAlternatives || ['']).filter((_, i) => i !== index);
    updateResponse('socialMediaAlternatives', newAlternatives);
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 4: // Gratitude - require at least 3 items
        return responses.gratitude.filter(item => item.trim()).length >= 3;
      default:
        return true;
    }
  };

  const completeQuiz = () => {
    // Save journal entry
    const journalData = {
      mood: responses.mood,
      energy: responses.energy,
      stress: 3, // Default middle value
      reflection: responses.thoughts,
      gratitude: responses.gratitude.filter(item => item.trim()),
      challenges: responses.improvements,
      tomorrowFocus: responses.tomorrowPriority,
      socialMediaMeaningful: responses.socialMediaMeaningful,
      socialMediaDistraction: responses.socialMediaDistraction,
    };

    if (existingEntry) {
      updateJournalEntry(existingEntry.id, journalData);
    } else {
      addJournalEntry(quizDate, journalData);
    }

    // Add tomorrow's goal if specified
    if (responses.tomorrowGoal?.trim()) {
      addGoal({
        title: responses.tomorrowGoal.trim(),
        description: `Created from evening reflection on ${format(new Date(quizDate), 'MMM d, yyyy')}`,
      });
    }

    // Save social media reflection
    if (totalSocialMediaMinutes > 0) {
      addSocialMediaReflection({
        date: quizDate,
        totalUsageMinutes: totalSocialMediaMinutes,
        meaningfulnessRating: responses.socialMediaMeaningful || 3,
        wasDistraction: responses.socialMediaDistraction || false,
        alternativeActivities: responses.socialMediaAlternatives?.filter(alt => alt.trim()) || [],
      });
    }

    // Add digital wellness goal if user wants to reduce usage
    if (responses.socialMediaDistraction && totalSocialMediaMinutes > 60) {
      // Create a goal to reduce usage by 20%
      const targetValue = Math.round(totalSocialMediaMinutes * 0.8);
      
      addDigitalWellnessGoal({
        type: 'reduce_usage',
        title: `Reduce social media to ${formatUsageTime(targetValue)} tomorrow`,
        description: 'Based on your evening reflection',
        targetValue,
        currentValue: 0,
        targetDate: format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        isActive: true,
      });
    }

    // Award XP for completing evening quiz
    awardXP(25, 'Evening reflection completed');

    router.back();
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentStep / TOTAL_STEPS) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>Step {currentStep} of {TOTAL_STEPS}</Text>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Moon size={32} color={COLORS.accent[600]} />
              <Text style={styles.stepTitle}>How did you feel overall today?</Text>
              <Text style={styles.stepSubtitle}>Rate your mood from 1 (terrible) to 10 (amazing)</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{responses.mood}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={responses.mood}
                onValueChange={(value) => updateResponse('mood', value)}
                minimumTrackTintColor={COLORS.primary[500]}
                maximumTrackTintColor={COLORS.neutral[300]}
                thumbStyle={{ backgroundColor: COLORS.primary[600] }}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Terrible</Text>
                <Text style={styles.sliderLabel}>Amazing</Text>
              </View>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Star size={32} color={COLORS.warning[600]} />
              <Text style={styles.stepTitle}>How was your energy today?</Text>
              <Text style={styles.stepSubtitle}>Rate your energy from 1 (drained) to 10 (energized)</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{responses.energy}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={responses.energy}
                onValueChange={(value) => updateResponse('energy', value)}
                minimumTrackTintColor={COLORS.warning[500]}
                maximumTrackTintColor={COLORS.neutral[300]}
                thumbStyle={{ backgroundColor: COLORS.warning[600] }}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Drained</Text>
                <Text style={styles.sliderLabel}>Energized</Text>
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <CheckCircle size={32} color={COLORS.success[600]} />
              <Text style={styles.stepTitle}>Let's review your goals</Text>
              <Text style={styles.stepSubtitle}>Mark the goals you completed today</Text>
            </View>
            
            <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
              {todaysGoals.length === 0 ? (
                <View style={styles.emptyGoals}>
                  <Text style={styles.emptyGoalsText}>No goals for today</Text>
                  <Text style={styles.emptyGoalsSubtext}>You can add goals from the Planning tab</Text>
                </View>
              ) : (
                todaysGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalItem,
                      responses.completedGoals.includes(goal.id) && styles.completedGoalItem
                    ]}
                    onPress={() => toggleGoalCompletion(goal.id)}
                  >
                    <View style={[
                      styles.goalCheckbox,
                      responses.completedGoals.includes(goal.id) && styles.checkedGoalCheckbox
                    ]}>
                      {responses.completedGoals.includes(goal.id) && (
                        <CheckCircle size={16} color={COLORS.white} />
                      )}
                    </View>
                    <Text style={[
                      styles.goalText,
                      responses.completedGoals.includes(goal.id) && styles.completedGoalText
                    ]}>
                      {goal.title}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Heart size={32} color={COLORS.error[500]} />
              <Text style={styles.stepTitle}>What are you thankful for today?</Text>
              <Text style={styles.stepSubtitle}>List at least 3 things you're grateful for</Text>
            </View>
            
            <ScrollView style={styles.gratitudeList} showsVerticalScrollIndicator={false}>
              {responses.gratitude.map((item, index) => (
                <View key={index} style={styles.gratitudeItem}>
                  <Text style={styles.gratitudeNumber}>{index + 1}.</Text>
                  <TextInput
                    style={styles.gratitudeInput}
                    placeholder={`Something you're grateful for...`}
                    placeholderTextColor={COLORS.neutral[400]}
                    value={item}
                    onChangeText={(value) => updateGratitude(index, value)}
                    multiline
                  />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>What could have gone better?</Text>
              <Text style={styles.stepSubtitle}>Reflect on areas for improvement (optional)</Text>
            </View>
            
            <TextInput
              style={styles.textArea}
              placeholder="What would you do differently? What challenges did you face?"
              placeholderTextColor={COLORS.neutral[400]}
              value={responses.improvements}
              onChangeText={(value) => updateResponse('improvements', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Any other thoughts?</Text>
              <Text style={styles.stepSubtitle}>Share what's on your mind (optional)</Text>
            </View>
            
            <TextInput
              style={styles.textArea}
              placeholder="How was your day? Any insights, feelings, or reflections..."
              placeholderTextColor={COLORS.neutral[400]}
              value={responses.thoughts}
              onChangeText={(value) => updateResponse('thoughts', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Smartphone size={32} color={COLORS.primary[600]} />
              <Text style={styles.stepTitle}>Social Media Reflection</Text>
              <Text style={styles.stepSubtitle}>How meaningful was your screen time today?</Text>
            </View>
            
            {totalSocialMediaMinutes > 0 ? (
              <>
                <View style={styles.socialMediaSummary}>
                  <Text style={styles.socialMediaTime}>
                    {formatUsageTime(totalSocialMediaMinutes)}
                  </Text>
                  <Text style={styles.socialMediaLabel}>
                    spent on social media today
                  </Text>
                </View>
                
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>
                    {responses.socialMediaMeaningful === 1 ? 'Not at all' :
                     responses.socialMediaMeaningful === 2 ? 'Slightly' :
                     responses.socialMediaMeaningful === 3 ? 'Somewhat' :
                     responses.socialMediaMeaningful === 4 ? 'Quite' :
                     'Very'} meaningful
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={1}
                    maximumValue={5}
                    step={1}
                    value={responses.socialMediaMeaningful || 3}
                    onValueChange={(value) => updateResponse('socialMediaMeaningful', value)}
                    minimumTrackTintColor={COLORS.primary[500]}
                    maximumTrackTintColor={COLORS.neutral[300]}
                    thumbStyle={{ backgroundColor: COLORS.primary[600] }}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>Not meaningful</Text>
                    <Text style={styles.sliderLabel}>Very meaningful</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noSocialMediaContainer}>
                <Text style={styles.noSocialMediaText}>
                  No social media usage detected today
                </Text>
                <Text style={styles.noSocialMediaSubtext}>
                  Great job staying focused!
                </Text>
              </View>
            )}
          </Animated.View>
        );

      case 8:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Was social media a distraction?</Text>
              <Text style={styles.stepSubtitle}>
                Did it pull you away from something else you wanted to do?
              </Text>
            </View>
            
            {totalSocialMediaMinutes > 0 ? (
              <View style={styles.distractionContainer}>
                <TouchableOpacity
                  style={[
                    styles.distractionButton,
                    responses.socialMediaDistraction === true && styles.selectedDistractionButton
                  ]}
                  onPress={() => updateResponse('socialMediaDistraction', true)}
                >
                  <Text style={[
                    styles.distractionButtonText,
                    responses.socialMediaDistraction === true && styles.selectedDistractionButtonText
                  ]}>
                    Yes, it was distracting
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.distractionButton,
                    responses.socialMediaDistraction === false && styles.selectedDistractionButton
                  ]}
                  onPress={() => updateResponse('socialMediaDistraction', false)}
                >
                  <Text style={[
                    styles.distractionButtonText,
                    responses.socialMediaDistraction === false && styles.selectedDistractionButtonText
                  ]}>
                    No, it was intentional
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noSocialMediaContainer}>
                <Text style={styles.noSocialMediaText}>
                  No social media usage detected today
                </Text>
                <Text style={styles.noSocialMediaSubtext}>
                  Great job staying focused!
                </Text>
              </View>
            )}
          </Animated.View>
        );

      case 9:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>What would you like to do more of?</Text>
              <Text style={styles.stepSubtitle}>
                Instead of social media, what activities would be more fulfilling?
              </Text>
            </View>
            
            {totalSocialMediaMinutes > 0 ? (
              <ScrollView style={styles.alternativesList} showsVerticalScrollIndicator={false}>
                {(responses.socialMediaAlternatives || ['']).map((alternative, index) => (
                  <View key={index} style={styles.alternativeItem}>
                    <TextInput
                      style={styles.alternativeInput}
                      placeholder={`Alternative activity ${index + 1}...`}
                      placeholderTextColor={COLORS.neutral[400]}
                      value={alternative}
                      onChangeText={(value) => updateSocialMediaAlternative(index, value)}
                      multiline
                    />
                    {(responses.socialMediaAlternatives?.length || 0) > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeSocialMediaAlternative(index)}
                      >
                        <X size={16} color={COLORS.error[600]} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addAlternativeButton}
                  onPress={addSocialMediaAlternative}
                >
                  <Text style={styles.addAlternativeText}>+ Add another activity</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.noSocialMediaContainer}>
                <Text style={styles.noSocialMediaText}>
                  No social media usage detected today
                </Text>
                <Text style={styles.noSocialMediaSubtext}>
                  Great job staying focused!
                </Text>
              </View>
            )}
          </Animated.View>
        );

      case 10:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>What's your #1 priority for tomorrow?</Text>
              <Text style={styles.stepSubtitle}>One main thing to focus on (optional)</Text>
            </View>
            
            <TextInput
              style={styles.priorityInput}
              placeholder="Your main focus for tomorrow..."
              placeholderTextColor={COLORS.neutral[400]}
              value={responses.tomorrowPriority}
              onChangeText={(value) => updateResponse('tomorrowPriority', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evening Reflection</Text>
        <Text style={styles.headerDate}>{format(new Date(quizDate), 'MMM d, yyyy')}</Text>
      </View>

      {renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <ChevronLeft size={20} color={COLORS.neutral[600]} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.spacer} />
        
        {currentStep < TOTAL_STEPS ? (
          <Button
            title="Continue"
            onPress={nextStep}
            disabled={!canProceed()}
            style={[styles.continueButton, !canProceed() && styles.disabledButton]}
            icon={<ChevronRight size={20} color={COLORS.white} />}
          />
        ) : (
          <Button
            title="Complete Reflection"
            onPress={completeQuiz}
            style={styles.completeButton}
            icon={<CheckCircle size={20} color={COLORS.white} />}
          />
        )}
      </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  headerDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[600],
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
  },
  goalsList: {
    maxHeight: 300,
  },
  emptyGoals: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyGoalsText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[600],
  },
  emptyGoalsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 4,
    textAlign: 'center',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    marginBottom: 8,
  },
  completedGoalItem: {
    backgroundColor: COLORS.success[50],
  },
  goalCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedGoalCheckbox: {
    backgroundColor: COLORS.success[600],
    borderColor: COLORS.success[600],
  },
  goalText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[800],
  },
  completedGoalText: {
    color: COLORS.success[700],
  },
  gratitudeList: {
    maxHeight: 300,
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gratitudeNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[600],
    marginRight: 12,
    marginTop: 12,
  },
  gratitudeInput: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    minHeight: 48,
    textAlignVertical: 'top',
  },
  textArea: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    height: 120,
    textAlignVertical: 'top',
  },
  priorityInput: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginLeft: 4,
  },
  spacer: {
    flex: 1,
  },
  continueButton: {
    minWidth: 120,
  },
  completeButton: {
    backgroundColor: COLORS.success[600],
    minWidth: 160,
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
  socialMediaSummary: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialMediaTime: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  socialMediaLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  noSocialMediaContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.success[50],
    borderRadius: 12,
    marginTop: 20,
  },
  noSocialMediaText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.success[700],
  },
  noSocialMediaSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.success[600],
    marginTop: 8,
  },
  distractionContainer: {
    marginTop: 20,
    gap: 12,
  },
  distractionButton: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedDistractionButton: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[300],
  },
  distractionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedDistractionButtonText: {
    color: COLORS.primary[700],
  },
  alternativesList: {
    maxHeight: 300,
    marginTop: 20,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alternativeInput: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    minHeight: 48,
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
  addAlternativeButton: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    borderStyle: 'dashed',
  },
  addAlternativeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
});