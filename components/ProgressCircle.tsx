import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';

// Only import SVG components on native platforms
let Svg: any, Circle: any, AnimatedCircle: any;

if (Platform.OS !== 'web') {
  const SvgModule = require('react-native-svg');
  Svg = SvgModule.Svg;
  Circle = SvgModule.Circle;
  AnimatedCircle = Animated.createAnimatedComponent(Circle);
}

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
  
  // Web fallback - simple circular progress using CSS
  if (Platform.OS === 'web') {
    const animatedStyle = useAnimatedStyle(() => {
      const rotation = (animatedPercentage.value / 100) * 360;
      return {
        transform: [{ rotate: `${rotation}deg` }],
      };
    });

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[
          styles.webCircleContainer, 
          { 
            width: size, 
            height: size, 
            borderWidth: strokeWidth,
            borderColor: COLORS.neutral[200],
          }
        ]}>
          <Animated.View 
            style={[
              styles.webProgressCircle,
              {
                width: size - strokeWidth * 2,
                height: size - strokeWidth * 2,
                borderWidth: strokeWidth,
                borderTopColor: color,
                borderRightColor: color,
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
              },
              animatedStyle
            ]}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.percentageText, { color: textColor }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    );
  }

  // Native implementation with SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedProgressStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - (animatedPercentage.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

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
  // Web-specific styles
  webCircleContainer: {
    borderRadius: 9999, // Very large number for perfect circle
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webProgressCircle: {
    borderRadius: 9999,
    position: 'absolute',
  },
});

export default ProgressCircle;