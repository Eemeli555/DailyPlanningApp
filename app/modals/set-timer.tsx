import { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import Button from '@/components/Button';
import { CirclePlus as PlusCircle, CircleMinus as MinusCircle, Clock, Bell } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

// Configure notifications for web
if (Platform.OS === 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function SetTimerScreen() {
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { getGoalById, scheduleNotification } = useContext(AppContext);
  
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [notificationType, setNotificationType] = useState<'timer' | 'alarm'>('timer');
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  
  useEffect(() => {
    // Request notification permissions on component mount
    if (Platform.OS !== 'web') {
      Notifications.requestPermissionsAsync()
        .then(({ status }) => {
          setNotificationPermission(status === 'granted');
        })
        .catch(error => {
          console.error('Error requesting notification permissions:', error);
          setNotificationPermission(false);
        });
    } else {
      // For web, check if notifications are supported
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission === 'granted');
        });
      }
    }
  }, []);
  
  const goal = goalId ? getGoalById(goalId) : null;
  
  const incrementHours = () => setHours(h => Math.min(h + 1, 23));
  const decrementHours = () => setHours(h => Math.max(h - 1, 0));
  
  const incrementMinutes = () => {
    if (minutes === 59) {
      setMinutes(0);
      incrementHours();
    } else {
      setMinutes(m => m + 1);
    }
  };
  
  const decrementMinutes = () => {
    if (minutes === 0) {
      if (hours > 0) {
        setMinutes(59);
        decrementHours();
      }
    } else {
      setMinutes(m => m - 1);
    }
  };
  
  const incrementSeconds = () => {
    if (seconds === 59) {
      setSeconds(0);
      incrementMinutes();
    } else {
      setSeconds(s => s + 1);
    }
  };
  
  const decrementSeconds = () => {
    if (seconds === 0) {
      if (minutes > 0 || hours > 0) {
        setSeconds(59);
        decrementMinutes();
      }
    } else {
      setSeconds(s => s - 1);
    }
  };
  
  const getTotalSeconds = () => {
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  const handleSave = async () => {
    if (!goalId || !goal || !notificationPermission) return;
    
    const totalSeconds = getTotalSeconds();
    if (totalSeconds > 0) {
      try {
        await scheduleNotification(goalId, {
          type: notificationType,
          seconds: totalSeconds,
        });
        router.back();
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }
  };
  
  if (!notificationPermission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.permissionText}>
          Please enable notifications to use timers and alarms.
        </Text>
        <Button 
          title="Request Permission" 
          onPress={() => {
            if (Platform.OS !== 'web') {
              Notifications.requestPermissionsAsync();
            } else if ('Notification' in window) {
              Notification.requestPermission();
            }
          }}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {goal && (
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            )}
          </View>
        )}
        
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              notificationType === 'timer' && styles.selectedTypeButton
            ]}
            onPress={() => setNotificationType('timer')}
          >
            <Clock 
              size={20} 
              color={notificationType === 'timer' ? COLORS.white : COLORS.neutral[700]} 
            />
            <Text 
              style={[
                styles.typeText,
                notificationType === 'timer' && styles.selectedTypeText
              ]}
            >
              Timer
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              notificationType === 'alarm' && styles.selectedTypeButton
            ]}
            onPress={() => setNotificationType('alarm')}
          >
            <Bell 
              size={20} 
              color={notificationType === 'alarm' ? COLORS.white : COLORS.neutral[700]} 
            />
            <Text 
              style={[
                styles.typeText,
                notificationType === 'alarm' && styles.selectedTypeText
              ]}
            >
              Alarm
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>
          {notificationType === 'timer' ? 'Set Timer Duration' : 'Set Alarm Time'}
        </Text>
        
        <View style={styles.timeContainer}>
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={incrementHours} style={styles.timeButton}>
              <PlusCircle size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
            <View style={styles.timeValue}>
              <Text style={styles.timeValueText}>{hours.toString().padStart(2, '0')}</Text>
            </View>
            <TouchableOpacity onPress={decrementHours} style={styles.timeButton}>
              <MinusCircle size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
            <Text style={styles.timeLabel}>Hours</Text>
          </View>
          
          <Text style={styles.timeSeparator}>:</Text>
          
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={incrementMinutes} style={styles.timeButton}>
              <PlusCircle size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
            <View style={styles.timeValue}>
              <Text style={styles.timeValueText}>{minutes.toString().padStart(2, '0')}</Text>
            </View>
            <TouchableOpacity onPress={decrementMinutes} style={styles.timeButton}>
              <MinusCircle size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
            <Text style={styles.timeLabel}>Minutes</Text>
          </View>
          
          <Text style={styles.timeSeparator}>:</Text>
          
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={incrementSeconds} style={styles.timeButton}>
              <PlusCircle size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
            <View style={styles.timeValue}>
              <Text style={styles.timeValueText}>{seconds.toString().padStart(2, '0')}</Text>
            </View>
            <TouchableOpacity onPress={decrementSeconds} style={styles.timeButton}>
              <MinusCircle size={24} color={COLORS.primary[600]} />
            </TouchableOpacity>
            <Text style={styles.timeLabel}>Seconds</Text>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {notificationType === 'timer' 
              ? 'Timer will countdown from the specified duration and alert you when it reaches zero.'
              : 'Alarm will notify you at the specified time from now.'}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Cancel" 
          onPress={() => router.back()} 
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        <Button 
          title={notificationType === 'timer' ? 'Start Timer' : 'Set Alarm'} 
          onPress={handleSave} 
          disabled={getTotalSeconds() === 0}
          style={[styles.saveButton, getTotalSeconds() === 0 && styles.disabledButton]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  goalInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    marginRight: 8,
  },
  selectedTypeButton: {
    backgroundColor: COLORS.primary[600],
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  selectedTypeText: {
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeButton: {
    padding: 8,
  },
  timeValue: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  timeValueText: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[800],
  },
  timeLabel: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  timeSeparator: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[400],
    marginHorizontal: 4,
  },
  infoContainer: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
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