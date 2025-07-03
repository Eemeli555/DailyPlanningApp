import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { format, set, addMinutes, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { X, Clock, Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';
import { AppContext } from '@/contexts/AppContext';
import Button from './Button';

interface EnhancedScheduleGoalModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSchedule: (goalId: string, schedule: { start: string; end: string }) => void;
  selectedDate: Date;
}

// Generate time slots from 5 AM to 11 PM in 15-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 5; hour <= 23; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 15) {
      slots.push({ hour, minutes });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Smart duration suggestions based on goal type and content
const getDurationSuggestions = (goal: Goal) => {
  const baseDurations = [15, 30, 45, 60, 90, 120, 180, 240];
  
  // Smart suggestions based on goal title/description
  const title = goal.title.toLowerCase();
  const description = goal.description?.toLowerCase() || '';
  const content = `${title} ${description}`;
  
  if (content.includes('workout') || content.includes('exercise') || content.includes('gym')) {
    return [30, 45, 60, 90];
  }
  
  if (content.includes('meeting') || content.includes('call')) {
    return [15, 30, 60];
  }
  
  if (content.includes('study') || content.includes('learn') || content.includes('read')) {
    return [30, 60, 90, 120];
  }
  
  if (content.includes('write') || content.includes('blog') || content.includes('article')) {
    return [45, 60, 90, 120];
  }
  
  if (content.includes('meditation') || content.includes('mindfulness')) {
    return [10, 15, 20, 30];
  }
  
  if (content.includes('break') || content.includes('rest')) {
    return [15, 30, 45];
  }
  
  return baseDurations;
};

const EnhancedScheduleGoalModal = ({ 
  visible, 
  goal, 
  onClose, 
  onSchedule, 
  selectedDate 
}: EnhancedScheduleGoalModalProps) => {
  const { getDailyPlan } = useContext(AppContext);
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  const durationSuggestions = goal ? getDurationSuggestions(goal) : [30, 60, 90, 120];
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const existingPlan = getDailyPlan(dateStr);

  const formatTimeSlot = (slot: { hour: number; minutes: number }) => {
    return format(
      set(new Date(), { hours: slot.hour, minutes: slot.minutes }), 
      'HH:mm'
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  };

  const getEndTime = () => {
    if (!selectedTimeSlot) return '';
    
    const startTime = set(selectedDate, {
      hours: selectedTimeSlot.hour,
      minutes: selectedTimeSlot.minutes,
    });
    
    const endTime = addMinutes(startTime, selectedDuration);
    return format(endTime, 'HH:mm');
  };

  const checkForConflicts = (timeSlot: { hour: number; minutes: number }, duration: number) => {
    if (!existingPlan?.goals) return [];

    const proposedStart = set(selectedDate, {
      hours: timeSlot.hour,
      minutes: timeSlot.minutes,
    });
    const proposedEnd = addMinutes(proposedStart, duration);

    const conflicts = existingPlan.goals.filter(existingGoal => {
      if (!existingGoal.scheduledTime || existingGoal.id === goal?.id) return false;

      const existingStart = new Date(existingGoal.scheduledTime.start);
      const existingEnd = new Date(existingGoal.scheduledTime.end);

      // Check for overlap
      return (proposedStart < existingEnd && proposedEnd > existingStart);
    });

    return conflicts;
  };

  const handleTimeSlotSelect = (slot: { hour: number; minutes: number }) => {
    setSelectedTimeSlot(slot);
    
    const conflicts = checkForConflicts(slot, selectedDuration);
    setShowConflictWarning(conflicts.length > 0);
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    
    if (selectedTimeSlot) {
      const conflicts = checkForConflicts(selectedTimeSlot, duration);
      setShowConflictWarning(conflicts.length > 0);
    }
  };

  const handleSchedule = () => {
    if (!goal || !selectedTimeSlot) return;

    const conflicts = checkForConflicts(selectedTimeSlot, selectedDuration);
    
    if (conflicts.length > 0) {
      Alert.alert(
        'Schedule Conflict',
        `This time overlaps with: ${conflicts.map(g => g.title).join(', ')}. Do you want to schedule anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Schedule Anyway', onPress: proceedWithScheduling },
        ]
      );
    } else {
      proceedWithScheduling();
    }
  };

  const proceedWithScheduling = () => {
    if (!goal || !selectedTimeSlot) return;

    const startTime = set(selectedDate, {
      hours: selectedTimeSlot.hour,
      minutes: selectedTimeSlot.minutes,
    });

    const endTime = addMinutes(startTime, selectedDuration);

    onSchedule(goal.id, {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });

    onClose();
  };

  const getTimeSlotAvailability = (slot: { hour: number; minutes: number }) => {
    const conflicts = checkForConflicts(slot, selectedDuration);
    return conflicts.length === 0 ? 'available' : 'conflict';
  };

  const getSuggestedTimeSlots = () => {
    // Find available slots that don't conflict
    return TIME_SLOTS.filter(slot => {
      const conflicts = checkForConflicts(slot, selectedDuration);
      return conflicts.length === 0;
    }).slice(0, 6); // Show top 6 suggestions
  };

  const suggestedSlots = getSuggestedTimeSlots();

  if (!goal) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule Goal</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            )}
            <Text style={styles.dateText}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          {/* Smart Duration Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <Text style={styles.sectionSubtitle}>Suggested based on your goal type</Text>
            <View style={styles.durationGrid}>
              {durationSuggestions.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationOption,
                    selectedDuration === duration && styles.selectedDuration
                  ]}
                  onPress={() => handleDurationChange(duration)}
                >
                  <Text style={[
                    styles.durationText,
                    selectedDuration === duration && styles.selectedDurationText
                  ]}>
                    {formatDuration(duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Suggested Time Slots */}
          {suggestedSlots.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggested Times</Text>
              <Text style={styles.sectionSubtitle}>Available slots for your {formatDuration(selectedDuration)} goal</Text>
              <View style={styles.suggestedGrid}>
                {suggestedSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.suggestedSlot,
                      selectedTimeSlot?.hour === slot.hour && 
                      selectedTimeSlot?.minutes === slot.minutes && 
                      styles.selectedTimeSlot
                    ]}
                    onPress={() => handleTimeSlotSelect(slot)}
                  >
                    <Text style={[
                      styles.suggestedSlotText,
                      selectedTimeSlot?.hour === slot.hour && 
                      selectedTimeSlot?.minutes === slot.minutes && 
                      styles.selectedTimeSlotText
                    ]}>
                      {formatTimeSlot(slot)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* All Time Slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Available Times</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot, index) => {
                const availability = getTimeSlotAvailability(slot);
                const isSelected = selectedTimeSlot?.hour === slot.hour && 
                                 selectedTimeSlot?.minutes === slot.minutes;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.selectedTimeSlot,
                      availability === 'conflict' && styles.conflictTimeSlot,
                    ]}
                    onPress={() => handleTimeSlotSelect(slot)}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      isSelected && styles.selectedTimeSlotText,
                      availability === 'conflict' && styles.conflictTimeSlotText,
                    ]}>
                      {formatTimeSlot(slot)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Conflict Warning */}
          {showConflictWarning && selectedTimeSlot && (
            <View style={styles.warningContainer}>
              <AlertCircle size={20} color={COLORS.warning[600]} />
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Schedule Conflict</Text>
                <Text style={styles.warningText}>
                  This time overlaps with existing scheduled goals. You can still schedule it, but consider adjusting the time.
                </Text>
              </View>
            </View>
          )}

          {/* Schedule Preview */}
          {selectedTimeSlot && (
            <View style={styles.preview}>
              <View style={styles.previewHeader}>
                <Clock size={20} color={COLORS.primary[600]} />
                <Text style={styles.previewTitle}>Schedule Preview</Text>
              </View>
              <Text style={styles.previewText}>
                {formatTimeSlot(selectedTimeSlot)} - {getEndTime()}
              </Text>
              <Text style={styles.previewDuration}>
                Duration: {formatDuration(selectedDuration)}
              </Text>
              <Text style={styles.previewDate}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          <Button
            title="Schedule Goal"
            onPress={handleSchedule}
            disabled={!selectedTimeSlot}
            style={[
              styles.scheduleButton,
              !selectedTimeSlot && styles.disabledButton
            ]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  goalInfo: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  goalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 8,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    minWidth: 70,
    alignItems: 'center',
  },
  selectedDuration: {
    backgroundColor: COLORS.accent[600],
    borderColor: COLORS.accent[600],
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedDurationText: {
    color: COLORS.white,
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.success[100],
    borderWidth: 1,
    borderColor: COLORS.success[300],
    minWidth: 80,
    alignItems: 'center',
  },
  suggestedSlotText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.success[700],
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    minWidth: 60,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  conflictTimeSlot: {
    backgroundColor: COLORS.error[100],
    borderColor: COLORS.error[300],
  },
  timeSlotText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedTimeSlotText: {
    color: COLORS.white,
  },
  conflictTimeSlotText: {
    color: COLORS.error[600],
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.warning[800],
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.warning[700],
    lineHeight: 18,
  },
  preview: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[700],
    marginLeft: 8,
  },
  previewText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[800],
  },
  previewDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
    marginTop: 4,
  },
  previewDate: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
  },
  cancelButtonText: {
    color: COLORS.neutral[700],
  },
  scheduleButton: {
    flex: 1,
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
});

export default EnhancedScheduleGoalModal;