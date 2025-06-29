import { Platform } from 'react-native';
import { TrackedApp, AppUsageSession, IntentPromptResponse } from '@/types';

// Social Media App Presets
export const POPULAR_SOCIAL_APPS: Omit<TrackedApp, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    packageName: 'com.instagram.android',
    displayName: 'Instagram',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#E4405F',
  },
  {
    packageName: 'com.zhiliaoapp.musically',
    displayName: 'TikTok',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#000000',
  },
  {
    packageName: 'com.google.android.youtube',
    displayName: 'YouTube',
    category: 'entertainment',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#FF0000',
  },
  {
    packageName: 'com.twitter.android',
    displayName: 'X (Twitter)',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#1DA1F2',
  },
  {
    packageName: 'com.facebook.katana',
    displayName: 'Facebook',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#1877F2',
  },
  {
    packageName: 'com.snapchat.android',
    displayName: 'Snapchat',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#FFFC00',
  },
  {
    packageName: 'com.reddit.frontpage',
    displayName: 'Reddit',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#FF4500',
  },
  {
    packageName: 'com.linkedin.android',
    displayName: 'LinkedIn',
    category: 'social',
    isTracked: false,
    intentPromptEnabled: false,
    color: '#0077B5',
  },
  {
    packageName: 'com.pinterest',
    displayName: 'Pinterest',
    category: 'social',
    isTracked: true,
    intentPromptEnabled: true,
    color: '#BD081C',
  },
  {
    packageName: 'com.discord',
    displayName: 'Discord',
    category: 'social',
    isTracked: false,
    intentPromptEnabled: false,
    color: '#5865F2',
  },
];

export const INTENT_REASONS = [
  { id: 'bored', label: 'Bored', emoji: '😴', color: '#9CA3AF' },
  { id: 'habit', label: 'Habit', emoji: '🔄', color: '#F59E0B' },
  { id: 'reward', label: 'Reward', emoji: '🎉', color: '#10B981' },
  { id: 'work', label: 'Work', emoji: '💼', color: '#3B82F6' },
  { id: 'social', label: 'Social', emoji: '👥', color: '#8B5CF6' },
  { id: 'other', label: 'Other', emoji: '🤔', color: '#6B7280' },
] as const;

// Android Usage Stats Interface
export interface AndroidUsageStats {
  packageName: string;
  totalTimeInForeground: number; // milliseconds
  firstTimeStamp: number;
  lastTimeStamp: number;
  lastTimeUsed: number;
  totalTimeVisible: number;
}

// Usage Tracking Service
export class SocialMediaTrackingService {
  private static instance: SocialMediaTrackingService;
  private isTracking = false;
  private trackingInterval: NodeJS.Timeout | null = null;

  static getInstance(): SocialMediaTrackingService {
    if (!SocialMediaTrackingService.instance) {
      SocialMediaTrackingService.instance = new SocialMediaTrackingService();
    }
    return SocialMediaTrackingService.instance;
  }

