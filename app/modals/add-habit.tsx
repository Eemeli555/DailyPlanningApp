import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { HABIT_CATEGORIES } from '@/constants/gamification';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';

export default function AddHabitScreen() {
  const router = useRouter();
  const { addHabit } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetCount, setTargetCount] = useState('');
  const [unit, setUnit] = useState('');
  
  const selectedCategory = HABIT_CATEGORIES.find(c => c.id === category);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    addHabit({
      title: title.trim(),
      description: description.trim(),
      category: category as any,
      frequency,
      targetCount: targetCount ? parseInt(targetCount) : undefined,
      unit: unit.trim() || undefined,
      color: selectedCategory?.color || COLORS.primary[500],
      icon: selectedCategory?.icon || 'Star',
    });
    
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Habit Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Drink 8 glasses of water"
          placeholderTextColor={COLORS.neutral[400]}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Why is this habit important to you?"
          placeholderTextColor={COLORS.neutral[400]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {HABIT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                category === cat.id && styles.selectedCategory,
                { borderColor: cat.color }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                <Text style={styles.categoryIconText}>{cat.icon}</Text>
              </View>
              <Text style={[
                styles.categoryName,
                category === cat.id && styles.selectedCategoryName
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyContainer}>
          <TouchableOpacity
            style={[
              styles.frequencyButton,
              frequency === 'daily' && styles.selectedFrequency
            ]}
            onPress={() => setFrequency('daily')}
          >
            <Text style={[
              styles.frequencyText,
              frequency === 'daily' && styles.selectedFrequencyText
            ]}>
              Daily
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.frequencyButton,
              frequency === 'weekly' && styles.selectedFrequency
            ]}
            onPress={() => setFrequency('weekly')}
          >
            <Text style={[
              styles.frequencyText,
              frequency === 'weekly' && styles.selectedFrequencyText
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.label}>Target & Unit (Optional)</Text>
        <View style={styles.targetContainer}>
          <TextInput
            style={[styles.input, styles.targetInput]}
            placeholder="8"
            placeholderTextColor={COLORS.neutral[400]}
            value={targetCount}
            onChangeText={setTargetCount}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.unitInput]}
            placeholder="glasses"
            placeholderTextColor={COLORS.neutral[400]}
            value={unit}
            onChangeText={setUnit}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Set a target count and unit to track measurable progress (e.g., "8 glasses of water", "30 minutes of exercise").
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
          title="Create Habit" 
          onPress={handleSave} 
          disabled={!title.trim()}
          style={[styles.saveButton, !title.trim() && styles.disabledButton]}
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
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedCategory: {
    backgroundColor: COLORS.primary[50],
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconText: {
    fontSize: 16,
    color: COLORS.white,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: COLORS.primary[700],
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: COLORS.primary[600],
  },
  frequencyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedFrequencyText: {
    color: COLORS.white,
  },
  targetContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  targetInput: {
    flex: 1,
  },
  unitInput: {
    flex: 2,
  },
  infoContainer: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
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
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
});