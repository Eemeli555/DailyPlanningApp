import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { format, set, addMinutes } from 'date-fns';
import { X, Clock, Calendar } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';
import Button from './Button';

interface EnhancedScheduleGoalModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSchedule: (goalId: string, schedule?: { start: string; end: string }) => void;
  selectedDate: Date;
  allowUnscheduled?: boolean;
}

// Generate time slots from 6 AM to 10 PM in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

// Duration options in minutes
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300];

const EnhancedScheduleGoalModal = ({ 
  visible, 
  goal, 
  onClose, 
  onSchedule, 
  selectedDate,
  allowUnscheduled = false
}: EnhancedScheduleGoalModalProps) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 1 hour
  const [scheduleMode, setScheduleMode] = useState<'scheduled' | 'unscheduled'>('scheduled');

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

  const handleSchedule = () => {
    if (!goal) return;

    if (scheduleMode === 'unscheduled') {
      onSchedule(goal.id); // No schedule
      return;
    }

    if (!selectedTimeSlot) return;

    const startTime = set(selectedDate, {
      hours: selectedTimeSlot.hour,
      minutes: selectedTimeSlot.minutes,
    });

    const endTime = addMinutes(startTime, selectedDuration);

    onSchedule(goal.id, {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    });
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
          <Text style={styles.title}>Schedule Task</Text>
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

          {allowUnscheduled && (
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  scheduleMode === 'scheduled' && styles.selectedMode
                ]}
                onPress={() => setScheduleMode('scheduled')}
              >
                <Clock size={16} color={scheduleMode === 'scheduled' ? COLORS.white : COLORS.neutral[600]} />
                <Text style={[
                  styles.modeText,
                  scheduleMode === 'scheduled' && styles.selectedModeText
                ]}>
                  Schedule Time
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  scheduleMode === 'unscheduled' && styles.selectedMode
                ]}
                onPress={() => setScheduleMode('unscheduled')}
              >
                <Calendar size={16} color={scheduleMode === 'unscheduled' ? COLORS.white : COLORS.neutral[600]} />
                <Text style={[
                  styles.modeText,
                  scheduleMode === 'unscheduled' && styles.selectedModeText
                ]}>
                  Add Unscheduled
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {scheduleMode === 'scheduled' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Start Time</Text>
                <View style={styles.timeGrid}>
                  {TIME_SLOTS.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedTimeSlot?.hour === slot.hour && 
                        selectedTimeSlot?.minutes === slot.minutes && 
                        styles.selectedTimeSlot
                      ]}
                      onPress={() => setSelectedTimeSlot(slot)}
                    >
                      <Text style={[
                        styles.timeSlotText,
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

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Duration</Text>
                <View style={styles.durationGrid}>
                  {DURATION_OPTIONS.map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationOption,
                        selectedDuration === duration && styles.selectedDuration
                      ]}
                      onPress={() => setSelectedDuration(duration)}
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
                </View>
              )}
            </>
          )}

          {scheduleMode === 'unscheduled' && (
            <View style={styles.unscheduledInfo}>
              <Calendar size={32} color={COLORS.accent[600]} />
              <Text style={styles.unscheduledTitle}>Add to Day Plan</Text>
              <Text style={styles.unscheduledDescription}>
                This task will be added to your day plan without a specific time. 
                You can schedule it later from your daily view.
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
            title={scheduleMode === 'scheduled' ? "Schedule Task" : "Add Task"}
            onPress={handleSchedule}
            disabled={scheduleMode === 'scheduled' && !selectedTimeSlot}
            style={[
              styles.scheduleButton,
              scheduleMode === 'scheduled' && !selectedTimeSlot && styles.disabledButton
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
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  selectedMode: {
    backgroundColor: COLORS.primary[600],
  },
  modeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  selectedModeText: {
    color: COLORS.white,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedTimeSlotText: {
    color: COLORS.white,
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
  unscheduledInfo: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.accent[50],
    borderRadius: 12,
    marginVertical: 16,
  },
  unscheduledTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.accent[800],
    marginTop: 12,
  },
  unscheduledDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.accent[600],
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
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