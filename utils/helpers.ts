import { COLORS } from '@/constants/theme';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get appropriate color for a progress value
export const getCompletionColorForProgress = (progress: number): string => {
  if (progress >= 0.8) return COLORS.success[500]; // Green for good (80-100%)
  if (progress >= 0.5) return COLORS.warning[500]; // Yellow for mid (50-80%)
  return COLORS.error[500]; // Red for bad (0-50%)
};

// Get label and color for progress
export const getCompletionStatus = (progress: number) => {
  if (progress >= 0.8) {
    return { 
      label: 'Great progress', 
      color: COLORS.success[600] 
    };
  } else if (progress >= 0.5) {
    return { 
      label: 'Good progress', 
      color: COLORS.warning[600] 
    };
  } else {
    return { 
      label: 'More effort needed', 
      color: COLORS.error[600] 
    };
  }
};

// Format seconds to a human-readable time string
export const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (minutes > 0 || hours > 0) {
    result += `${minutes}m `;
  }
  
  result += `${remainingSeconds}s`;
  
  return result.trim();
};