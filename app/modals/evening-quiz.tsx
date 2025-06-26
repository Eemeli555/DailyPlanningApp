import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Star, Heart, CheckCircle, X } from 'lucide-react-native';
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';

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
}

const TOTAL_STEPS = 8;

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
    awardXP
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
  });
  const [showTomorrowGoal, setShowTomorrowGoal] = useState(false);

  const incompleteGoals = todaysGoals.filter(goal => !responses.completedGoals.includes(goal.id));

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
    };

    if (existingEntry) {
      updateJournalEntry(existingEntry.id, journalData);
    } else {
      addJournalEntry(quizDate, journalData);
    }

    // Add tomorrow's goal if specified
    if (showTomorrowGoal && responses.tomorrowGoal?.trim()) {
      addGoal({
        title: responses.tomorrowGoal.trim(),
        description: `Created from evening reflection on ${format(new Date(quizDate), 'MMM d, yyyy')}`,
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
              <Text style={styles.stepTitle}>Do you want to set a goal for tomorrow?</Text>
              <Text style={styles.stepSubtitle}>Optional: Add a specific goal for tomorrow</Text>
            </View>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !showTomorrowGoal && styles.activeToggleButton
                ]}
                onPress={() => setShowTomorrowGoal(false)}
              >
                <Text style={[
                  styles.toggleText,
                  !showTomorrowGoal && styles.activeToggleText
                ]}>
                  No, I'm good
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  showTomorrowGoal && styles.activeToggleButton
                ]}
                onPress={() => setShowTomorrowGoal(true)}
              >
                <Text style={[
                  styles.toggleText,
                  showTomorrowGoal && styles.activeToggleText
                ]}>
                  Yes, add a goal
                </Text>
              </TouchableOpacity>
            </View>
            
            {showTomorrowGoal && (
              <Animated.View entering={FadeInDown} style={styles.goalInputContainer}>
                <TextInput
                  style={styles.goalInput}
                  placeholder="What do you want to accomplish tomorrow?"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={responses.tomorrowGoal}
                  onChangeText={(value) => updateResponse('tomorrowGoal', value)}
                />
              </Animated.View>
            )}
          </Animated.View>
        );

      case 8:
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: COLORS.primary[600],
  },
  toggleText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  activeToggleText: {
    color: COLORS.white,
  },
  goalInputContainer: {
    marginTop: 16,
  },
  goalInput: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
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
});