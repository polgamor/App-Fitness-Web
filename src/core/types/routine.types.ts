import type { Timestamp } from 'firebase/firestore';

export interface ExerciseData {
  name: string;
  expectedWeight: number;
  expectedReps: number;
  expectedRIR: number;
  sets?: string;
  completed: boolean;
  notes: string;
  completedWeight: number | null;
  completedReps: number | null;
  completedRIR: number | null;
}

export interface RoutineDay {
  exercises?: {
    [exerciseId: string]: ExerciseData;
  };
  workoutTime?: Date | Timestamp | null;
}

export interface Routine {
  id?: string;
  isActive: boolean;
  clientId: string;
  trainerId: string;
  createdAt: Timestamp;
  days?: {
    [dayId: string]: RoutineDay;
  };
}
