import { createContext, useContext, ReactNode, useState } from 'react';
import {
  doc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
  Timestamp, deleteField
} from 'firebase/firestore';
import { db, auth } from '../config/firebase.config';
import type { ExerciseData, RoutineDay, Routine } from '../core/types/routine.types';

export type { ExerciseData, RoutineDay, Routine };

interface RoutinesContextType {
  routines: Record<string, Routine>;
  fetchRoutines: (trainerId: string, clientId: string) => Promise<void>;
  createRoutine: (routineData: Omit<Routine, 'createdAt'>) => Promise<string>;
  updateRoutine: (routineId: string, updates: Partial<Routine>) => Promise<void>;
  updateExercise: (
    routineId: string,
    dayId: string,
    exerciseId: string,
    updates: Partial<ExerciseData>
  ) => Promise<void>;
  logWorkoutTime: (
    routineId: string,
    dayId: string,
    time: Date | Timestamp | string | null
  ) => Promise<void>;
  addExercise: (
    routineId: string,
    dayId: string,
    exerciseData: Omit<ExerciseData, 'completed' | 'notes' | 'completedWeight' | 'completedReps' | 'completedRIR'>
  ) => Promise<void>;
  addDay: (routineId: string, dayId: string) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  deleteRoutineDay: (routineId: string, dayId: string) => Promise<void>;
  deleteExercise: (routineId: string, dayId: string, exerciseId: string) => Promise<void>;
  clearWorkoutTime?: (routineId: string, dayId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

export function RoutinesProvider({ children }: { children: ReactNode }) {
  const [routines, setRoutines] = useState<Record<string, Routine>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = async (trainerId: string, clientId: string) => {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user');

      let q = query(
        collection(db, 'rutinas'),
        where('entrenador_ID', '==', trainerId)
      );

      if (clientId) {
        q = query(q, where('cliente_ID', '==', clientId));
      }

      const snapshot = await getDocs(q);
      const routinesData: Record<string, Routine> = {};

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        routinesData[docSnap.id] = {
          id: docSnap.id,
          isActive: data.activo,
          clientId: data.cliente_ID,
          trainerId: data.entrenador_ID,
          createdAt: data.fechaCreacion,
          days: data.dias ? mapDaysFromFirestore(data.dias) : undefined
        };
      });

      setRoutines(routinesData);
    } catch (err) {
      console.error('Failed to fetch routines:', err);
      throw err;
    }
  };

  const mapDaysFromFirestore = (dias: Record<string, any>): Record<string, RoutineDay> => {
    const result: Record<string, RoutineDay> = {};
    for (const [dayId, day] of Object.entries(dias)) {
      result[dayId] = {
        workoutTime: day.horaEntrenamiento ?? null,
        exercises: day.ej ? mapExercisesFromFirestore(day.ej) : undefined
      };
    }
    return result;
  };

  const mapExercisesFromFirestore = (ej: Record<string, any>): Record<string, ExerciseData> => {
    const result: Record<string, ExerciseData> = {};
    for (const [exId, ex] of Object.entries(ej)) {
      result[exId] = {
        name: ex.nombre,
        expectedWeight: ex.pesoE,
        expectedReps: ex.repsE,
        expectedRIR: ex.RIRE,
        sets: ex.series,
        completed: ex.completado,
        notes: ex.observaciones,
        completedWeight: ex.pesoC,
        completedReps: ex.repsC,
        completedRIR: ex.RIRC
      };
    }
    return result;
  };

  const buildExerciseForFirestore = (
    ex: Omit<ExerciseData, 'completed' | 'notes' | 'completedWeight' | 'completedReps' | 'completedRIR'>
  ) => ({
    nombre: ex.name,
    pesoE: ex.expectedWeight,
    repsE: ex.expectedReps,
    RIRE: ex.expectedRIR,
    series: ex.sets ?? '',
    completado: false,
    observaciones: '',
    pesoC: null,
    repsC: null,
    RIRC: null
  });

  const createRoutine = async (routineData: Omit<Routine, 'createdAt'>) => {
    setLoading(true);
    try {
      const docRef = doc(collection(db, 'rutinas'));
      await setDoc(docRef, {
        activo: routineData.isActive ?? false,
        cliente_ID: routineData.clientId,
        entrenador_ID: routineData.trainerId,
        fechaCreacion: Timestamp.now(),
        dias: routineData.days ? buildDaysForFirestore(routineData.days) : {}
      });
      return docRef.id;
    } catch (err) {
      setError('Failed to create routine');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const buildDaysForFirestore = (days: Record<string, RoutineDay>) => {
    const result: Record<string, any> = {};
    for (const [dayId, day] of Object.entries(days)) {
      result[dayId] = {
        ej: day.exercises ? buildExercisesForFirestore(day.exercises) : {}
      };
    }
    return result;
  };

  const buildExercisesForFirestore = (exercises: Record<string, ExerciseData>) => {
    const result: Record<string, any> = {};
    for (const [exId, ex] of Object.entries(exercises)) {
      result[exId] = {
        nombre: ex.name,
        pesoE: ex.expectedWeight,
        repsE: ex.expectedReps,
        RIRE: ex.expectedRIR,
        series: ex.sets ?? '',
        completado: ex.completed,
        observaciones: ex.notes,
        pesoC: ex.completedWeight,
        repsC: ex.completedReps,
        RIRC: ex.completedRIR
      };
    }
    return result;
  };

  const addExercise = async (
    routineId: string,
    dayId: string,
    exerciseData: Omit<ExerciseData, 'completed' | 'notes' | 'completedWeight' | 'completedReps' | 'completedRIR'>
  ) => {
    setLoading(true);
    try {
      const firestoreExercise = buildExerciseForFirestore(exerciseData);
      const fieldPath = `dias.${dayId}.ej.${exerciseData.name}`;

      await updateDoc(doc(db, 'rutinas', routineId), {
        [fieldPath]: firestoreExercise
      });

      setRoutines(prev => {
        const routine = prev[routineId] || { days: {} };
        const days = routine.days || {};
        const day = days[dayId] || { exercises: {} };
        const exercises = day.exercises || {};

        return {
          ...prev,
          [routineId]: {
            ...routine,
            days: {
              ...days,
              [dayId]: {
                ...day,
                exercises: {
                  ...exercises,
                  [exerciseData.name]: {
                    ...exerciseData,
                    completed: false,
                    notes: '',
                    completedWeight: null,
                    completedReps: null,
                    completedRIR: null
                  }
                }
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Failed to add exercise');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addDay = async (routineId: string, dayId: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'rutinas', routineId), {
        [`dias.${dayId}`]: { ej: {} }
      });

      setRoutines(prev => {
        const routine = prev[routineId] || { days: {} };
        return {
          ...prev,
          [routineId]: {
            ...routine,
            days: {
              ...routine.days,
              [dayId]: { exercises: {} }
            }
          }
        };
      });
    } catch (err) {
      setError('Failed to add day');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRoutine = async (routineId: string, updates: Partial<Routine>) => {
    try {
      const firestoreUpdates: Record<string, any> = {};
      if (updates.isActive !== undefined) firestoreUpdates.activo = updates.isActive;
      if (updates.days !== undefined) firestoreUpdates.dias = buildDaysForFirestore(updates.days);

      await updateDoc(doc(db, 'rutinas', routineId), firestoreUpdates);

      setRoutines(prev => {
        const updated = { ...prev };
        if (updated[routineId]) {
          updated[routineId] = { ...updated[routineId], ...updates };
        }
        return updated;
      });
    } catch (err) {
      setError('Failed to update routine');
      console.error(err);
      throw err;
    }
  };

  const updateExercise = async (
    routineId: string,
    dayId: string,
    exerciseId: string,
    updates: Partial<ExerciseData>
  ) => {
    setLoading(true);
    try {
      const firestoreUpdates: Record<string, any> = {};
      if (updates.name !== undefined) firestoreUpdates.nombre = updates.name;
      if (updates.expectedWeight !== undefined) firestoreUpdates.pesoE = updates.expectedWeight;
      if (updates.expectedReps !== undefined) firestoreUpdates.repsE = updates.expectedReps;
      if (updates.expectedRIR !== undefined) firestoreUpdates.RIRE = updates.expectedRIR;
      if (updates.sets !== undefined) firestoreUpdates.series = updates.sets;
      if (updates.completed !== undefined) firestoreUpdates.completado = updates.completed;
      if (updates.notes !== undefined) firestoreUpdates.observaciones = updates.notes;
      if (updates.completedWeight !== undefined) firestoreUpdates.pesoC = updates.completedWeight;
      if (updates.completedReps !== undefined) firestoreUpdates.repsC = updates.completedReps;
      if (updates.completedRIR !== undefined) firestoreUpdates.RIRC = updates.completedRIR;

      const fieldPath = `dias.${dayId}.ej.${exerciseId}`;
      await updateDoc(doc(db, 'rutinas', routineId), {
        [fieldPath]: firestoreUpdates
      });

      setRoutines(prev => {
        const routine = prev[routineId] || {};
        const days = routine.days || {};
        const day = days[dayId] || {};
        const exercises = day.exercises || {};
        const exercise = exercises[exerciseId] || {};

        return {
          ...prev,
          [routineId]: {
            ...routine,
            days: {
              ...days,
              [dayId]: {
                ...day,
                exercises: {
                  ...exercises,
                  [exerciseId]: { ...exercise, ...updates }
                }
              }
            }
          }
        };
      });
    } catch (err) {
      setError('Failed to update exercise');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logWorkoutTime = async (
    routineId: string,
    dayId: string,
    time: Date | Timestamp | string | null
  ) => {
    setLoading(true);
    try {
      let workoutTime: Date | Timestamp | null = null;

      if (time !== null) {
        workoutTime = typeof time === 'string' ? new Date(time) : time;
      }

      await updateDoc(doc(db, 'rutinas', routineId), {
        [`dias.${dayId}.horaEntrenamiento`]: workoutTime
      });

      setRoutines(prev => {
        const routine = prev[routineId] || { days: {} };
        const days = routine.days || {};
        const day = days[dayId] || { exercises: {} };

        return {
          ...prev,
          [routineId]: {
            ...routine,
            days: {
              ...days,
              [dayId]: { ...day, workoutTime }
            }
          }
        };
      });
    } catch (err) {
      setError('Failed to log workout time');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearWorkoutTime = async (routineId: string, dayId: string) => {
    await logWorkoutTime(routineId, dayId, null);
  };

  const deleteRoutine = async (routineId: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'rutinas', routineId));
      setRoutines(prev => {
        const updated = { ...prev };
        delete updated[routineId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete routine:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete routine');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutineDay = async (routineId: string, dayId: string): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'rutinas', routineId), {
        [`dias.${dayId}`]: deleteField()
      });

      setRoutines(prev => {
        const updated = { ...prev };
        if (updated[routineId]?.days?.[dayId]) {
          delete updated[routineId].days![dayId];
        }
        return updated;
      });
    } catch (err) {
      setError('Failed to delete routine day');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (
    routineId: string,
    dayId: string,
    exerciseId: string
  ): Promise<void> => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'rutinas', routineId), {
        [`dias.${dayId}.ej.${exerciseId}`]: deleteField()
      });

      setRoutines(prev => {
        const updated = { ...prev };
        if (updated[routineId]?.days?.[dayId]?.exercises?.[exerciseId]) {
          delete updated[routineId].days![dayId].exercises![exerciseId];
        }
        return updated;
      });
    } catch (err) {
      setError('Failed to delete exercise');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoutinesContext.Provider value={{
      routines,
      fetchRoutines,
      createRoutine,
      updateRoutine,
      updateExercise,
      logWorkoutTime,
      addExercise,
      addDay,
      deleteRoutine,
      deleteRoutineDay,
      deleteExercise,
      clearWorkoutTime,
      loading,
      error
    }}>
      {children}
    </RoutinesContext.Provider>
  );
}

export const useRoutines = () => {
  const context = useContext(RoutinesContext);
  if (!context) throw new Error('useRoutines must be used within a RoutinesProvider');
  return context;
};
