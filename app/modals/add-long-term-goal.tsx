import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, X, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { GOAL_CATEGORIES } from '@/constants/gamification';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';

export default function AddLongTermGoalScreen() {
  const router = useRouter();
  const { addLongTermGoal } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState(['']);
  
  const selectedCategory = GOAL_CATEGORIES.find(c => c.id === category);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    addLongTermGoal({
      title: title.trim(),
      description: description.trim(),
      category: category as any,
      priority,
      deadline: deadline || undefined,
      subtasks: subtasks.filter(task => task.trim()),
      color: selectedCategory?.color || COLORS.primary[500],
    });
    
    router.back();
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index: number, value: string) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Goal Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Learn a new language"
          placeholderTextColor={COLORS.neutral[400]}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What does achieving this goal mean to you?"
          placeholderTextColor={COLORS.neutral[400]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {GOAL_CATEGORIES.map((cat) => (
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
        
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityContainer}>
          {(['low', 'medium', 'high'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityButton,
                priority === p && styles.selectedPriority,
                { borderColor: p === 'high' ? COLORS.error[500] : p === 'medium' ? COLORS.warning[500] : COLORS.success[500] }
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[
                styles.priorityText,
                priority === p && styles.selectedPriorityText
              ]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Deadline (Optional)</Text>
        <View style={styles.deadlineContainer}>
          <Calendar size={20} color={COLORS.neutral[500]} />
          <TextInput
            style={styles.deadlineInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.neutral[400]}
            value={deadline}
            onChangeText={setDeadline}
          />
        </View>
        
        <Text style={styles.label}>Subtasks</Text>
        <View style={styles.subtasksContainer}>
          {subtasks.map((subtask, index) => (
            <View key={index} style={styles.subtaskItem}>
              <TextInput
                style={styles.subtaskInput}
                placeholder={`Subtask ${index + 1}`}
                placeholderTextColor={COLORS.neutral[400]}
                value={subtask}
                onChangeText={(value) => updateSubtask(index, value)}
              />
              {subtasks.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeSubtask(index)}
                  style={styles.removeButton}
                >
                  <X size={16} color={COLORS.error[600]} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity onPress={addSubtask} style={styles.addSubtaskButton}>
            <Plus size={16} color={COLORS.primary[600]} />
            <Text style={styles.addSubtaskText}>Add Subtask</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Break down your goal into smaller, actionable subtasks to track progress more effectively.
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
          title="Create Goal" 
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
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedPriority: {
    backgroundColor: COLORS.primary[50],
  },
  priorityText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedPriorityText: {
    color: COLORS.primary[700],
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  deadlineInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    marginLeft: 8,
  },
  subtasksContainer: {
    marginBottom: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
  addSubtaskButton: {
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
  addSubtaskText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
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