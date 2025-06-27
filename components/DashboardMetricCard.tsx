import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Pin, PinOff } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { DashboardMetric } from '@/types';

interface DashboardMetricCardProps {
  metric: DashboardMetric;
  onTogglePin?: () => void;
  showPinButton?: boolean;
}

const DashboardMetricCard = ({ 
  metric, 
  onTogglePin, 
  showPinButton = false 
}: DashboardMetricCardProps) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp size={16} color={COLORS.success[600]} />;
      case 'down':
        return <TrendingDown size={16} color={COLORS.error[600]} />;
      default:
        return <Minus size={16} color={COLORS.neutral[500]} />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return COLORS.success[600];
      case 'down':
        return COLORS.error[600];
      default:
        return COLORS.neutral[500];
    }
  };

  return (
    <View style={[styles.container, metric.isPinned && styles.pinnedContainer]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: metric.color + '20' }]}>
          <Text style={[styles.icon, { color: metric.color }]}>{metric.icon}</Text>
        </View>
        
        {showPinButton && onTogglePin && (
          <TouchableOpacity onPress={onTogglePin} style={styles.pinButton}>
            {metric.isPinned ? (
              <PinOff size={16} color={COLORS.neutral[500]} />
            ) : (
              <Pin size={16} color={COLORS.neutral[400]} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{metric.title}</Text>
      <Text style={styles.value}>{metric.value}</Text>
      
      {metric.subtitle && (
        <Text style={styles.subtitle}>{metric.subtitle}</Text>
      )}
      
      {metric.trend && metric.trendValue && (
        <View style={styles.trendContainer}>
          {getTrendIcon()}
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {metric.trendValue}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 120,
  },
  pinnedContainer: {
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    backgroundColor: COLORS.primary[25],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  pinButton: {
    padding: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});

export default DashboardMetricCard;