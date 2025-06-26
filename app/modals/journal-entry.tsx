import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { MOOD_LABELS } from '@/constants/gamification';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';

export default function JournalEntryScreen() {
  const router = useRouter();
  const { date, mode } = useLocalSearchParams<{ date: string; mode: 'create' | 'edit' | 'view' }>();
  const { journalEntries, addJournalEntry, updateJournalEntry } = useContext(AppContext);
  
  const existingEntry = journalEntries.find(entry => entry.date === date);
  const isReadOnly = mode === 'view';
  
  const [mood, setMood] = useState(existingEntry?.mood || 3);
  const [energy, setEnergy] = useState(existingEntry?.energy || 3);
  const [stress, setStress] = useState(existingEntry?.stress || 3);
  const [reflection, setReflection] = useState(existingEntry?.reflection || '');
  const [gratitude, setGratitude] = useState<string[]>(existingEntry?.gratitude || ['']);
  const [highlights, setHighlights] = useState(existingEntry?.highlights || '');
  const [challenges, setChallenges] = useState(existingEntry?.challenges || '');
  const [tomorrowFocus, setTomorrowFocus] = useState(existingEntry?.tomorrowFocus || '');
  
  const handleSave = () => {
    if (!date) return;
    
    const entryData = {
      mood,
      energy,
      stress,
      reflection: reflection.trim(),
      gratitude: gratitude.filter(item => item.trim()),
      highlights: highlights.trim(),
      challenges: challenges.trim(),
      tomorrowFocus: tomorrowFocus.trim(),
    };
    
    if (existingEntry) {
      updateJournalEntry(existingEntry.id, entryData);
    } else {
      addJournalEntry(date, entryData);
    }
    
    router.back();
  };
  
  const addGratitudeItem = () => {
    setGratitude([...gratitude, '']);
  };
  
  const removeGratitudeItem = (index: number) => {
    setGratitude(gratitude.filter((_, i) => i !== index));
  };
  
  const updateGratitudeItem = (index: number, value: string) => {
    const updated = [...gratitude];
    updated[index] = value;
    setGratitude(updated);
  };

  const MoodSelector = ({ 
    title, 
    value, 
    onChange, 
    labels 
  }: { 
    title: string; 
    value: number; 
    onChange: (value: number) => void;
    labels: string[];
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <View style={styles.moodButtons}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const moodData = MOOD_LABELS.find(m => m.value === rating);
          const isSelected = value === rating;
          
          return (
            <TouchableOpacity
              key={rating}
              style={[
                styles.moodButton,
                isSelected && styles.selectedMoodButton,
                { borderColor: moodData?.color || COLORS.neutral[300] }
              ]}
              onPress={() => !isReadOnly && onChange(rating)}
              disabled={isReadOnly}
            >
              <Text style={styles.moodEmoji}>{moodData?.emoji || '😐'}</Text>
              <Text style={[
                styles.moodLabel,
                isSelected && styles.selectedMoodLabel
              ]}>
                {labels[rating - 1]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {format(new Date(date || new Date()), 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {mode === 'create' ? 'New Entry' : mode === 'edit' ? 'Edit Entry' : 'Journal Entry'}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        {/* Mood Tracking */}
        <MoodSelector
          title="How are you feeling?"
          value={mood}
          onChange={setMood}
          labels={['Terrible', 'Poor', 'Okay', 'Good', 'Excellent']}
        />
        
        <MoodSelector
          title="Energy Level"
          value={energy}
          onChange={setEnergy}
          labels={['Drained', 'Low', 'Moderate', 'High', 'Energized']}
        />
        
        <MoodSelector
          title="Stress Level"
          value={stress}
          onChange={setStress}
          labels={['Overwhelmed', 'High', 'Moderate', 'Low', 'Relaxed']}
        />
        
        {/* Reflection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reflection</Text>
          <TextInput
            style={[styles.textArea, isReadOnly && styles.readOnlyInput]}
            placeholder="How was your day? What's on your mind?"
            placeholderTextColor={COLORS.neutral[400]}
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isReadOnly}
          />
        </View>
        
        {/* Gratitude */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gratitude</Text>
            {!isReadOnly && (
              <TouchableOpacity onPress={addGratitudeItem} style={styles.addButton}>
                <Plus size={16} color={COLORS.primary[600]} />
              </TouchableOpacity>
            )}
          </View>
          
          {gratitude.map((item, index) => (
            <View key={index} style={styles.gratitudeItem}>
              <TextInput
                style={[styles.input, isReadOnly && styles.readOnlyInput]}
                placeholder={`What are you grateful for? #${index + 1}`}
                placeholderTextColor={COLORS.neutral[400]}
                value={item}
                onChangeText={(value) => updateGratitudeItem(index, value)}
                editable={!isReadOnly}
              />
              {!isReadOnly && gratitude.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeGratitudeItem(index)}
                  style={styles.removeButton}
                >
                  <X size={16} color={COLORS.error[600]} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        
        {/* Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Highlights</Text>
          <TextInput
            style={[styles.textArea, isReadOnly && styles.readOnlyInput]}
            placeholder="What were the best parts of your day?"
            placeholderTextColor={COLORS.neutral[400]}
            value={highlights}
            onChangeText={setHighlights}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isReadOnly}
          />
        </View>
        
        {/* Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges & Lessons</Text>
          <TextInput
            style={[styles.textArea, isReadOnly && styles.readOnlyInput]}
            placeholder="What challenges did you face? What did you learn?"
            placeholderTextColor={COLORS.neutral[400]}
            value={challenges}
            onChangeText={setChallenges}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isReadOnly}
          />
        </View>
        
        {/* Tomorrow's Focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tomorrow's Focus</Text>
          <TextInput
            style={[styles.input, isReadOnly && styles.readOnlyInput]}
            placeholder="What's your main focus for tomorrow?"
            placeholderTextColor={COLORS.neutral[400]}
            value={tomorrowFocus}
            onChangeText={setTomorrowFocus}
            editable={!isReadOnly}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Cancel" 
          onPress={() => router.back()} 
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        {!isReadOnly && (
          <Button 
            title={existingEntry ? "Update Entry" : "Save Entry"} 
            onPress={handleSave} 
            style={styles.saveButton}
          />
        )}
        {isReadOnly && (
          <Button 
            title="Edit Entry" 
            onPress={() => router.setParams({ mode: 'edit' })} 
            style={styles.saveButton}
          />
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
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
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedMoodButton: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[300],
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  selectedMoodLabel: {
    color: COLORS.primary[700],
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
  },
  textArea: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    height: 100,
  },
  readOnlyInput: {
    backgroundColor: COLORS.neutral[50],
    color: COLORS.neutral[700],
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.neutral[700],
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});