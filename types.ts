export enum PlayerState {
  WARMUP = 'WARMUP',
  WORKING = 'WORKING',
  RESTING = 'RESTING',
  FINISHED = 'FINISHED',
}

export interface Equipment {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscle: string;
  requiredEquipment: string[];
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date
  exerciseId: string;
  sets: WorkoutSet[];
  totalVolumeLoad: number; // weight * reps
  estimated1RM: number;
}

export interface AnalyticsPoint {
  date: string;
  stress: number; // Daily Stress
  fitness: number; // CTL
  fatigue: number; // ATL
  form: number; // TSB
}

export interface UserSettings {
  equipment: Equipment[];
}