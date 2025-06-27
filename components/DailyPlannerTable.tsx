import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Settings, CreditCard as Edit3, Star, Calendar } from 'lucide-react-native';
import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import { DailyEntry, CustomColumn } from '@/types';
import Button from './Button';

interface DailyPlannerTableProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

const DailyPlannerTable = ({ currentDate, onDateChange }: DailyPlannerTableProps) => {
  const { 
    dailyEntries, 
    plannerSettings, 
    getDailyEntry, 
    updateDailyEntry, 
    addCustomColumn,
    removeCustomColumn,
    updatePlannerSettings,
    dailyPlans,
    todaysGoals,
    habits,
    habitEntries,
    journalEntries,
    sleepData,
    socialMediaData,
    productiveActivities,
    activityEntries
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
  
  // Group days into weeks for the board layout
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
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
      // Create a comprehensive entry combining all data sources
      const dayPlan = dailyPlans.find(plan => plan.date === dateStr);
      const dayJournal = journalEntries.find(journal => journal.date === dateStr);
      const daySleep = sleepData.find(sleep => sleep.date === dateStr);
      const daySocial = socialMediaData.find(social => social.date === dateStr);
      const dayHabits = habitEntries.filter(entry => entry.date === dateStr);
      const dayActivities = activityEntries.filter(entry => entry.date === dateStr);
      
      const newEntry: DailyEntry = {
        id: `entry-${dateStr}`,
        date: dateStr,
        goals: dayPlan?.goals.map(g => g.title) || [],
        sleep: { 
          hours: daySleep?.hoursSlept || 0, 
          quality: daySleep ? (daySleep.quality <= 5 ? 'poor' : daySleep.quality <= 7 ? 'fair' : daySleep.quality <= 8 ? 'good' : 'excellent') : 'fair',
          notes: daySleep?.notes
        },
        meals: {},
        workouts: { completed: [], duration: 0 },
        thoughts: dayJournal?.reflection || '',
        rating: dayPlan ? Math.round(dayPlan.progress * 100) : 0,
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
    let entry = getDailyEntry(dateStr);
    
    // If no entry exists, create one from available data
    if (!entry) {
      const dayPlan = dailyPlans.find(plan => plan.date === dateStr);
      const dayJournal = journalEntries.find(journal => journal.date === dateStr);
      const daySleep = sleepData.find(sleep => sleep.date === dateStr);
      const daySocial = socialMediaData.find(social => social.date === dateStr);
      
      if (dayPlan || dayJournal || daySleep || daySocial) {
        entry = {
          id: `temp-${dateStr}`,
          date: dateStr,
          goals: dayPlan?.goals.map(g => g.title) || [],
          sleep: { 
            hours: daySleep?.hoursSlept || 0, 
            quality: daySleep ? (daySleep.quality <= 5 ? 'poor' : daySleep.quality <= 7 ? 'fair' : daySleep.quality <= 8 ? 'good' : 'excellent') : 'fair'
          },
          meals: {},
          workouts: { completed: [], duration: 0 },
          thoughts: dayJournal?.reflection || '',
          rating: dayPlan ? Math.round(dayPlan.progress * 100) : (dayJournal?.mood ? dayJournal.mood * 20 : 0),
          customFields: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }
    
    return entry;
  };
  
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return COLORS.success[500];
    if (rating >= 60) return COLORS.warning[500];
    if (rating >= 40) return COLORS.warning[600];
    return COLORS.error[500];
  };
  
  const getSleepQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return COLORS.success[500];
      case 'good': return COLORS.success[400];
      case 'fair': return COLORS.warning[500];
      case 'poor': return COLORS.error[500];
      default: return COLORS.neutral[400];
    }
  };

  const renderTableHeader = () => (
    <View style={[styles.tableHeader, isTablet && styles.tableHeaderTablet]}>
      <View style={[styles.headerCell, styles.dateColumn, isTablet && styles.dateColumnTablet]}>
        <Text style={styles.headerText}>Date</Text>
      </View>
      <View style={[styles.headerCell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
        <Text style={styles.headerText}>Rating</Text>
      </View>
      <View style={[styles.headerCell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
        <Text style={styles.headerText}>Sleep</Text>
      </View>
      <View style={[styles.headerCell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
        <Text style={styles.headerText}>Goals</Text>
      </View>
      <View style={[styles.headerCell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
        <Text style={styles.headerText}>Mood</Text>
      </View>
      <View style={[styles.headerCell, styles.notesColumn, isTablet && styles.notesColumnTablet]}>
        <Text style={styles.headerText}>Notes</Text>
      </View>
      {plannerSettings.customColumns.map(column => (
        <View key={column.id} style={[styles.headerCell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
          <Text style={styles.headerText}>{column.name}</Text>
        </View>
      ))}
    </View>
  );

  const renderTableRow = (day: Date, index: number) => {
    const entry = getEntryForDay(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isTodayDate = isToday(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // Get additional data for this day
    const dayPlan = dailyPlans.find(plan => plan.date === dateStr);
    const dayJournal = journalEntries.find(journal => journal.date === dateStr);
    const daySleep = sleepData.find(sleep => sleep.date === dateStr);
    const dayHabits = habitEntries.filter(habitEntry => habitEntry.date === dateStr);
    const completedHabits = dayHabits.filter(h => h.completed).length;
    const totalHabits = habits.filter(h => h.isActive).length;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.tableRow,
          isTablet && styles.tableRowTablet,
          !isCurrentMonth && styles.outsideMonthRow,
          isTodayDate && styles.todayRow,
          entry && styles.hasDataRow,
        ]}
        onPress={() => handleDayPress(day)}
      >
        {/* Date Column */}
        <View style={[styles.cell, styles.dateColumn, isTablet && styles.dateColumnTablet]}>
          <View style={styles.dateContainer}>
            <Text style={[
              styles.dayNumber,
              !isCurrentMonth && styles.outsideMonthText,
              isTodayDate && styles.todayText,
            ]}>
              {format(day, 'd')}
            </Text>
            <Text style={[
              styles.dayName,
              !isCurrentMonth && styles.outsideMonthText,
            ]}>
              {format(day, 'EEE')}
            </Text>
          </View>
        </View>

        {/* Rating Column */}
        <View style={[styles.cell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
          {entry?.rating ? (
            <View style={styles.ratingContainer}>
              <View style={[
                styles.ratingBadge,
                { backgroundColor: getRatingColor(entry.rating) }
              ]}>
                <Text style={styles.ratingText}>{entry.rating}%</Text>
              </View>
            </View>
          ) : dayPlan ? (
            <View style={styles.ratingContainer}>
              <View style={[
                styles.ratingBadge,
                { backgroundColor: getRatingColor(Math.round(dayPlan.progress * 100)) }
              ]}>
                <Text style={styles.ratingText}>{Math.round(dayPlan.progress * 100)}%</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyCell}>—</Text>
          )}
        </View>

        {/* Sleep Column */}
        <View style={[styles.cell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
          {entry?.sleep.hours || daySleep ? (
            <View style={styles.sleepContainer}>
              <Text style={styles.sleepHours}>
                {entry?.sleep.hours || daySleep?.hoursSlept || 0}h
              </Text>
              <View style={[
                styles.qualityDot,
                { backgroundColor: getSleepQualityColor(entry?.sleep.quality || 'fair') }
              ]} />
            </View>
          ) : (
            <Text style={styles.emptyCell}>—</Text>
          )}
        </View>

        {/* Goals Column */}
        <View style={[styles.cell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
          {dayPlan?.goals.length ? (
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsCount}>
                {dayPlan.goalsCompleted}/{dayPlan.goals.length}
              </Text>
              <Text style={styles.goalsLabel}>goals</Text>
            </View>
          ) : entry?.goals.length ? (
            <View style={styles.goalsContainer}>
              <Text style={styles.goalsCount}>{entry.goals.length}</Text>
              <Text style={styles.goalsLabel}>goals</Text>
            </View>
          ) : (
            <Text style={styles.emptyCell}>—</Text>
          )}
        </View>

        {/* Mood Column */}
        <View style={[styles.cell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
          {dayJournal?.mood ? (
            <View style={styles.moodContainer}>
              <Text style={styles.moodValue}>{dayJournal.mood}/5</Text>
              <Text style={styles.moodEmoji}>
                {dayJournal.mood >= 4 ? '😊' : dayJournal.mood >= 3 ? '😐' : '😕'}
              </Text>
            </View>
          ) : totalHabits > 0 ? (
            <View style={styles.habitsContainer}>
              <Text style={styles.habitsCount}>
                {completedHabits}/{totalHabits}
              </Text>
              <Text style={styles.habitsLabel}>habits</Text>
            </View>
          ) : (
            <Text style={styles.emptyCell}>—</Text>
          )}
        </View>

        {/* Notes Column */}
        <View style={[styles.cell, styles.notesColumn, isTablet && styles.notesColumnTablet]}>
          {entry?.thoughts || dayJournal?.reflection ? (
            <Text style={styles.notesText} numberOfLines={2}>
              {entry?.thoughts || dayJournal?.reflection}
            </Text>
          ) : (
            <Text style={styles.emptyCell}>—</Text>
          )}
        </View>

        {/* Custom Columns */}
        {plannerSettings.customColumns.map(column => (
          <View key={column.id} style={[styles.cell, styles.dataColumn, isTablet && styles.dataColumnTablet]}>
            {entry?.customFields[column.id] ? (
              column.type === 'rating' ? (
                <View style={[
                  styles.ratingBadge,
                  { backgroundColor: getRatingColor(entry.customFields[column.id]) }
                ]}>
                  <Text style={styles.ratingText}>{entry.customFields[column.id]}%</Text>
                </View>
              ) : (
                <Text style={styles.customFieldText} numberOfLines={1}>
                  {entry.customFields[column.id]}
                </Text>
              )
            ) : (
              <Text style={styles.emptyCell}>—</Text>
            )}
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isTablet && styles.headerTablet]}>
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
      
      {/* Table Container - Updated for full width on desktop */}
      <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <View style={[styles.table, isTablet && styles.tableTablet]}>
            {renderTableHeader()}
            {calendarDays.map((day, index) => renderTableRow(day, index))}
          </View>
        </ScrollView>
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
    backgroundColor: COLORS.white,
  },
  headerTablet: {
    paddingHorizontal: 24,
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
  tableContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  horizontalScroll: {
    flex: 1,
  },
  table: {
    minWidth: '100%',
    width: '100%',
  },
  tableTablet: {
    minWidth: '100%',
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderBottomWidth: 2,
    borderBottomColor: COLORS.neutral[300],
    paddingVertical: 12,
  },
  tableHeaderTablet: {
    paddingVertical: 16,
  },
  headerCell: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  headerText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    minHeight: 60,
  },
  tableRowTablet: {
    minHeight: 80,
  },
  outsideMonthRow: {
    backgroundColor: COLORS.neutral[50],
  },
  todayRow: {
    backgroundColor: COLORS.primary[50],
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary[500],
  },
  hasDataRow: {
    backgroundColor: COLORS.white,
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  dateColumn: {
    width: 100,
    minWidth: 100,
  },
  dateColumnTablet: {
    width: 120,
    minWidth: 120,
  },
  dataColumn: {
    width: 100,
    minWidth: 100,
  },
  dataColumnTablet: {
    width: 120,
    minWidth: 120,
  },
  notesColumn: {
    width: 200,
    minWidth: 200,
    flex: 1,
  },
  notesColumnTablet: {
    width: 250,
    minWidth: 250,
    flex: 1,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  dayName: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  outsideMonthText: {
    color: COLORS.neutral[400],
  },
  todayText: {
    color: COLORS.primary[700],
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  sleepContainer: {
    alignItems: 'center',
    gap: 4,
  },
  sleepHours: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[700],
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  goalsContainer: {
    alignItems: 'center',
  },
  goalsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: COLORS.primary[600],
  },
  goalsLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  moodContainer: {
    alignItems: 'center',
    gap: 2,
  },
  moodValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.secondary[600],
  },
  moodEmoji: {
    fontSize: 14,
  },
  habitsContainer: {
    alignItems: 'center',
  },
  habitsCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: COLORS.accent[600],
  },
  habitsLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  notesText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 14,
  },
  customFieldText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[700],
    textAlign: 'center',
  },
  emptyCell: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[400],
    textAlign: 'center',
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