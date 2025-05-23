import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Minus } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { Exercise } from '@/types';
import Button from '@/components/Button';

export default function AddWorkoutScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      duration: 0,
      notes: '',
    },
  ]);

  const addExercise = () => {
    setExercises(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: '',
        sets: 3,
        reps: 10,
        weight: 0,
        duration: 0,
        notes: '',
      },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id ? { ...exercise, ...updates } : exercise
      )
    );
  };

  const handleSave = () => {
    if (!name.trim() || exercises.some(e => !e.name.trim())) return;

    // Calculate total duration based on exercises
    const totalDuration = exercises.reduce((total, exercise) => {
      const exerciseDuration = exercise.duration || 0;
      return total + (exerciseDuration * exercise.sets);
    }, 0);

    // TODO: Add workout to context
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.content}>
        <Text style={styles.label}>Workout Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter workout name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter workout description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
                {exercises.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeExercise(exercise.id)}
                    style={styles.removeButton}
                  >
                    <Minus size={20} color={COLORS.error[600]} />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Exercise name"
                value={exercise.name}
                onChangeText={(text) => updateExercise(exercise.id, { name: text })}
              />

              <View style={styles.exerciseDetails}>
                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="number-pad"
                    value={exercise.sets.toString()}
                    onChangeText={(text) =>
                      updateExercise(exercise.id, { sets: parseInt(text) || 0 })
                    }
                  />
                </View>

                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="number-pad"
                    value={exercise.reps.toString()}
                    onChangeText={(text) =>
                      updateExercise(exercise.id, { reps: parseInt(text) || 0 })
                    }
                  />
                </View>

                <View style={styles.detailColumn}>
                  <Text style={styles.detailLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="number-pad"
                    value={exercise.weight?.toString() || '0'}
                    onChangeText={(text) =>
                      updateExercise(exercise.id, { weight: parseInt(text) || 0 })
                    }
                  />
                </View>
              </View>

              <View style={styles.durationContainer}>
                <Text style={styles.detailLabel}>Duration (seconds)</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="number-pad"
                  value={exercise.duration?.toString() || '0'}
                  onChangeText={(text) =>
                    updateExercise(exercise.id, { duration: parseInt(text) || 0 })
                  }
                />
              </View>

              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notes (optional)"
                value={exercise.notes}
                onChangeText={(text) => updateExercise(exercise.id, { notes: text })}
                multiline
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={addExercise}
          >
            <Plus size={20} color={COLORS.primary[600]} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        <Button
          title="Save Workout"
          onPress={handleSave}
          disabled={!name.trim() || exercises.some(e => !e.name.trim())}
          style={[
            styles.saveButton,
            (!name.trim() || exercises.some(e => !e.name.trim())) && styles.disabledButton,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  exercisesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.neutral[800],
  },
  removeButton: {
    padding: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailColumn: {
    flex: 1,
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: COLORS.neutral[900],
  },
  durationContainer: {
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: COLORS.white,
    height: 80,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    borderStyle: 'dashed',
  },
  addExerciseText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: COLORS.primary[600],
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.neutral[700],
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.neutral[300],
  },
});