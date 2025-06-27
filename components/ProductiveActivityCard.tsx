import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Plus, CreditCard as Edit } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { ProductiveActivity } from '@/types';

interface ProductiveActivityCardProps {
  activity: ProductiveActivity;
  onAddToToday?: () => void;
  onEdit?: () => void;
  showAddButton?: boolean;
}

const ProductiveActivityCard = ({ 
  activity, 
  onAddToToday, 
  onEdit, 
  showAddButton = true 
}: ProductiveActivityCardProps) => {
  return (
    <View style={[styles.container, { borderLeftColor: activity.color }]}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{activity.icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{activity.name}</Text>
            {activity.description && (
              <Text style={styles.description}>{activity.description}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Edit size={16} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          <Text style={styles.category}>{activity.category}</Text>
          {activity.estimatedDuration && (
            <View style={styles.durationContainer}>
              <Clock size={12} color={COLORS.neutral[500]} />
              <Text style={styles.duration}>
                {activity.estimatedDuration} min
              </Text>
            </View>
          )}
        </View>
        
        {showAddButton && onAddToToday && (
          <TouchableOpacity style={styles.addButton} onPress={onAddToToday}>
            <Plus size={16} color={COLORS.primary[600]} />
            <Text style={styles.addButtonText}>Add to Today</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    textTransform: 'capitalize',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
});

export default ProductiveActivityCard;