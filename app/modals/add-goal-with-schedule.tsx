import { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Switch, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { format, addDays } from 'date-fns';
import { Calendar, Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';
import ScheduleTimeSelector from '@/components/ScheduleTimeSelector';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function AddGoalWithScheduleScreen() {
  const router = useRouter();
  const { addGoal, addGoalToDate } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [addToToday, setAddToToday] = useState(true);
  const [scheduleForFuture, setScheduleForFuture] = useState(false);
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTime, setScheduleTime] = useState<{ start: string; end: string } | null>(null);
  
  // Generate next 7 days for selection
  const futureDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  const handleSave = () => {
    if (!title.trim()) return;
    
    const goalData = {
      title: title.trim(),
      description: description.trim(),
      isAutomatic,
      addToToday: addToToday && !scheduleForFuture,
    };

    if (scheduleForFuture) {
      // Create the goal first
      const goalId = addGoal(goalData);
      
      // Then add it to the selected future date with optional schedule
      addGoalToDate(goalId, selectedDate, scheduleTime || undefined);
    } else {
      addGoal(goalData);
    }
    
    router.back();
  };

  const handleScheduleConfirm = (schedule: { start: string; end: string }) => {
    if (schedule.start && schedule.end) {
      setScheduleTime(schedule);
    } else {
      setScheduleTime(null);
    }
    setShowScheduleModal(false);
  };

  const formatScheduleTime = () => {
    if (!scheduleTime) return 'No time set';
    
    const start = new Date(scheduleTime.start);
    const end = new Date(scheduleTime.end);
    
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

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
              <Text style={styles.switchLabel}>Add to today's plan</Text>
              <Switch
                value={addToToday && !scheduleForFuture}
                onValueChange={(value) => {
                  setAddToToday(value);
                  if (value) setScheduleForFuture(false);
                }}
                trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
                thumbColor={Platform.OS === 'ios' ? COLORS.white : (addToToday && !scheduleForFuture) ? COLORS.primary[200] : COLORS.neutral[100]}
                ios_backgroundColor={COLORS.neutral[300]}
                disabled={scheduleForFuture}
              />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Schedule for future day</Text>
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

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Automatic daily task</Text>
              <Switch
                value={isAutomatic}
                onValueChange={setIsAutomatic}
                trackColor={{ false: COLORS.neutral[300], true: COLORS.secondary[500] }}
                thumbColor={Platform.OS === 'ios' ? COLORS.white : isAutomatic ? COLORS.secondary[200] : COLORS.neutral[100]}
                ios_backgroundColor={COLORS.neutral[300]}
              />
            </View>
          </View>

          {scheduleForFuture && (
            <View style={styles.futureScheduleSection}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateScroll}
              >
                {futureDays.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCard,
                      date.getTime() === selectedDate.getTime() && styles.selectedDateCard
                    ]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[
                      styles.dateDayName,
                      date.getTime() === selectedDate.getTime() && styles.selectedDateText
                    ]}>
                      {format(date, 'EEE')}
                    </Text>
                    <Text style={[
                      styles.dateNumber,
                      date.getTime() === selectedDate.getTime() && styles.selectedDateText
                    ]}>
                      {format(date, 'd')}
                    </Text>
                    <Text style={[
                      styles.dateMonth,
                      date.getTime() === selectedDate.getTime() && styles.selectedDateText
                    ]}>
                      {format(date, 'MMM')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.scheduleTimeSection}>
                <Text style={styles.sectionTitle}>Schedule Time (Optional)</Text>
                <TouchableOpacity
                  style={styles.scheduleTimeButton}
                  onPress={() => setShowScheduleModal(true)}
                >
                  <Calendar size={20} color={COLORS.primary[600]} />
                  <View style={styles.scheduleTimeContent}>
                    <Text style={styles.scheduleTimeLabel}>
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </Text>
                    <Text style={styles.scheduleTimeValue}>
                      {formatScheduleTime()}
                    </Text>
                  </View>
                  <Clock size={16} color={COLORS.neutral[500]} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {isAutomatic 
                ? 'Automatic tasks will be added to every day\'s plan without requiring manual selection.'
                : scheduleForFuture
                ? 'This task will be added to the selected future date.'
                : 'This task will be available in your task library and can be added to daily plans.'
              }
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
            disabled={!title.trim()}
            style={[styles.saveButton, !title.trim() && styles.disabledButton]}
          />
        </View>
      </KeyboardAvoidingView>

      <ScheduleTimeSelector
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleConfirm}
        selectedDate={selectedDate}
        itemTitle={title || 'New Task'}
      />
    </>
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
  futureScheduleSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.accent[50],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent[500],
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
  },
  dateScroll: {
    paddingRight: 20,
    gap: 12,
  },
  dateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  selectedDateCard: {
    backgroundColor: COLORS.accent[600],
    borderColor: COLORS.accent[600],
  },
  dateDayName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  dateNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  selectedDateText: {
    color: COLORS.white,
  },
  scheduleTimeSection: {
    marginTop: 16,
  },
  scheduleTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  scheduleTimeContent: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleTimeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  scheduleTimeValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  infoContainer: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
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