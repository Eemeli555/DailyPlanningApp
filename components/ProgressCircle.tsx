import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

interface ProgressCircleProps {
  percentage: number; // 0 to 100
  color: string;
  size: number;
  strokeWidth?: number;
  textColor?: string;
}

const ProgressCircle = ({
  percentage,
  color,
  size,
  strokeWidth = 8,
  textColor = COLORS.neutral[800],
}: ProgressCircleProps) => {
  const animatedPercentage = useSharedValue(0);
  
  useEffect(() => {
    animatedPercentage.value = withTiming(percentage, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [percentage]);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgressStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - (animatedPercentage.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });
  
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.neutral[200]}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
          style={animatedProgressStyle}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={[styles.percentageText, { color: textColor }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default ProgressCircle;