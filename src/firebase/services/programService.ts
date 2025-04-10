import { db } from '$lib/helpers/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { AssignedExercise, Program } from '../types/userType';

/* ------------------------- PROGRAM FUNCTIONS ------------------------- */
export async function assignProgram(
  userId: string,
  exercises: AssignedExercise[] = [], // Default
  estimatedTime: number = 30 // Default
): Promise<void> {
  if (!userId) {
    console.error('Error: Invalid user ID passed to assignProgram');
    throw new Error('Invalid data: Cannot assign program without a user ID.');
  }

  const cleanedExercises = exercises.map((exercise) => {
    return Object.fromEntries(
      Object.entries(exercise).map(([key, value]) => [key, value === undefined ? null : value])
    );
  });

  const programRef = doc(db, 'users', userId, 'program', 'currentProgram');

  const programData = {
    exercises: cleanedExercises,
    estimatedTime: estimatedTime,
    assignedAt: new Date().toISOString(),
    completed: false
  };

  console.log('Writing to Firestore:', programData);

  await setDoc(programRef, programData);
}

export async function getCurrentProgram(userId: string): Promise<Program | null> {
  try {
    const programRef = doc(db, 'users', userId, 'program', 'currentProgram');
    const snap = await getDoc(programRef);
    return snap.exists() ? (snap.data() as Program) : null;
  } catch (error) {
    console.error('Error fetching program:', error);
    return null;
  }
}

export async function updateProgram(userId: string, updates: Partial<Program>): Promise<void> {
  try {
    const sanitizedUpdates = JSON.parse(
      JSON.stringify(updates, (_, value) => (value === undefined ? null : value))
    );

    const programRef = doc(db, 'users', userId, 'program', 'currentProgram');
    await updateDoc(programRef, {
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
}

export async function isProgramCompleted(userId: string): Promise<boolean> {
  const program = await getCurrentProgram(userId);
  if (!program) return false;

  return program.exercises.every((ex) => ex.completed || ex.skipped);
}

export async function updateExerciseOrder(userId: string, newOrder: string[]): Promise<void> {
  const program = await getCurrentProgram(userId);
  if (!program) return;

  const exerciseMap = new Map(program.exercises.map((ex) => [ex.exerciseId, ex]));
  const updatedExercises = newOrder
    .map((id, index) => {
      const exercise = exerciseMap.get(id);
      return exercise ? { ...exercise, order: index } : null;
    })
    .filter((ex): ex is AssignedExercise => ex !== null);

  await updateProgram(userId, { exercises: updatedExercises });
}

export async function moveExerciseToEnd(
  userId: string,
  exerciseId: string
): Promise<string | null> {
  try {
    const program = await getCurrentProgram(userId);
    if (!program) {
      throw new Error('Program not found');
    }

    const currentExerciseIndex = program.exercises.findIndex((ex) => ex.exerciseId === exerciseId);

    if (currentExerciseIndex === -1) {
      throw new Error('Exercise not found in program');
    }

    let updatedExercises = [...program.exercises];
    const exerciseToMove = updatedExercises.splice(currentExerciseIndex, 1)[0];
    updatedExercises.push(exerciseToMove);
    updatedExercises = updatedExercises.map((ex, i) => ({
      ...ex,
      order: i
    }));

    await updateProgram(userId, { exercises: updatedExercises });

    let nextExerciseId = null;

    for (let i = currentExerciseIndex; i < updatedExercises.length - 1; i++) {
      if (!updatedExercises[i].completed && !updatedExercises[i].skipped) {
        nextExerciseId = updatedExercises[i].exerciseId;
        break;
      }
    }

    if (!nextExerciseId) {
      for (let i = 0; i < currentExerciseIndex; i++) {
        if (!updatedExercises[i].completed && !updatedExercises[i].skipped) {
          nextExerciseId = updatedExercises[i].exerciseId;
          break;
        }
      }
    }

    return nextExerciseId;
  } catch (error) {
    console.error('Error moving exercise to end:', error);
    throw error;
  }
}
