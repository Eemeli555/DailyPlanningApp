import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Sun, Star, Heart, CircleCheck as CheckCircle, X, Plus, Minus } from 'lucide-react-native';
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import Button from '@/components/Button';

interface MorningQuizResponse {
  sleepQuality: number;
  sleepHours: number;
  morningFeeling: string;
  mainFocus: string;
  dailyGoals: string[];
  morningGratitude: string;
}

const TOTAL_STEPS = 6;

export default function MorningQuizScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { 
    addJournalEntry, 
    updateJournalEntry,
    journalEntries,
    addGoal,
    awardXP,
    addSleepData
  } = useContext(AppContext);

  const quizDate = date || new Date().toISOString().split('T')[0];
  const existingEntry = journalEntries.find(entry => entry.date === quizDate && entry.type === 'morning');

  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<MorningQuizResponse>({
    sleepQuality: existingEntry?.sleepQuality || 5,
    sleepHours: existingEntry?.sleepHours || 8,
    morningFeeling: existingEntry?.morningFeeling || '',
    mainFocus: existingEntry?.mainFocus || '',
    dailyGoals: existingEntry?.dailyGoals || ['', '', ''],
    morningGratitude: existingEntry?.morningGratitude || '',
  });

  const updateResponse = (key: keyof MorningQuizResponse, value: any) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const updateDailyGoal = (index: number, value: string) => {
    const newGoals = [...responses.dailyGoals];
    newGoals[index] = value;
    updateResponse('dailyGoals', newGoals);
  };

  const addDailyGoal = () => {
    if (responses.dailyGoals.length < 5) {
      updateResponse('dailyGoals', [...responses.dailyGoals, '']);
    }
  };

  const removeDailyGoal = (index: number) => {
    if (responses.dailyGoals.length > 1) {
      const newGoals = responses.dailyGoals.filter((_, i) => i !== index);
      updateResponse('dailyGoals', newGoals);
    }
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
      case 3: // Morning feeling - optional
        return true;
      case 4: // Main focus - required
        return responses.mainFocus.trim().length > 0;
      case 5: // Daily goals - at least one required
        return responses.dailyGoals.some(goal => goal.trim().length > 0);
      default:
        return true;
    }
  };

  const completeQuiz = () => {
    // Save journal entry
    const journalData = {
      type: 'morning' as const,
      mood: 3, // Default middle value, can be updated later
      energy: 3, // Default middle value
      stress: 3, // Default middle value
      sleepQuality: responses.sleepQuality,
      sleepHours: responses.sleepHours,
      morningFeeling: responses.morningFeeling,
      mainFocus: responses.mainFocus,
      dailyGoals: responses.dailyGoals.filter(goal => goal.trim()),
      morningGratitude: responses.morningGratitude,
    };

    if (existingEntry) {
      updateJournalEntry(existingEntry.id, journalData);
    } else {
      addJournalEntry(quizDate, journalData);
    }

    // Save sleep data separately
    addSleepData({
      date: quizDate,
      hoursSlept: responses.sleepHours,
      quality: responses.sleepQuality,
    });

    // Add daily goals to goals library and today's plan
    const validGoals = responses.dailyGoals.filter(goal => goal.trim());
    validGoals.forEach(goalTitle => {
      addGoal({
        title: goalTitle.trim(),
        description: `Created from morning planning on ${format(new Date(quizDate), 'MMM d, yyyy')}`,
        addToToday: true,
      });
    });

    // Award XP for completing morning quiz
    awardXP(20, 'Morning planning completed');

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
              <Sun size={32} color={COLORS.warning[600]} />
              <Text style={styles.stepTitle}>How did you sleep last night?</Text>
              <Text style={styles.stepSubtitle}>Rate your sleep quality from 1 (terrible) to 10 (amazing)</Text>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{responses.sleepQuality}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={responses.sleepQuality}
                onValueChange={(value) => updateResponse('sleepQuality', value)}
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
              <Text style={styles.stepTitle}>How many hours did you sleep?</Text>
              <Text style={styles.stepSubtitle}>Include any naps from yesterday</Text>
            </View>
            
            <View style={styles.hoursContainer}>
              <TouchableOpacity 
                style={styles.hourButton}
                onPress={() => updateResponse('sleepHours', Math.max(1, responses.sleepHours - 0.5))}
              >
                <Minus size={24} color={COLORS.primary[600]} />
              </TouchableOpacity>
              
              <View style={styles.hoursDisplay}>
                <Text style={styles.hoursValue}>{responses.sleepHours}</Text>
                <Text style={styles.hoursLabel}>hours</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.hourButton}
                onPress={() => updateResponse('sleepHours', Math.min(16, responses.sleepHours + 0.5))}
              >
                <Plus size={24} color={COLORS.primary[600]} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Heart size={32} color={COLORS.error[500]} />
              <Text style={styles.stepTitle}>How do you feel this morning?</Text>
              <Text style={styles.stepSubtitle}>Optional: Share your current mood or energy level</Text>
            </View>
            
            <TextInput
              style={styles.textArea}
              placeholder="I feel energized and ready to tackle the day..."
              placeholderTextColor={COLORS.neutral[400]}
              value={responses.morningFeeling}
              onChangeText={(value) => updateResponse('morningFeeling', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Star size={32} color={COLORS.warning[600]} />
              <Text style={styles.stepTitle}>What's your main focus today?</Text>
              <Text style={styles.stepSubtitle}>One key priority or theme for your day</Text>
            </View>
            
            <TextInput
              style={styles.focusInput}
              placeholder="Complete the project presentation..."
              placeholderTextColor={COLORS.neutral[400]}
              value={responses.mainFocus}
              onChangeText={(value) => updateResponse('mainFocus', value)}
            />
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <CheckCircle size={32} color={COLORS.success[600]} />
              <Text style={styles.stepTitle}>What do you want to accomplish today?</Text>
              <Text style={styles.stepSubtitle}>List 3-5 specific goals (these will be added to your Today list)</Text>
            </View>
            
            <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
              {responses.dailyGoals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Text style={styles.goalNumber}>{index + 1}.</Text>
                  <TextInput
                    style={styles.goalInput}
                    placeholder={`Goal ${index + 1}...`}
                    placeholderTextColor={COLORS.neutral[400]}
                    value={goal}
                    onChangeText={(value) => updateDailyGoal(index, value)}
                  />
                  {responses.dailyGoals.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeDailyGoal(index)}
                      style={styles.removeGoalButton}
                    >
                      <X size={16} color={COLORS.error[600]} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {responses.dailyGoals.length < 5 && (
                <TouchableOpacity onPress={addDailyGoal} style={styles.addGoalButton}>
                  <Plus size={16} color={COLORS.primary[600]} />
                  <Text style={styles.addGoalText}>Add another goal</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeInRight} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Anything you're grateful for this morning?</Text>
              <Text style={styles.stepSubtitle}>Optional: Start your day with gratitude</Text>
            </View>
            
            <TextInput
              style={styles.textArea}
              placeholder="I'm grateful for my health, family, and this new opportunity..."
              placeholderTextColor={COLORS.neutral[400]}
              value={responses.morningGratitude}
              onChangeText={(value) => updateResponse('morningGratitude', value)}
              multiline
              numberOfLines={4}
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
        <Text style={styles.headerTitle}>Morning Planning</Text>
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
            title="Start My Day"
            onPress={completeQuiz}
            style={styles.completeButton}
            icon={<Sun size={20} color={COLORS.white} />}
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
    backgroundColor: COLORS.warning[500],
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
    color: COLORS.warning[600],
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
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  hourButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursDisplay: {
    alignItems: 'center',
  },
  hoursValue: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  hoursLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  textArea: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  focusInput: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  goalsList: {
    maxHeight: 300,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.success[600],
    marginRight: 12,
    width: 20,
  },
  goalInput: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  removeGoalButton: {
    marginLeft: 8,
    padding: 8,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addGoalText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
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
    backgroundColor: COLORS.warning[600],
  },
  completeButton: {
    backgroundColor: COLORS.success[600],
    minWidth: 140,
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
});