import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform } from 'react-native';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns';
import { X, Calendar, Plus, Clock, Target, Activity } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '@/contexts/AppContext';
import { COLORS } from '@/constants/theme';
import Button from './Button';
import ScheduleTaskModal from './ScheduleTaskModal';

interface FutureDayPlanningModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
}

const FutureDayPlanningModal = ({ visible, onClose, initialDate }: FutureDayPlanningModalProps) => {
  const { 
    goalsLibrary, 
    productiveActivities, 
    addGoalToDate, 
    addActivityToDate,
    getDailyPlan 
  } = useContext(AppContext);
  
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'task' | 'activity'; item: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'activities'>('tasks');

  // Generate week view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const filteredTasks = goalsLibrary.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = productiveActivities.filter(activity =>
    activity.isActive && activity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTask = (task: any) => {
    setSelectedItem({ type: 'task', item: task });
    setShowScheduleModal(true);
  };

  const handleAddActivity = (activity: any) => {
    setSelectedItem({ type: 'activity', item: activity });
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (schedule?: { start: string; end: string }) => {
    if (!selectedItem) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (selectedItem.type === 'task') {
      addGoalToDate(selectedItem.item.id, dateStr, schedule);
    } else {
      addActivityToDate(selectedItem.item.id, dateStr, schedule);
    }

    setShowScheduleModal(false);
    setSelectedItem(null);
  };

  const getDayPlanSummary = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const plan = getDailyPlan(dateStr);
    
    if (!plan) return { tasks: 0, activities: 0 };
    
    const tasks = plan.goals.filter(g => !g.id.startsWith('habit-')).length;
    const activities = 0; // TODO: Add activity count when implemented
    
    return { tasks, activities };
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Plan Future Days</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.neutral[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Week Calendar */}
            <View style={styles.weekCalendar}>
              <Text style={styles.sectionTitle}>Select Date</Text>
              <View style={styles.weekDays}>
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = isBefore(day, new Date()) && !isToday(day);
                  const summary = getDayPlanSummary(day);
                  
                  return (
                    <TouchableOpacity
                      key={day.toString()}
                      style={[
                        styles.dayButton,
                        isSelected && styles.selectedDayButton,
                        isPast && styles.pastDayButton,
                      ]}
                      onPress={() => setSelectedDate(day)}
                      disabled={isPast}
                    >
                      <Text style={[
                        styles.dayName,
                        isSelected && styles.selectedDayText,
                        isPast && styles.pastDayText,
                      ]}>
                        {format(day, 'EEE')}
                      </Text>
                      <Text style={[
                        styles.dayNumber,
                        isSelected && styles.selectedDayText,
                        isPast && styles.pastDayText,
                        isToday(day) && styles.todayText,
                      ]}>
                        {format(day, 'd')}
                      </Text>
                      {(summary.tasks > 0 || summary.activities > 0) && (
                        <View style={styles.dayIndicator}>
                          <Text style={styles.dayIndicatorText}>
                            {summary.tasks + summary.activities}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selected Date Info */}
            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateTitle}>
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Text>
              <Text style={styles.selectedDateSubtitle}>
                Add tasks and activities to this day
              </Text>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabSelector}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'tasks' && styles.activeTab
                ]}
                onPress={() => setActiveTab('tasks')}
              >
                <Target size={16} color={activeTab === 'tasks' ? COLORS.white : COLORS.neutral[600]} />
                <Text style={[
                  styles.tabText,
                  activeTab === 'tasks' && styles.activeTabText
                ]}>
                  Tasks
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'activities' && styles.activeTab
                ]}
                onPress={() => setActiveTab('activities')}
              >
                <Activity size={16} color={activeTab === 'activities' ? COLORS.white : COLORS.neutral[600]} />
                <Text style={[
                  styles.tabText,
                  activeTab === 'activities' && styles.activeTabText
                ]}>
                  Activities
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${activeTab}...`}
                placeholderTextColor={COLORS.neutral[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Content */}
            {activeTab === 'tasks' ? (
              <View style={styles.itemsList}>
                {filteredTasks.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Target size={48} color={COLORS.neutral[400]} />
                    <Text style={styles.emptyStateText}>No tasks found</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Create tasks in the Planning tab to add them to future days
                    </Text>
                  </View>
                ) : (
                  filteredTasks.map((task, index) => (
                    <Animated.View
                      key={task.id}
                      entering={FadeInDown.delay(index * 50).springify()}
                    >
                      <TouchableOpacity
                        style={styles.itemCard}
                        onPress={() => handleAddTask(task)}
                      >
                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{task.title}</Text>
                          {task.description && (
                            <Text style={styles.itemDescription} numberOfLines={2}>
                              {task.description}
                            </Text>
                          )}
                        </View>
                        <View style={styles.addButton}>
                          <Plus size={20} color={COLORS.primary[600]} />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.itemsList}>
                {filteredActivities.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Activity size={48} color={COLORS.neutral[400]} />
                    <Text style={styles.emptyStateText}>No activities found</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Create activities in the Planning tab to add them to future days
                    </Text>
                  </View>
                ) : (
                  filteredActivities.map((activity, index) => (
                    <Animated.View
                      key={activity.id}
                      entering={FadeInDown.delay(index * 50).springify()}
                    >
                      <TouchableOpacity
                        style={styles.itemCard}
                        onPress={() => handleAddActivity(activity)}
                      >
                        <View style={styles.itemIcon}>
                          <Text style={styles.activityEmoji}>{activity.icon}</Text>
                        </View>
                        <View style={styles.itemContent}>
                          <Text style={styles.itemTitle}>{activity.name}</Text>
                          {activity.description && (
                            <Text style={styles.itemDescription} numberOfLines={2}>
                              {activity.description}
                            </Text>
                          )}
                          <View style={styles.activityMeta}>
                            <Text style={styles.activityCategory}>{activity.category}</Text>
                            {activity.estimatedDuration && (
                              <>
                                <Text style={styles.metaDivider}>•</Text>
                                <Text style={styles.activityDuration}>
                                  {activity.estimatedDuration}m
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                        <View style={styles.addButton}>
                          <Plus size={20} color={COLORS.primary[600]} />
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <ScheduleTaskModal
        visible={showScheduleModal}
        task={selectedItem?.type === 'task' ? selectedItem.item : null}
        activity={selectedItem?.type === 'activity' ? selectedItem.item : null}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedItem(null);
        }}
        onSchedule={handleScheduleConfirm}
        selectedDate={selectedDate}
      />
    </>
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
  weekCalendar: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary[600],
  },
  pastDayButton: {
    backgroundColor: COLORS.neutral[50],
    opacity: 0.5,
  },
  dayName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  selectedDayText: {
    color: COLORS.white,
  },
  pastDayText: {
    color: COLORS.neutral[400],
  },
  todayText: {
    color: COLORS.primary[600],
  },
  dayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.accent[500],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIndicatorText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: COLORS.white,
  },
  selectedDateInfo: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  selectedDateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primary[800],
    marginBottom: 4,
  },
  selectedDateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[600],
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  activeTabText: {
    color: COLORS.white,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  itemsList: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[600],
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  itemIcon: {
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 20,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    textTransform: 'capitalize',
  },
  metaDivider: {
    fontSize: 12,
    color: COLORS.neutral[400],
    marginHorizontal: 6,
  },
  activityDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FutureDayPlanningModal;