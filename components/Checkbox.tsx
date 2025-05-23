import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const Checkbox = ({ checked, onPress, style, disabled = false }: CheckboxProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.checkbox,
        checked && styles.checked,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {checked && <Check size={16} color={COLORS.white} strokeWidth={3} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Checkbox;