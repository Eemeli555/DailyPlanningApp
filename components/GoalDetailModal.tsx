import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { X, Clock, Calendar, CheckCircle, Circle, Timer, Bell } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { Goal } from '@/types';
import Button from './Button';

interface GoalDetailModalProps {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
  onToggleComplete?: (goalId: string) => void;
  onSetTimer?: () => void;
  onEditSchedule?: () => void;
  onEdit?: () => void;
}

const GoalDetailModal = ({ 
  visible, 
  goal, 
  onClose, 
  onToggleComplete,
  onSetTimer,
  onEditSchedule,
  onEdit
}: GoalDetailModalProps) => {
  if (!goal) return null;

  const formatDuration = () => {
    if (!goal.scheduledTime) return null;
    
    const start = new Date(goal.scheduledTime.start);
    const end = new Date(goal.scheduledTime.end);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      if (minutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  };

  const getTimeUntilStart = () => {
    if (!goal.scheduledTime) return null;
    
    const now = new Date();
    const start = new Date(goal.scheduledTime.start);
    const diffMs = start.getTime() - now.getTime();
    
    if (diffMs <= 0) return null; // Already started or passed
    
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Starts in ${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      if (minutes === 0) {
        return `Starts in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `Starts in ${hours}h ${minutes}m`;
      }
    }
  };

  const isCurrentlyActive = () => {
    if (!goal.scheduledTime) return false;
    
    const now = new Date();
    const start = new Date(goal.scheduledTime.start);
    const end = new Date(goal.scheduledTime.end);
    
    return now >= start && now <= end;
  };

  const timeUntilStart = getTimeUntilStart();
  const duration = formatDuration();
  const isActive = isCurrentlyActive();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Goal Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Goal Status Banner */}
          <View style={[
            styles.statusBanner,
            goal.completed && styles.completedBanner,
            isActive && styles.activeBanner
          ]}>
            <View style={styles.statusIcon}>
              {goal.completed ? (
                <CheckCircle size={20} color={COLORS.white} />
              ) : isActive ? (
                <Clock size={20} color={COLORS.white} />
              ) : (
                <Circle size={20} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.statusText}>
              {goal.completed ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
            </Text>
          </View>

          {/* Goal Information */}
          <View style={styles.section}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            )}
          </View>

          {/* Schedule Information */}
          {goal.scheduledTime && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={COLORS.primary[600]} />
                <Text style={styles.sectionTitle}>Schedule</Text>
              </View>
              
              <View style={styles.scheduleCard}>
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>Start Time</Text>
                  <Text style={styles.scheduleValue}>
                    {format(new Date(goal.scheduledTime.start), 'h:mm a')}
                  </Text>
                </View>
                
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>End Time</Text>
                  <Text style={styles.scheduleValue}>
                    {format(new Date(goal.scheduledTime.end), 'h:mm a')}
                  </Text>
                </View>
                
                {duration && (
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleLabel}>Duration</Text>
                    <Text style={styles.scheduleValue}>{duration}</Text>
                  </View>
                )}
                
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>Date</Text>
                  <Text style={styles.scheduleValue}>
                    {format(new Date(goal.scheduledTime.start), 'EEEE, MMMM d, yyyy')}
                  </Text>
                </View>
              </View>

              {timeUntilStart && (
                <View style={styles.countdownCard}>
                  <Clock size={16} color={COLORS.accent[600]} />
                  <Text style={styles.countdownText}>{timeUntilStart}</Text>
                </View>
              )}
            </View>
          )}

          {/* Goal Properties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Properties</Text>
            
            <View style={styles.propertiesGrid}>
              <View style={styles.propertyCard}>
                <Text style={styles.propertyLabel}>Type</Text>
                <Text style={styles.propertyValue}>
                  {goal.isAutomatic ? 'Automatic' : 'Manual'}
                </Text>
              </View>
              
              <View style={styles.propertyCard}>
                <Text style={styles.propertyLabel}>Timer</Text>
                <Text style={styles.propertyValue}>
                  {goal.hasTimer ? 'Active' : 'None'}
                </Text>
              </View>
              
              <View style={styles.propertyCard}>
                <Text style={styles.propertyLabel}>Created</Text>
                <Text style={styles.propertyValue}>
                  {format(new Date(goal.createdAt), 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          {goal.isAutomatic && (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                This is an automatic goal that repeats daily in your plans.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <View style={styles.actionRow}>
            <Button
              title={goal.completed ? "Mark Incomplete" : "Mark Complete"}
              onPress={() => onToggleComplete?.(goal.id)}
              style={[
                styles.actionButton,
                goal.completed ? styles.incompleteButton : styles.completeButton
              ]}
              textStyle={goal.completed ? styles.incompleteButtonText : undefined}
              icon={goal.completed ? 
                <Circle size={16} color={COLORS.neutral[600]} /> : 
                <CheckCircle size={16} color={COLORS.white} />
              }
            />
            
            {!goal.scheduledTime && onSetTimer && (
              <Button
                title="Set Timer"
                onPress={onSetTimer}
                style={[styles.actionButton, styles.timerButton]}
                textStyle={styles.timerButtonText}
                icon={<Timer size={16} color={COLORS.accent[600]} />}
              />
            )}
          </View>

          {goal.scheduledTime && onEditSchedule && (
            <Button
              title="Edit Schedule"
              onPress={onEditSchedule}
              style={[styles.actionButton, styles.editButton]}
              textStyle={styles.editButtonText}
              icon={<Calendar size={16} color={COLORS.primary[600]} />}
            />
          )}

          {onEdit && (
            <Button
              title="Edit Goal"
              onPress={onEdit}
              style={[styles.actionButton, styles.secondaryButton]}
              textStyle={styles.secondaryButtonText}
            />
          )}
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[500],
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  completedBanner: {
    backgroundColor: COLORS.success[500],
  },
  activeBanner: {
    backgroundColor: COLORS.accent[500],
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.white,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginLeft: 8,
  },
  goalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 24,
  },
  scheduleCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  scheduleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  scheduleValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent[500],
  },
  countdownText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.accent[700],
    marginLeft: 8,
  },
  propertiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  propertyCard: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  propertyLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  propertyValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary[500],
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  completeButton: {
    backgroundColor: COLORS.success[600],
  },
  incompleteButton: {
    backgroundColor: COLORS.neutral[100],
  },
  incompleteButtonText: {
    color: COLORS.neutral[700],
  },
  timerButton: {
    backgroundColor: COLORS.accent[100],
  },
  timerButtonText: {
    color: COLORS.accent[700],
  },
  editButton: {
    backgroundColor: COLORS.primary[100],
  },
  editButtonText: {
    color: COLORS.primary[700],
  },
  secondaryButton: {
    backgroundColor: COLORS.neutral[100],
  },
  secondaryButtonText: {
    color: COLORS.neutral[700],
  },
});

export default GoalDetailModal;