  async requestUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('Usage stats only available on Android');
      return false;
    }

    try {
      // This would need to be implemented in native Android code
      // For now, we'll simulate the permission request
      return new Promise((resolve) => {
        // In real implementation, this would open Android settings
        // and check if PACKAGE_USAGE_STATS permission is granted
        setTimeout(() => resolve(true), 1000);
      });
    } catch (error) {
      console.error('Error requesting usage stats permission:', error);
      return false;
    }
  }

  async getUsageStats(startTime: number, endTime: number): Promise<AndroidUsageStats[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      // This would need to be implemented in native Android code
      // using UsageStatsManager.queryUsageStats()
      
      // For now, we'll return mock data for development
      return this.getMockUsageStats();
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return [];
    }
  }

  private getMockUsageStats(): AndroidUsageStats[] {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    return [
      {
        packageName: 'com.instagram.android',
        totalTimeInForeground: 45 * 60 * 1000, // 45 minutes
        firstTimeStamp: now - 8 * oneHour,
        lastTimeStamp: now - oneHour,
        lastTimeUsed: now - oneHour,
        totalTimeVisible: 45 * 60 * 1000,
      },
      {
        packageName: 'com.zhiliaoapp.musically',
        totalTimeInForeground: 32 * 60 * 1000, // 32 minutes
        firstTimeStamp: now - 6 * oneHour,
        lastTimeStamp: now - 2 * oneHour,
        lastTimeUsed: now - 2 * oneHour,
        totalTimeVisible: 32 * 60 * 1000,
      },
      {
        packageName: 'com.google.android.youtube',
        totalTimeInForeground: 78 * 60 * 1000, // 78 minutes
        firstTimeStamp: now - 10 * oneHour,
        lastTimeStamp: now - 30 * 60 * 1000,
        lastTimeUsed: now - 30 * 60 * 1000,
        totalTimeVisible: 78 * 60 * 1000,
      },
    ];
  }

  async startTracking(): Promise<void> {
    if (this.isTracking) return;

    const hasPermission = await this.requestUsageStatsPermission();
    if (!hasPermission) {
      throw new Error('Usage stats permission not granted');
    }

    this.isTracking = true;
    
    // Poll usage stats every 5 minutes
    this.trackingInterval = setInterval(async () => {
      await this.collectUsageData();
    }, 5 * 60 * 1000);

    // Collect initial data
    await this.collectUsageData();
  }

  stopTracking(): void {
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  private async collectUsageData(): Promise<void> {
    try {
      const endTime = Date.now();
      const startTime = endTime - (24 * 60 * 60 * 1000); // Last 24 hours

      const usageStats = await this.getUsageStats(startTime, endTime);
      
      // Process and store usage data
      // This would integrate with your app's context/storage
      console.log('Collected usage stats:', usageStats);
    } catch (error) {
      console.error('Error collecting usage data:', error);
    }
  }

  async detectAppLaunch(packageName: string): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      // This would need to be implemented using AccessibilityService
      // or by monitoring running processes
      
      // For now, we'll simulate app launch detection
      return Math.random() > 0.7; // 30% chance of detecting launch
    } catch (error) {
      console.error('Error detecting app launch:', error);
      return false;
    }
  }

  calculateDailyUsage(usageStats: AndroidUsageStats[]): { [packageName: string]: number } {
    const dailyUsage: { [packageName: string]: number } = {};
    
    usageStats.forEach(stat => {
      dailyUsage[stat.packageName] = Math.round(stat.totalTimeInForeground / (1000 * 60)); // Convert to minutes
    });
    
    return dailyUsage;
  }

  calculateUsageTrend(currentUsage: number, averageUsage: number): 'up' | 'down' | 'stable' {
    const threshold = 0.2; // 20% change threshold
    const change = (currentUsage - averageUsage) / averageUsage;
    
    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
  }

  shouldShowUsageAlert(appId: string, currentUsage: number, dailyLimit?: number): boolean {
    if (!dailyLimit) return false;
    
    // Alert when 80% of daily limit is reached
    return currentUsage >= (dailyLimit * 0.8);
  }

  generateSmartSuggestions(
    totalUsage: number,
    averageUsage: number,
    topApps: { name: string; usage: number }[]
  ): string[] {
    const suggestions: string[] = [];
    
    if (totalUsage > averageUsage * 1.3) {
      suggestions.push(`Your screen time is 30% higher than usual. Consider setting a ${Math.round(averageUsage)}-minute limit for tomorrow.`);
    }
    
    const topApp = topApps[0];
    if (topApp && topApp.usage > 60) {
      suggestions.push(`You spent ${topApp.usage} minutes on ${topApp.name} today. Would you like to schedule a focus block instead?`);
    }
    
    if (totalUsage > 180) { // More than 3 hours
      suggestions.push('Consider adding a "no-phone" block to your daily schedule for better focus.');
    }
    
    return suggestions;
  }
}

// Utility functions
export const formatUsageTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const getUsageColor = (usage: number, limit?: number): string => {
  if (!limit) {
    // Default color coding based on usage amount
    if (usage < 30) return '#10B981'; // Green
    if (usage < 90) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  }
  
  const percentage = usage / limit;
  if (percentage < 0.7) return '#10B981'; // Green
  if (percentage < 0.9) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
};

export const calculateWeeklyAverage = (dailyUsages: number[]): number => {
  if (dailyUsages.length === 0) return 0;
  const sum = dailyUsages.reduce((acc, usage) => acc + usage, 0);
  return Math.round(sum / dailyUsages.length);
};