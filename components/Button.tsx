import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false, 
  loading = false,
  icon
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary[600],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;