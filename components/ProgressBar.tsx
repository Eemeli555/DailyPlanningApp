import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';
import { getCompletionColorForProgress } from '@/utils/helpers';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
}

const ProgressBar = ({ 
  progress, 
  height = 8, 
  backgroundColor = COLORS.neutral[200] 
}: ProgressBarProps) => {
  const animatedProgress = useSharedValue(0);
  
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress]);
  
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
      backgroundColor: getCompletionColorForProgress(animatedProgress.value),
    };
  });

  return (
    <View 
      style={[
        styles.container, 
        { 
          height,
          backgroundColor,
          borderRadius: height / 2,
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.progress,
          { borderRadius: height / 2 },
          progressBarStyle,
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});

export default ProgressBar;