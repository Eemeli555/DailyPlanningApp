import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon, Clock, ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface QuizReminderCardProps {
  type: 'morning' | 'evening';
  onPress: () => void;
  isRecommended?: boolean;
}

const QuizReminderCard = ({ type, onPress, isRecommended = false }: QuizReminderCardProps) => {
  const isMorning = type === 'morning';
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isMorning ? styles.morningContainer : styles.eveningContainer,
        isRecommended && styles.recommendedContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isMorning ? (
          <Sun size={24} color={COLORS.warning[600]} />
        ) : (
          <Moon size={24} color={COLORS.secondary[600]} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          isMorning ? styles.morningTitle : styles.eveningTitle
        ]}>
          {isMorning ? 'Morning Planning' : 'Evening Reflection'}
        </Text>
        
        <Text style={[
          styles.description,
          isMorning ? styles.morningDescription : styles.eveningDescription
        ]}>
          {isMorning 
            ? 'Set your intentions and plan your day' 
            : 'Reflect on your day and prepare for tomorrow'}
        </Text>
        
        {isRecommended && (
          <View style={[
            styles.recommendedBadge,
            isMorning ? styles.morningRecommended : styles.eveningRecommended
          ]}>
            <Clock size={12} color={isMorning ? COLORS.warning[700] : COLORS.secondary[700]} />
            <Text style={[
              styles.recommendedText,
              isMorning ? styles.morningRecommendedText : styles.eveningRecommendedText
            ]}>
              Recommended now
            </Text>
          </View>
        )}
      </View>
      
      <ChevronRight 
        size={20} 
        color={isMorning ? COLORS.warning[600] : COLORS.secondary[600]} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  morningContainer: {
    backgroundColor: COLORS.warning[50],
    borderLeftColor: COLORS.warning[500],
  },
  eveningContainer: {
    backgroundColor: COLORS.secondary[50],
    borderLeftColor: COLORS.secondary[500],
  },
  recommendedContainer: {
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  morningTitle: {
    color: COLORS.warning[800],
  },
  eveningTitle: {
    color: COLORS.secondary[800],
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  morningDescription: {
    color: COLORS.warning[700],
  },
  eveningDescription: {
    color: COLORS.secondary[700],
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  morningRecommended: {
    backgroundColor: COLORS.warning[100],
  },
  eveningRecommended: {
    backgroundColor: COLORS.secondary[100],
  },
  recommendedText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  morningRecommendedText: {
    color: COLORS.warning[700],
  },
  eveningRecommendedText: {
    color: COLORS.secondary[700],
  },
});

export default QuizReminderCard;