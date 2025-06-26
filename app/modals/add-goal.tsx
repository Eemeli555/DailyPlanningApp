import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';

export default function AddGoalScreen() {
  const router = useRouter();
  const { addGoal } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [addToToday, setAddToToday] = useState(true);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    addGoal({
      title: title.trim(),
      description: description.trim(),
      isAutomatic,
      addToToday,
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
        <Text style={styles.label}>Goal Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter goal title"
          placeholderTextColor={COLORS.neutral[400]}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />
        
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter goal description"
          placeholderTextColor={COLORS.neutral[400]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <View style={styles.switchContainer}>  
          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Add to today's plan</Text>
            <Switch
              value={addToToday}
              onValueChange={setAddToToday}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Automatic goals will be added to every day's plan without requiring manual selection.
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
          title="Save Goal" 
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
  },
  input: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  switchContainer: {
    marginVertical: 8,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[800],
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