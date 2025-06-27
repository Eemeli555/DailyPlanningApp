import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
}

const FloatingActionButton = ({ onPress, icon, style }: FloatingActionButtonProps) => {
  const insets = useSafeAreaInsets();
  
  return (
    <TouchableOpacity
      style={[
        styles.fab, 
        { 
          bottom: Platform.select({
            ios: 24 + insets.bottom,
            android: 24,
            default: 24,
          }),
          right: isSmallScreen ? 16 : 24,
        },
        style
      ]}
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
    width: isSmallScreen ? 52 : 56,
    height: isSmallScreen ? 52 : 56,
    borderRadius: isSmallScreen ? 26 : 28,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: Platform.select({
        ios: 4,
        android: 2,
        default: 2,
      }),
    },
    shadowOpacity: Platform.select({
      ios: 0.3,
      android: 0.25,
      default: 0.25,
    }),
    shadowRadius: Platform.select({
      ios: 8,
      android: 4,
      default: 4,
    }),
    elevation: Platform.select({
      android: 8,
      default: 5,
    }),
  },
});

export default FloatingActionButton;