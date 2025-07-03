import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { format, set, addMinutes } from 'date-fns';
import { Clock, Calendar, X } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

// Generate time slots from 6 AM to 10 PM in 30-minute intervals
const TIME_SLOTS = Array.from({ length: 32 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  return { hour, minutes };
});

// Duration options in minutes
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300];

export default function AddTaskScreen() {
  const router = useRouter();
  const { addGoal } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [addToToday, setAddToToday] = useState(true);
  const [scheduleNow, setScheduleNow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ hour: number; minutes: number } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  
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

  const handleSave = () => {
    if (!title.trim()) return;
    
    let schedule = undefined;
    
    if (scheduleNow && selectedTimeSlot) {
      const startTime = set(selectedDate, {
        hours: selectedTimeSlot.hour,
        minutes: selectedTimeSlot.minutes,
      });
      
      const endTime = addMinutes(startTime, selectedDuration);
      
      schedule = {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      };
    }
    
    addGoal({
      title: title.trim(),
      description: description.trim(),
      isAutomatic,
      addToToday,
      schedule,
    });
    
    router.back();
  };

  return (
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
            <Text style={styles.switchLabel}>Add to today's plan</Text>
            <Switch
              value={addToToday}
              onValueChange={setAddToToday}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
              thumbColor={Platform.OS === 'ios' ? COLORS.white : addToToday ? COLORS.primary[200] : COLORS.neutral[100]}
              ios_backgroundColor={COLORS.neutral[300]}
            />
          </View>

          <View style={styles.switchItem}>
            <Text style={styles.switchLabel}>Schedule this task</Text>
            <Switch
              value={scheduleNow}
              onValueChange={setScheduleNow}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.accent[500] }}
              thumbColor={Platform.OS === 'ios' ? COLORS.white : scheduleNow ? COLORS.accent[200] : COLORS.neutral[100]}
              ios_backgroundColor={COLORS.neutral[300]}
            />
          </View>
        </View>

        {/* Scheduling Section */}
        {scheduleNow && (
          <View style={styles.schedulingSection}>
            <View style={styles.schedulingHeader}>
              <Calendar size={20} color={COLORS.accent[600]} />
              <Text style={styles.schedulingTitle}>Schedule Details</Text>
            </View>

            {/* Date Selection */}
            <View style={styles.dateSection}>
              <Text style={styles.subLabel}>Date</Text>
              <View style={styles.dateSelector}>
                <Text style={styles.selectedDateText}>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Text>
                {/* For now, we'll use today's date. In a full implementation, you'd add a date picker */}
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.timeSection}>
              <Text style={styles.subLabel}>Start Time</Text>
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

            {/* Duration Selection */}
            <View style={styles.durationSection}>
              <Text style={styles.subLabel}>Duration</Text>
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

            {/* Schedule Preview */}
            {selectedTimeSlot && (
              <View style={styles.schedulePreview}>
                <View style={styles.previewHeader}>
                  <Clock size={16} color={COLORS.accent[600]} />
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
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Automatic tasks will be added to every day's plan without requiring manual selection.
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
          title="Save Task" 
          onPress={handleSave} 
          disabled={!title.trim() || (scheduleNow && !selectedTimeSlot)}
          style={[styles.saveButton, (!title.trim() || (scheduleNow && !selectedTimeSlot)) && styles.disabledButton]}
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
    padding: isSmallScreen ? 16 : 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    marginBottom: 16,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: COLORS.neutral[200],
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  schedulingSection: {
    backgroundColor: COLORS.accent[50],
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent[500],
  },
  schedulingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  schedulingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.accent[700],
  },
  dateSection: {
    marginBottom: 20,
  },
  dateSelector: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.accent[200],
  },
  selectedDateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
  },
  timeSection: {
    marginBottom: 20,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.accent[200],
    minWidth: 60,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.accent[600],
    borderColor: COLORS.accent[600],
  },
  timeSlotText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedTimeSlotText: {
    color: COLORS.white,
  },
  durationSection: {
    marginBottom: 16,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.accent[200],
    minWidth: 50,
    alignItems: 'center',
  },
  selectedDuration: {
    backgroundColor: COLORS.accent[600],
    borderColor: COLORS.accent[600],
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedDurationText: {
    color: COLORS.white,
  },
  schedulePreview: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.accent[200],
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.accent[700],
  },
  previewText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  previewDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
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
    padding: isSmallScreen ? 16 : 20,
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