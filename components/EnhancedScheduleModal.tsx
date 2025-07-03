import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { format, set, addMinutes } from 'date-fns';
import { X, Clock, Calendar, Target, Activity } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import Button from './Button';

interface EnhancedScheduleModalProps {
  visible: boolean;
  item: any;
  itemType?: 'task' | 'activity';
  selectedDate: Date;
  onClose: () => void;
  onSchedule: (schedule?: { start: string; end: string }) => void;
}

// Generate time slots from 6 AM to 10 PM in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

// Duration options in minutes
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300];

const EnhancedScheduleModal = ({ 
  visible, 
  item, 
  itemType,
  selectedDate,
  onClose, 
  onSchedule 
}: EnhancedScheduleModalProps) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(
    itemType === 'activity' && item?.estimatedDuration 
      ? item.estimatedDuration 
      : 60
  );
  const [scheduleOption, setScheduleOption] = useState<'now' | 'later' | 'unscheduled'>('unscheduled');

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
    if (!item) return;

    if (scheduleOption === 'unscheduled') {
      onSchedule();
      return;
    }

    if (scheduleOption === 'later' && selectedTimeSlot) {
      const startTime = set(selectedDate, {
        hours: selectedTimeSlot.hour,
        minutes: selectedTimeSlot.minutes,
      });

      const endTime = addMinutes(startTime, selectedDuration);

      onSchedule({
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      });
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

  const canProceed = () => {
    if (scheduleOption === 'unscheduled') return true;
    if (scheduleOption === 'later') return selectedTimeSlot !== null;
    return false;
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule {itemType === 'activity' ? 'Activity' : 'Task'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.itemInfo}>
            <View style={styles.itemHeader}>
              {itemType === 'activity' ? (
                <Activity size={24} color={COLORS.accent[600]} />
              ) : (
                <Target size={24} color={COLORS.primary[600]} />
              )}
              <Text style={styles.itemTitle}>
                {itemType === 'activity' ? item.name : item.title}
              </Text>
            </View>
            {item.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}
            <Text style={styles.dateText}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When would you like to do this?</Text>
            
            <View style={styles.scheduleOptions}>
              <TouchableOpacity
                style={[
                  styles.scheduleOption,
                  scheduleOption === 'unscheduled' && styles.selectedOption
                ]}
                onPress={() => setScheduleOption('unscheduled')}
              >
                <Text style={[
                  styles.optionTitle,
                  scheduleOption === 'unscheduled' && styles.selectedOptionText
                ]}>
                  Add without scheduling
                </Text>
                <Text style={[
                  styles.optionDescription,
                  scheduleOption === 'unscheduled' && styles.selectedOptionDescription
                ]}>
                  I'll schedule it later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scheduleOption,
                  scheduleOption === 'later' && styles.selectedOption
                ]}
                onPress={() => setScheduleOption('later')}
              >
                <Text style={[
                  styles.optionTitle,
                  scheduleOption === 'later' && styles.selectedOptionText
                ]}>
                  Schedule for specific time
                </Text>
                <Text style={[
                  styles.optionDescription,
                  scheduleOption === 'later' && styles.selectedOptionDescription
                ]}>
                  Choose a time slot
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {scheduleOption === 'later' && (
            <>
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
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
          <Button
            title={scheduleOption === 'unscheduled' ? 'Add to Day' : 'Schedule'}
            onPress={handleSchedule}
            disabled={!canProceed()}
            style={[
              styles.scheduleButton,
              !canProceed() && styles.disabledButton
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
  itemInfo: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginLeft: 8,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
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
  scheduleOptions: {
    gap: 12,
  },
  scheduleOption: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedOption: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[300],
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  selectedOptionText: {
    color: COLORS.primary[800],
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  selectedOptionDescription: {
    color: COLORS.primary[700],
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

export default EnhancedScheduleModal;