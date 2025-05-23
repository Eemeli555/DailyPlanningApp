import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Chrome as Home, ListTodo, Dumbbell, CalendarDays } from 'lucide-react-native';
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
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.neutral[200],
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
          marginTop: 0,
          marginBottom: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Home size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => (
            <ListTodo size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ color, size }) => (
            <Dumbbell size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}