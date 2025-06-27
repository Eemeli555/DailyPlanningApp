import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';

const ACTIVITY_CATEGORIES = [
  { id: 'mind', name: 'Mind', icon: '🧠', color: COLORS.primary[500] },
  { id: 'body', name: 'Body', icon: '💪', color: COLORS.error[500] },
  { id: 'work', name: 'Work', icon: '💼', color: COLORS.secondary[500] },
  { id: 'creative', name: 'Creative', icon: '🎨', color: COLORS.warning[500] },
  { id: 'social', name: 'Social', icon: '👥', color: COLORS.accent[500] },
  { id: 'other', name: 'Other', icon: '⭐', color: COLORS.neutral[500] },
];

export default function AddProductiveActivityScreen() {
  const router = useRouter();
  const { addProductiveActivity } = useContext(AppContext);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mind');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  
  const selectedCategory = ACTIVITY_CATEGORIES.find(c => c.id === category);
  
  const handleSave = () => {
    if (!name.trim()) return;
    
    addProductiveActivity({
      name: name.trim(),
      description: description.trim(),
      category: category as any,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
      color: selectedCategory?.color || COLORS.primary[500],
      icon: selectedCategory?.icon || '⭐',
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
        <Text style={styles.label}>Activity Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Deep Work, Reading, Meditation"
          placeholderTextColor={COLORS.neutral[400]}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What does this activity involve?"
          placeholderTextColor={COLORS.neutral[400]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {ACTIVITY_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                category === cat.id && styles.selectedCategory,
                { borderColor: cat.color }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryName,
                category === cat.id && styles.selectedCategoryName
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Estimated Duration (Optional)</Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={[styles.input, styles.durationInput]}
            placeholder="60"
            placeholderTextColor={COLORS.neutral[400]}
            value={estimatedDuration}
            onChangeText={setEstimatedDuration}
            keyboardType="numeric"
          />
          <Text style={styles.durationUnit}>minutes</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Productive activities are reusable templates you can quickly add to your daily plan. Set an estimated duration to help with scheduling.
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
          title="Create Activity" 
          onPress={handleSave} 
          disabled={!name.trim()}
          style={[styles.saveButton, !name.trim() && styles.disabledButton]}
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
    fontSize: 24,
    marginBottom: 8,
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
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationInput: {
    flex: 1,
    marginRight: 12,
  },
  durationUnit: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
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