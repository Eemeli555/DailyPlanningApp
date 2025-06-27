import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Chrome as Home, Target, BookOpen, Calendar, TrendingUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.neutral[400],
        tabBarStyle: {
          height: Platform.select({
            ios: 84 + insets.bottom,
            android: 68,
            default: 68,
          }),
          paddingTop: Platform.select({
            ios: 8,
            android: 12,
            default: 12,
          }),
          paddingBottom: Platform.select({
            ios: insets.bottom + 8,
            android: 12,
            default: 12,
          }),
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.neutral[200],
          borderTopWidth: 1,
          elevation: Platform.select({
            android: 8,
            default: 0,
          }),
          shadowColor: Platform.select({
            ios: COLORS.neutral[900],
            default: 'transparent',
          }),
          shadowOffset: Platform.select({
            ios: { width: 0, height: -2 },
            default: { width: 0, height: 0 },
          }),
          shadowOpacity: Platform.select({
            ios: 0.1,
            default: 0,
          }),
          shadowRadius: Platform.select({
            ios: 8,
            default: 0,
          }),
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: Platform.select({
            ios: 11,
            android: 12,
            default: 12,
          }),
          marginTop: Platform.select({
            ios: -2,
            android: 2,
            default: 2,
          }),
          marginBottom: Platform.select({
            ios: 2,
            android: 4,
            default: 4,
          }),
        },
        tabBarIconStyle: {
          marginTop: Platform.select({
            ios: 4,
            android: 0,
            default: 0,
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Home size={Platform.select({ ios: size - 1, default: size - 2 })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planning',
          tabBarIcon: ({ color, size }) => (
            <Target size={Platform.select({ ios: size - 1, default: size - 2 })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={Platform.select({ ios: size - 1, default: size - 2 })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={Platform.select({ ios: size - 1, default: size - 2 })} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={Platform.select({ ios: size - 1, default: size - 2 })} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}