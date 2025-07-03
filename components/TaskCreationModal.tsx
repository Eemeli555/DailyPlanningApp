import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { format, addDays } from 'date-fns';
import { Calendar, Clock, Target } from 'lucide-react-native';

import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from './Button';
import EnhancedScheduleModal from './EnhancedScheduleModal';

interface TaskCreationModalProps {
  onClose: () => void;
}

const TaskCreationModal = ({ onClose }: TaskCreationModalProps) => {
  const router = useRouter();
  const { addGoal, addGoalToDate } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [addToToday, setAddToToday] = useState(true);
  const [scheduleForFuture, setScheduleForFuture] = useState(false);
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [pendingTask, setPendingTask] = useState<any>(null);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      isAutomatic,
      addToToday: addToToday && !scheduleForFuture,
    };

    if (scheduleForFuture) {
      // Create the task first, then schedule it
      const newTask = addGoal(taskData);
      setPendingTask(newTask);
      setShowScheduleModal(true);
    } else {
      addGoal(taskData);
      onClose();
    }
  };

  const handleScheduleConfirm = (schedule?: { start: string; end: string }) => {
    if (pendingTask) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      addGoalToDate(pendingTask.id, dateStr, schedule);
    }
    setShowScheduleModal(false);
    setPendingTask(null);
    onClose();
  };

  const futureDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task title"
            placeholderTextColor={COLORS.neutral[400]}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            placeholderTextColor={COLORS.neutral[400]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <View style={styles.switchContainer}>
            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Automatic daily task</Text>
                <Text style={styles.switchDescription}>
                  Add this task to every day automatically
                </Text>
              </View>
              <Switch
                value={isAutomatic}
                onValueChange={setIsAutomatic}
                trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
                thumbColor={Platform.OS === 'ios' ? COLORS.white : isAutomatic ? COLORS.primary[200] : COLORS.neutral[100]}
                ios_backgroundColor={COLORS.neutral[300]}
              />
            </View>

            {!isAutomatic && (
              <>
                <View style={styles.switchItem}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Add to today's plan</Text>
                    <Text style={styles.switchDescription}>
                      Include this task in today's tasks
                    </Text>
                  </View>
                  <Switch
                    value={addToToday && !scheduleForFuture}
                    onValueChange={(value) => {
                      setAddToToday(value);
                      if (value) setScheduleForFuture(false);
                    }}
                    trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
                    thumbColor={Platform.OS === 'ios' ? COLORS.white : (addToToday && !scheduleForFuture) ? COLORS.primary[200] : COLORS.neutral[100]}
                    ios_backgroundColor={COLORS.neutral[300]}
                  />
                </View>

                <View style={styles.switchItem}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>Schedule for future day</Text>
                    <Text style={styles.switchDescription}>
                      Add this task to a specific future date
                    </Text>
                  </View>
                  <Switch
                    value={scheduleForFuture}
                    onValueChange={(value) => {
                      setScheduleForFuture(value);
                      if (value) setAddToToday(false);
                    }}
                    trackColor={{ false: COLORS.neutral[300], true: COLORS.accent[500] }}
                    thumbColor={Platform.OS === 'ios' ? COLORS.white : scheduleForFuture ? COLORS.accent[200] : COLORS.neutral[100]}
                    ios_backgroundColor={COLORS.neutral[300]}
                  />
                </View>

                {scheduleForFuture && (
                  <View style={styles.dateSelection}>
                    <Text style={styles.dateSelectionTitle}>Select Date</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.dateScroll}
                    >
                      {futureDates.map((date, index) => {
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.dateCard,
                              isSelected && styles.selectedDateCard
                            ]}
                            onPress={() => setSelectedDate(date)}
                          >
                            <Text style={[
                              styles.dateDayName,
                              isSelected && styles.selectedDateText
                            ]}>
                              {format(date, 'EEE')}
                            </Text>
                            <Text style={[
                              styles.dateNumber,
                              isSelected && styles.selectedDateText
                            ]}>
                              {format(date, 'd')}
                            </Text>
                            <Text style={[
                              styles.dateMonth,
                              isSelected && styles.selectedDateText
                            ]}>
                              {format(date, 'MMM')}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <Target size={16} color={COLORS.primary[600]} />
            <Text style={styles.infoText}>
              {isAutomatic 
                ? 'Automatic tasks will be added to every day\'s plan without requiring manual selection.'
                : scheduleForFuture
                ? `This task will be added to ${format(selectedDate, 'EEEE, MMMM d')} and you can optionally schedule a specific time.`
                : addToToday
                ? 'This task will be added to today\'s plan and available in your task library.'
                : 'This task will be saved to your task library for future use.'
              }
            </Text>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button 
            title="Cancel" 
            onPress={onClose} 
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          <Button 
            title={scheduleForFuture ? "Create & Schedule" : "Create Task"} 
            onPress={handleSave} 
            disabled={!title.trim()}
            style={[styles.saveButton, !title.trim() && styles.disabledButton]}
            icon={scheduleForFuture ? <Clock size={16} color={COLORS.white} /> : undefined}
          />
        </View>
      </KeyboardAvoidingView>

      <EnhancedScheduleModal
        visible={showScheduleModal}
        item={pendingTask}
        itemType="task"
        selectedDate={selectedDate}
        onClose={() => {
          setShowScheduleModal(false);
          setPendingTask(null);
          onClose();
        }}
        onSchedule={handleScheduleConfirm}
      />
    </>
  );
};

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
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: COLORS.neutral[200],
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  switchContainer: {
    marginVertical: 16,
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  dateSelection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  dateSelectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  dateScroll: {
    gap: 8,
  },
  dateCard: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateCard: {
    backgroundColor: COLORS.accent[600],
    borderColor: COLORS.accent[700],
  },
  dateDayName: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  selectedDateText: {
    color: COLORS.white,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
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
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
});

export default TaskCreationModal;