import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform, Dimensions } from 'react-native';
import { COLORS } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false, 
  loading = false,
  icon,
  size = 'medium'
}: ButtonProps) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    if (size === 'small') {
      baseStyle.push(styles.smallButton);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButton);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    if (size === 'small') {
      baseStyle.push(styles.smallButtonText);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButtonText);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size={size === 'small' ? 'small' : 'default'} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary[600],
    borderRadius: Platform.select({
      ios: 12,
      android: 8,
      default: 8,
    }),
    paddingVertical: isSmallScreen ? 10 : 12,
    paddingHorizontal: isSmallScreen ? 14 : 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Platform.select({
      ios: 44,
      android: 48,
      default: 44,
    }),
    shadowColor: Platform.select({
      ios: COLORS.primary[600],
      default: 'transparent',
    }),
    shadowOffset: Platform.select({
      ios: { width: 0, height: 2 },
      default: { width: 0, height: 0 },
    }),
    shadowOpacity: Platform.select({
      ios: 0.2,
      default: 0,
    }),
    shadowRadius: Platform.select({
      ios: 4,
      default: 0,
    }),
    elevation: Platform.select({
      android: 2,
      default: 0,
    }),
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: 8,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
    borderRadius: 14,
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: isSmallScreen ? 13 : 14,
    textAlign: 'center',
  },
  smallButtonText: {
    fontSize: 12,
  },
  largeButtonText: {
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;