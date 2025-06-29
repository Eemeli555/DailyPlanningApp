import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Platform } from 'react-native';
import { X, Clock } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/theme';
import { INTENT_REASONS } from '@/utils/socialMediaTracking';
import { TrackedApp } from '@/types';

interface IntentPromptModalProps {
  visible: boolean;
  app: TrackedApp | null;
  onResponse: (reason: string, proceeded: boolean) => void;
  onSkip: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IntentPromptModal = ({ visible, app, onResponse, onSkip }: IntentPromptModalProps) => {
  const [countdown, setCountdown] = useState(5);
  const [showSkipOption, setShowSkipOption] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCountdown(5);
      setShowSkipOption(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowSkipOption(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  const handleReasonSelect = (reason: string) => {
    onResponse(reason, true);
  };

  const handleSkip = () => {
    onResponse('skipped', false);
    onSkip();
  };

  if (!app) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <Animated.View 
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <Animated.View 
          entering={SlideInUp.delay(100).springify()}
          style={styles.modal}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.appIcon, { backgroundColor: app.color + '20' }]}>
              <Text style={[styles.appIconText, { color: app.color }]}>
                {app.displayName.charAt(0)}
              </Text>
            </View>
            
            <View style={styles.headerContent}>
              <Text style={styles.appName}>{app.displayName}</Text>
              <Text style={styles.promptText}>Why are you opening this app?</Text>
            </View>

            {countdown > 0 && (
              <View style={styles.countdownContainer}>
                <Clock size={16} color={COLORS.neutral[500]} />
                <Text style={styles.countdownText}>{countdown}s</Text>
              </View>
            )}
          </View>

          {/* Reason Buttons */}
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>Take a moment to reflect:</Text>
            
            <View style={styles.reasonsGrid}>
              {INTENT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[styles.reasonButton, { borderColor: reason.color }]}
                  onPress={() => handleReasonSelect(reason.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reasonEmoji}>{reason.emoji}</Text>
                  <Text style={[styles.reasonLabel, { color: reason.color }]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {showSkipOption ? (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <X size={16} color={COLORS.neutral[600]} />
                <Text style={styles.skipButtonText}>Continue without reflecting</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  You can skip in {countdown} seconds...
                </Text>
              </View>
            )}
          </View>

          {/* Mindfulness Quote */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>
              "The best way to take care of the future is to take care of the present moment."
            </Text>
            <Text style={styles.quoteAuthor}>— Thich Nhat Hanh</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appIconText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  headerContent: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[600],
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  countdownText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  reasonsContainer: {
    padding: 24,
  },
  reasonsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 20,
    textAlign: 'center',
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  reasonButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    shadowColor: COLORS.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reasonEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  reasonLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral[100],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  waitingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
  quoteContainer: {
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  quote: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.primary[700],
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 4,
  },
  quoteAuthor: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
    textAlign: 'center',
  },
});

export default IntentPromptModal;