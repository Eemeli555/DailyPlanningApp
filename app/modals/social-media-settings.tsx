import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Smartphone, Bell, Target, Plus, Settings, Trash2, CreditCard as Edit } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { AppContext } from '@/contexts/AppContext';
import { POPULAR_SOCIAL_APPS, formatUsageTime } from '@/utils/socialMediaTracking';
import Button from '@/components/Button';

export default function SocialMediaSettingsScreen() {
  const router = useRouter();
  const { 
    trackedApps, 
    usageAlerts,
    userProfile,
    updateUserProfile,
    addTrackedApp,
    updateTrackedApp,
    removeTrackedApp,
    addUsageAlert,
    updateUsageAlert,
    removeUsageAlert
  } = useContext(AppContext);

  const [showAddApp, setShowAddApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppPackage, setNewAppPackage] = useState('');

  const handleToggleTracking = (appId: string) => {
    const app = trackedApps.find(a => a.id === appId);
    if (app) {
      updateTrackedApp(appId, { isTracked: !app.isTracked });
    }
  };

  const handleToggleIntentPrompt = (appId: string) => {
    const app = trackedApps.find(a => a.id === appId);
    if (app) {
      updateTrackedApp(appId, { intentPromptEnabled: !app.intentPromptEnabled });
    }
  };

  const handleSetDailyLimit = (appId: string) => {
    const app = trackedApps.find(a => a.id === appId);
    if (!app) return;

    Alert.prompt(
      'Set Daily Limit',
      `How many minutes per day for ${app.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set', 
          onPress: (value) => {
            const minutes = parseInt(value || '0');
            if (minutes > 0) {
              updateTrackedApp(appId, { dailyLimit: minutes });
            }
          }
        }
      ],
      'plain-text',
      app.dailyLimit?.toString() || '60'
    );
  };

  const handleRemoveApp = (appId: string) => {
    const app = trackedApps.find(a => a.id === appId);
    if (!app) return;

    Alert.alert(
      'Remove App',
      `Stop tracking ${app.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeTrackedApp(appId)
        }
      ]
    );
  };

  const handleAddCustomApp = () => {
    if (!newAppName.trim() || !newAppPackage.trim()) {
      Alert.alert('Error', 'Please enter both app name and package name');
      return;
    }

    addTrackedApp({
      packageName: newAppPackage.trim(),
      displayName: newAppName.trim(),
      category: 'other',
      isTracked: true,
      intentPromptEnabled: true,
      color: COLORS.neutral[500],
    });

    setNewAppName('');
    setNewAppPackage('');
    setShowAddApp(false);
  };

  const handleAddPresetApp = (preset: typeof POPULAR_SOCIAL_APPS[0]) => {
    const exists = trackedApps.some(app => app.packageName === preset.packageName);
    if (exists) {
      Alert.alert('App Already Added', `${preset.displayName} is already in your tracked apps list.`);
      return;
    }

    addTrackedApp(preset);
  };

  const toggleGlobalTracking = () => {
    if (!userProfile) return;
    
    updateUserProfile({
      preferences: {
        ...userProfile.preferences,
        socialMediaTracking: !userProfile.preferences.socialMediaTracking
      }
    });
  };

  const toggleIntentPrompts = () => {
    if (!userProfile) return;
    
    updateUserProfile({
      preferences: {
        ...userProfile.preferences,
        intentPrompts: !userProfile.preferences.intentPrompts
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Settings size={24} color={COLORS.primary[600]} />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Digital Wellness Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your social media tracking and mindful usage features</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        {/* Global Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Usage Tracking</Text>
              <Text style={styles.settingDescription}>
                {Platform.OS === 'android' 
                  ? 'Monitor app usage automatically' 
                  : 'Manual usage logging (iOS limitation)'}
              </Text>
            </View>
            <Switch
              value={userProfile?.preferences.socialMediaTracking || false}
              onValueChange={toggleGlobalTracking}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Intent Prompts</Text>
              <Text style={styles.settingDescription}>
                Show reflection prompts before opening tracked apps
              </Text>
            </View>
            <Switch
              value={userProfile?.preferences.intentPrompts || false}
              onValueChange={toggleIntentPrompts}
              trackColor={{ false: COLORS.neutral[300], true: COLORS.primary[500] }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Tracked Apps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tracked Apps</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddApp(!showAddApp)}
            >
              <Plus size={16} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>

          {/* Add App Section */}
          {showAddApp && (
            <View style={styles.addAppSection}>
              <Text style={styles.addAppTitle}>Add Custom App</Text>
              
              <TextInput
                style={styles.textInput}
                placeholder="App name (e.g., Instagram)"
                placeholderTextColor={COLORS.neutral[400]}
                value={newAppName}
                onChangeText={setNewAppName}
              />
              
              <TextInput
                style={styles.textInput}
                placeholder="Package name (e.g., com.instagram.android)"
                placeholderTextColor={COLORS.neutral[400]}
                value={newAppPackage}
                onChangeText={setNewAppPackage}
              />
              
              <View style={styles.addAppButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowAddApp(false)}
                  style={styles.cancelButton}
                  textStyle={styles.cancelButtonText}
                />
                <Button
                  title="Add App"
                  onPress={handleAddCustomApp}
                  style={styles.confirmButton}
                />
              </View>

              {/* Preset Apps */}
              <Text style={styles.presetTitle}>Or add a popular app:</Text>
              <View style={styles.presetApps}>
                {POPULAR_SOCIAL_APPS.filter(preset => 
                  !trackedApps.some(app => app.packageName === preset.packageName)
                ).slice(0, 6).map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.presetApp, { borderColor: preset.color }]}
                    onPress={() => handleAddPresetApp(preset)}
                  >
                    <Text style={styles.presetAppName}>{preset.displayName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Apps List */}
          {trackedApps.length === 0 ? (
            <View style={styles.emptyState}>
              <Smartphone size={32} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No apps tracked yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add apps to start monitoring your usage patterns
              </Text>
            </View>
          ) : (
            trackedApps.map((app) => (
              <View key={app.id} style={styles.appItem}>
                <View style={styles.appInfo}>
                  <View style={[styles.appIcon, { backgroundColor: app.color + '20' }]}>
                    <Text style={[styles.appIconText, { color: app.color }]}>
                      {app.displayName.charAt(0)}
                    </Text>
                  </View>
                  
                  <View style={styles.appDetails}>
                    <Text style={styles.appName}>{app.displayName}</Text>
                    <Text style={styles.appPackage}>{app.packageName}</Text>
                    {app.dailyLimit && (
                      <Text style={styles.appLimit}>
                        Daily limit: {formatUsageTime(app.dailyLimit)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.appControls}>
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>Track Usage</Text>
                    <Switch
                      value={app.isTracked}
                      onValueChange={() => handleToggleTracking(app.id)}
                      trackColor={{ false: COLORS.neutral[300], true: app.color }}
                      thumbColor={COLORS.white}
                    />
                  </View>

                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>Intent Prompts</Text>
                    <Switch
                      value={app.intentPromptEnabled}
                      onValueChange={() => handleToggleIntentPrompt(app.id)}
                      trackColor={{ false: COLORS.neutral[300], true: app.color }}
                      thumbColor={COLORS.white}
                    />
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDailyLimit(app.id)}
                    >
                      <Target size={14} color={COLORS.primary[600]} />
                      <Text style={styles.actionButtonText}>Set Limit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleRemoveApp(app.id)}
                    >
                      <Trash2 size={14} color={COLORS.error[600]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Usage Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage Alerts</Text>
          <Text style={styles.sectionDescription}>
            Get notified when you approach your daily limits or usage spikes
          </Text>

          {usageAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={32} color={COLORS.neutral[400]} />
              <Text style={styles.emptyStateText}>No alerts configured</Text>
              <Text style={styles.emptyStateSubtext}>
                Set up alerts to stay mindful of your usage
              </Text>
            </View>
          ) : (
            usageAlerts.map((alert) => {
              const app = trackedApps.find(a => a.id === alert.appId);
              return (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>
                      {alert.type === 'daily_limit' ? 'Daily Limit Alert' :
                       alert.type === 'usage_spike' ? 'Usage Spike Alert' :
                       'Awareness Reminder'}
                    </Text>
                    <Text style={styles.alertDescription}>
                      {app?.displayName} - {alert.threshold} minutes
                    </Text>
                  </View>
                  
                  <Switch
                    value={alert.isActive}
                    onValueChange={(value) => updateUsageAlert(alert.id, { isActive: value })}
                    trackColor={{ false: COLORS.neutral[300], true: COLORS.warning[500] }}
                    thumbColor={COLORS.white}
                  />
                </View>
              );
            })
          )}
        </View>

        {/* Platform Notice */}
        {Platform.OS === 'ios' && (
          <View style={styles.platformNotice}>
            <Text style={styles.noticeTitle}>iOS Limitations</Text>
            <Text style={styles.noticeText}>
              Due to iOS restrictions, automatic usage tracking is not available. 
              You can manually log your usage or use Screen Time data from iOS Settings.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    marginBottom: 16,
    lineHeight: 20,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 18,
  },
  addAppSection: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addAppTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginBottom: 12,
  },
  addAppButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
  },
  cancelButtonText: {
    color: COLORS.neutral[700],
  },
  confirmButton: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  presetApps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetApp: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
  },
  presetAppName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[600],
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: 4,
  },
  appItem: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  appPackage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
  },
  appLimit: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    marginTop: 2,
  },
  appControls: {
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    gap: 6,
  },
  deleteButton: {
    backgroundColor: COLORS.error[50],
    borderColor: COLORS.error[200],
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  platformNotice: {
    backgroundColor: COLORS.warning[50],
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  noticeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.warning[800],
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.warning[700],
    lineHeight: 20,
  },
});