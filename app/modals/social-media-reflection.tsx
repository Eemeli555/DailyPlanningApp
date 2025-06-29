import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Smartphone, Heart, Target, Plus, X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';
import { formatUsageTime } from '@/utils/socialMediaTracking';

export default function SocialMediaReflectionScreen() {
  const router = useRouter();
  const { date, totalUsage } = useLocalSearchParams<{ date: string; totalUsage: string }>();
  const { addSocialMediaReflection, awardXP } = useContext(AppContext);
  
  const [meaningfulnessRating, setMeaningfulnessRating] = useState(3);
  const [wasDistraction, setWasDistraction] = useState<boolean | null>(null);
  const [distractionFromWhat, setDistractionFromWhat] = useState('');
  const [alternativeActivities, setAlternativeActivities] = useState(['']);
  const [tomorrowGoals, setTomorrowGoals] = useState(['']);

  const usageMinutes = totalUsage ? parseInt(totalUsage) : 0;
  const reflectionDate = date || new Date().toISOString().split('T')[0];

  const addAlternativeActivity = () => {
    setAlternativeActivities([...alternativeActivities, '']);
  };

  const removeAlternativeActivity = (index: number) => {
    if (alternativeActivities.length > 1) {
      setAlternativeActivities(alternativeActivities.filter((_, i) => i !== index));
    }
  };

  const updateAlternativeActivity = (index: number, value: string) => {
    const updated = [...alternativeActivities];
    updated[index] = value;
    setAlternativeActivities(updated);
  };

  const addTomorrowGoal = () => {
    setTomorrowGoals([...tomorrowGoals, '']);
  };

  const removeTomorrowGoal = (index: number) => {
    if (tomorrowGoals.length > 1) {
      setTomorrowGoals(tomorrowGoals.filter((_, i) => i !== index));
    }
  };

  const updateTomorrowGoal = (index: number, value: string) => {
    const updated = [...tomorrowGoals];
    updated[index] = value;
    setTomorrowGoals(updated);
  };

  const handleSave = () => {
    addSocialMediaReflection({
      date: reflectionDate,
      totalUsageMinutes: usageMinutes,
      meaningfulnessRating,
      wasDistraction: wasDistraction || false,
      distractionFromWhat: distractionFromWhat.trim() || undefined,
      alternativeActivities: alternativeActivities.filter(activity => activity.trim()),
      tomorrowGoals: tomorrowGoals.filter(goal => goal.trim()),
    });

    // Award XP for reflection
    awardXP(15, 'Social media reflection completed');

    router.back();
  };

  const getMeaningfulnessLabel = (rating: number) => {
    const labels = ['Not at all', 'Slightly', 'Somewhat', 'Quite', 'Very meaningful'];
    return labels[rating - 1] || 'Somewhat';
  };

  const getMeaningfulnessColor = (rating: number) => {
    if (rating >= 4) return COLORS.success[600];
    if (rating >= 3) return COLORS.warning[500];
    return COLORS.error[600];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Smartphone size={24} color={COLORS.primary[600]} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Social Media Reflection</Text>
          <Text style={styles.headerSubtitle}>
            {format(new Date(reflectionDate), 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Usage Summary */}
        <View style={styles.usageSummary}>
          <Text style={styles.usageTitle}>Today's Screen Time</Text>
          <Text style={styles.usageTime}>{formatUsageTime(usageMinutes)}</Text>
          <Text style={styles.usageSubtext}>across social media apps</Text>
        </View>

        {/* Meaningfulness Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How meaningful was your social media time today?</Text>
          <Text style={styles.sectionSubtitle}>
            Consider whether it helped you connect, learn, or feel inspired
          </Text>
          
          <View style={styles.sliderContainer}>
            <Text style={[
              styles.sliderValue,
              { color: getMeaningfulnessColor(meaningfulnessRating) }
            ]}>
              {getMeaningfulnessLabel(meaningfulnessRating)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={meaningfulnessRating}
              onValueChange={setMeaningfulnessRating}
              minimumTrackTintColor={getMeaningfulnessColor(meaningfulnessRating)}
              maximumTrackTintColor={COLORS.neutral[300]}
              thumbStyle={{ backgroundColor: getMeaningfulnessColor(meaningfulnessRating) }}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Not meaningful</Text>
              <Text style={styles.sliderLabel}>Very meaningful</Text>
            </View>
          </View>
        </View>

        {/* Distraction Check */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Was any of it a distraction?</Text>
          <Text style={styles.sectionSubtitle}>
            Did social media pull you away from something else you wanted to do?
          </Text>
          
          <View style={styles.binaryChoice}>
            <TouchableOpacity
              style={[
                styles.choiceButton,
                wasDistraction === true && styles.selectedChoice
              ]}
              onPress={() => setWasDistraction(true)}
            >
              <Text style={[
                styles.choiceText,
                wasDistraction === true && styles.selectedChoiceText
              ]}>
                Yes, it was distracting
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.choiceButton,
                wasDistraction === false && styles.selectedChoice
              ]}
              onPress={() => setWasDistraction(false)}
            >
              <Text style={[
                styles.choiceText,
                wasDistraction === false && styles.selectedChoiceText
              ]}>
                No, it was intentional
              </Text>
            </TouchableOpacity>
          </View>

          {wasDistraction === true && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpLabel}>What did it distract you from?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., work, exercise, reading, spending time with family..."
                placeholderTextColor={COLORS.neutral[400]}
                value={distractionFromWhat}
                onChangeText={setDistractionFromWhat}
                multiline
                numberOfLines={2}
              />
            </View>
          )}
        </View>

        {/* Alternative Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to do more of instead?</Text>
          <Text style={styles.sectionSubtitle}>
            Think of activities that would be more fulfilling or aligned with your goals
          </Text>
          
          {alternativeActivities.map((activity, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, styles.flexInput]}
                placeholder={`Alternative activity ${index + 1}...`}
                placeholderTextColor={COLORS.neutral[400]}
                value={activity}
                onChangeText={(value) => updateAlternativeActivity(index, value)}
              />
              {alternativeActivities.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeAlternativeActivity(index)}
                  style={styles.removeButton}
                >
                  <X size={16} color={COLORS.error[600]} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity onPress={addAlternativeActivity} style={styles.addButton}>
            <Plus size={16} color={COLORS.primary[600]} />
            <Text style={styles.addButtonText}>Add another activity</Text>
          </TouchableOpacity>
        </View>

        {/* Tomorrow's Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals for tomorrow's digital wellness</Text>
          <Text style={styles.sectionSubtitle}>
            Set specific intentions for how you want to use social media tomorrow
          </Text>
          
          {tomorrowGoals.map((goal, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, styles.flexInput]}
                placeholder={`Tomorrow's goal ${index + 1}...`}
                placeholderTextColor={COLORS.neutral[400]}
                value={goal}
                onChangeText={(value) => updateTomorrowGoal(index, value)}
              />
              {tomorrowGoals.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeTomorrowGoal(index)}
                  style={styles.removeButton}
                >
                  <X size={16} color={COLORS.error[600]} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity onPress={addTomorrowGoal} style={styles.addButton}>
            <Plus size={16} color={COLORS.primary[600]} />
            <Text style={styles.addButtonText}>Add another goal</Text>
          </TouchableOpacity>
        </View>

        {/* Inspiration */}
        <View style={styles.inspirationCard}>
          <Heart size={20} color={COLORS.success[600]} />
          <Text style={styles.inspirationText}>
            "The goal isn't to eliminate social media, but to use it more intentionally and mindfully."
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Cancel" 
          onPress={() => router.back()} 
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        <Button 
          title="Complete Reflection" 
          onPress={handleSave} 
          style={styles.saveButton}
          icon={<Target size={16} color={COLORS.white} />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  usageSummary: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  usageTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[700],
    marginBottom: 8,
  },
  usageTime: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[800],
    marginBottom: 4,
  },
  usageSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 20,
    lineHeight: 20,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
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
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
  },
  binaryChoice: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedChoice: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[300],
  },
  choiceText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    textAlign: 'center',
  },
  selectedChoiceText: {
    color: COLORS.primary[700],
  },
  followUpContainer: {
    marginTop: 16,
  },
  followUpLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  inspirationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success[50],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success[500],
    gap: 12,
  },
  inspirationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.success[700],
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
  },
  cancelButtonText: {
    color: COLORS.neutral[700],
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.success[600],
  },
});