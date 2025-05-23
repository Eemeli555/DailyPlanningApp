import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
}

const FloatingActionButton = ({ onPress, icon, style }: FloatingActionButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default FloatingActionButton;