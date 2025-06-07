import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Settings, CreditCard as Edit3, Star } from 'lucide-react-native';
import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { DailyEntry, CustomColumn } from '@/types';
import Button from './Button';

interface DailyPlannerTableProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DailyPlannerTable = ({ currentDate, onDateChange }: DailyPlannerTableProps) => {
  const { 
    dailyEntries, 
    plannerSettings, 
    getDailyEntry, 
    updateDailyEntry, 
    addCustomColumn,
    removeCustomColumn,
    updatePlannerSettings 
  } = useContext(AppContext);
  
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'rating'>('text');
  
  // Get the first day of the month and calculate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = subDays(monthStart, getDay(monthStart));
  const calendarEnd = addDays(monthEnd, 6 - getDay(monthEnd));
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };
  
  const handleDayPress = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let entry = getDailyEntry(dateStr);
    
    if (!entry) {
      // Create a new entry for this day
      const newEntry: DailyEntry = {
        id: `entry-${dateStr}`,
        date: dateStr,
        goals: [],
        sleep: { hours: 0, quality: 'fair' },
        meals: {},
        workouts: { completed: [], duration: 0 },
        thoughts: '',
        rating: 0,
        customFields: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Initialize custom fields
      plannerSettings.customColumns.forEach(column => {
        newEntry.customFields[column.id] = column.defaultValue || '';
      });
      
      updateDailyEntry(dateStr, newEntry);
      entry = newEntry;
    }
    
    setSelectedEntry(entry);
    setShowEntryModal(true);
  };
  
  const updateEntryField = (field: string, value: any) => {
    if (!selectedEntry) return;
    
    const updates: Partial<DailyEntry> = {};
    
    if (field.startsWith('customFields.')) {
      const customFieldKey = field.replace('customFields.', '');
      updates.customFields = {
        ...selectedEntry.customFields,
        [customFieldKey]: value,
      };
    } else if (field.startsWith('sleep.')) {
      const sleepField = field.replace('sleep.', '') as keyof DailyEntry['sleep'];
      updates.sleep = {
        ...selectedEntry.sleep,
        [sleepField]: value,
      };
    } else if (field.startsWith('meals.')) {
      const mealField = field.replace('meals.', '') as keyof DailyEntry['meals'];
      updates.meals = {
        ...selectedEntry.meals,
        [mealField]: value,
      };
    } else if (field.startsWith('workouts.')) {
      const workoutField = field.replace('workouts.', '') as keyof DailyEntry['workouts'];
      updates.workouts = {
        ...selectedEntry.workouts,
        [workoutField]: value,
      };
    } else {
      (updates as any)[field] = value;
    }
    
    updateDailyEntry(selectedEntry.date, updates);
    setSelectedEntry(prev => prev ? { ...prev, ...updates } : null);
  };
  
  const addNewColumn = () => {
    if (!newColumnName.trim()) return;
    
    const newColumn: CustomColumn = {
      id: `custom-${Date.now()}`,
      name: newColumnName.trim(),
      type: newColumnType,
      defaultValue: newColumnType === 'number' ? 0 : newColumnType === 'rating' ? 0 : '',
    };
    
    addCustomColumn(newColumn);
    setNewColumnName('');
    setNewColumnType('text');
  };
  
  const getEntryForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return getDailyEntry(dateStr);
  };
  
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return COLORS.success[500];
    if (rating >= 60) return COLORS.warning[500];
    if (rating >= 40) return COLORS.warning[600];
    return COLORS.error[500];
  };
  
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };
  
  const isToday = (day: Date) => {
    const today = new Date();
    return format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowSettingsModal(true)}
          style={styles.settingsButton}
        >
          <Settings size={20} color={COLORS.neutral[600]} />
        </TouchableOpacity>
      </View>
      
      {/* Days of week header */}
      <View style={styles.daysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.dayHeaderText}>{day}</Text>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const entry = getEntryForDay(day);
            const hasEntry = !!entry;
            const rating = entry?.rating || 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !isCurrentMonth(day) && styles.outsideMonth,
                  isToday(day) && styles.today,
                  hasEntry && styles.hasEntry,
                ]}
                onPress={() => handleDayPress(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  !isCurrentMonth(day) && styles.outsideMonthText,
                  isToday(day) && styles.todayText,
                ]}>
                  {format(day, 'd')}
                </Text>
                
                {hasEntry && (
                  <View style={styles.entryIndicators}>
                    <View style={[
                      styles.ratingDot,
                      { backgroundColor: getRatingColor(rating) }
                    ]} />
                    {entry.thoughts && (
                      <Edit3 size={8} color={COLORS.neutral[500]} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Entry Detail Modal */}
      <Modal
        visible={showEntryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEntryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedEntry ? format(new Date(selectedEntry.date), 'EEEE, MMMM d, yyyy') : ''}
            </Text>
            <TouchableOpacity
              onPress={() => setShowEntryModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedEntry && (
              <>
                {/* Goals */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Goals</Text>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    value={selectedEntry.goals.join('\n')}
                    onChangeText={(text) => updateEntryField('goals', text.split('\n').filter(g => g.trim()))}
                    placeholder="Enter your goals for this day..."
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                {/* Sleep */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Sleep</Text>
                  <View style={styles.sleepContainer}>
                    <View style={styles.sleepField}>
                      <Text style={styles.subLabel}>Hours</Text>
                      <TextInput
                        style={styles.numberInput}
                        value={selectedEntry.sleep.hours.toString()}
                        onChangeText={(text) => updateEntryField('sleep.hours', parseFloat(text) || 0)}
                        keyboardType="numeric"
                        placeholder="8"
                      />
                    </View>
                    <View style={styles.sleepField}>
                      <Text style={styles.subLabel}>Quality</Text>
                      <View style={styles.qualityButtons}>
                        {(['poor', 'fair', 'good', 'excellent'] as const).map(quality => (
                          <TouchableOpacity
                            key={quality}
                            style={[
                              styles.qualityButton,
                              selectedEntry.sleep.quality === quality && styles.selectedQuality
                            ]}
                            onPress={() => updateEntryField('sleep.quality', quality)}
                          >
                            <Text style={[
                              styles.qualityText,
                              selectedEntry.sleep.quality === quality && styles.selectedQualityText
                            ]}>
                              {quality}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
                
                {/* Meals */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Meals</Text>
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                    <View key={meal} style={styles.mealField}>
                      <Text style={styles.subLabel}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={(selectedEntry.meals as any)[meal] || ''}
                        onChangeText={(text) => updateEntryField(`meals.${meal}`, text)}
                        placeholder={`What did you have for ${meal}?`}
                      />
                    </View>
                  ))}
                </View>
                
                {/* Workouts */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Workouts</Text>
                  <TextInput
                    style={styles.textInput}
                    value={selectedEntry.workouts.notes || ''}
                    onChangeText={(text) => updateEntryField('workouts.notes', text)}
                    placeholder="Describe your workouts..."
                  />
                  <View style={styles.durationField}>
                    <Text style={styles.subLabel}>Duration (minutes)</Text>
                    <TextInput
                      style={styles.numberInput}
                      value={selectedEntry.workouts.duration.toString()}
                      onChangeText={(text) => updateEntryField('workouts.duration', parseInt(text) || 0)}
                      keyboardType="numeric"
                      placeholder="60"
                    />
                  </View>
                </View>
                
                {/* Thoughts */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Thoughts & Reflections</Text>
                  <TextInput
                    style={[styles.textInput, styles.thoughtsInput]}
                    value={selectedEntry.thoughts}
                    onChangeText={(text) => updateEntryField('thoughts', text)}
                    placeholder="How was your day? Any insights or reflections..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
                
                {/* Rating */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Daily Rating (%)</Text>
                  <View style={styles.ratingContainer}>
                    <TextInput
                      style={[styles.numberInput, styles.ratingInput]}
                      value={selectedEntry.rating.toString()}
                      onChangeText={(text) => updateEntryField('rating', Math.min(100, Math.max(0, parseInt(text) || 0)))}
                      keyboardType="numeric"
                      placeholder="85"
                    />
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => updateEntryField('rating', star * 20)}
                        >
                          <Star
                            size={24}
                            color={selectedEntry.rating >= star * 20 ? COLORS.warning[500] : COLORS.neutral[300]}
                            fill={selectedEntry.rating >= star * 20 ? COLORS.warning[500] : 'transparent'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                
                {/* Custom Fields */}
                {plannerSettings.customColumns.map(column => (
                  <View key={column.id} style={styles.fieldSection}>
                    <Text style={styles.fieldLabel}>{column.name}</Text>
                    {column.type === 'number' ? (
                      <TextInput
                        style={styles.numberInput}
                        value={(selectedEntry.customFields[column.id] || '').toString()}
                        onChangeText={(text) => updateEntryField(`customFields.${column.id}`, parseFloat(text) || 0)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    ) : column.type === 'rating' ? (
                      <View style={styles.ratingContainer}>
                        <TextInput
                          style={[styles.numberInput, styles.ratingInput]}
                          value={(selectedEntry.customFields[column.id] || 0).toString()}
                          onChangeText={(text) => updateEntryField(`customFields.${column.id}`, Math.min(100, Math.max(0, parseInt(text) || 0)))}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <View style={styles.ratingStars}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity
                              key={star}
                              onPress={() => updateEntryField(`customFields.${column.id}`, star * 20)}
                            >
                              <Star
                                size={20}
                                color={(selectedEntry.customFields[column.id] || 0) >= star * 20 ? COLORS.warning[500] : COLORS.neutral[300]}
                                fill={(selectedEntry.customFields[column.id] || 0) >= star * 20 ? COLORS.warning[500] : 'transparent'}
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <TextInput
                        style={[styles.textInput, column.type === 'multiline' && styles.multilineInput]}
                        value={selectedEntry.customFields[column.id] || ''}
                        onChangeText={(text) => updateEntryField(`customFields.${column.id}`, text)}
                        placeholder={`Enter ${column.name.toLowerCase()}...`}
                        multiline={column.type === 'multiline'}
                        numberOfLines={column.type === 'multiline' ? 3 : 1}
                      />
                    )}
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Planner Settings</Text>
            <TouchableOpacity
              onPress={() => setShowSettingsModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Custom Columns</Text>
              
              {plannerSettings.customColumns.map(column => (
                <View key={column.id} style={styles.columnItem}>
                  <View style={styles.columnInfo}>
                    <Text style={styles.columnName}>{column.name}</Text>
                    <Text style={styles.columnType}>({column.type})</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeCustomColumn(column.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              <View style={styles.addColumnSection}>
                <Text style={styles.subSectionTitle}>Add New Column</Text>
                <TextInput
                  style={styles.textInput}
                  value={newColumnName}
                  onChangeText={setNewColumnName}
                  placeholder="Column name..."
                />
                
                <View style={styles.typeSelector}>
                  {(['text', 'number', 'rating'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newColumnType === type && styles.selectedType
                      ]}
                      onPress={() => setNewColumnType(type)}
                    >
                      <Text style={[
                        styles.typeText,
                        newColumnType === type && styles.selectedTypeText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Button
                  title="Add Column"
                  onPress={addNewColumn}
                  disabled={!newColumnName.trim()}
                  style={styles.addButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: 8,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  calendarContainer: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outsideMonth: {
    backgroundColor: COLORS.neutral[50],
  },
  today: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[300],
  },
  hasEntry: {
    backgroundColor: COLORS.success[50],
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
  },
  outsideMonthText: {
    color: COLORS.neutral[400],
  },
  todayText: {
    color: COLORS.primary[700],
    fontFamily: 'Inter-Bold',
  },
  entryIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fieldSection: {
    marginVertical: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  thoughtsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  numberInput: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    width: 80,
  },
  sleepContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  sleepField: {
    flex: 1,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  qualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  selectedQuality: {
    backgroundColor: COLORS.primary[100],
    borderColor: COLORS.primary[300],
  },
  qualityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  selectedQualityText: {
    color: COLORS.primary[700],
  },
  mealField: {
    marginBottom: 12,
  },
  durationField: {
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingInput: {
    width: 60,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  settingsSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  columnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  columnInfo: {
    flex: 1,
  },
  columnName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
  },
  columnType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error[100],
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.error[600],
  },
  addColumnSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  selectedType: {
    backgroundColor: COLORS.primary[100],
    borderColor: COLORS.primary[300],
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  selectedTypeText: {
    color: COLORS.primary[700],
  },
  addButton: {
    marginTop: 12,
  },
});

export default DailyPlannerTable;