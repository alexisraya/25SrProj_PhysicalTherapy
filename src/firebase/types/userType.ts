/* ------------------------- MAIN USER DETAILS ------------------------- */
export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  isTherapist: boolean;
  createdAt: string;
  updatedAt: string;
  therapistId?: string;
  assignedExercises: AssignedExercise[];
  stats: UserStats;
  estimatedTime?: number;
  tooPainfulLogs?: TooPainfulLog[];
}

/* ------------------------- EACH EXERCISE DETAILS ------------------------- */
export interface AssignedExercise {
  exerciseId: string;
  exerciseName: string;
  exerciseType: 'distance' | 'weight' | 'time';
  order: number;
  equipment?: string;
  sets?: number;
  reps?: number;
  steps?: number;
  seconds?: number;
  weight?: number;
  completed: boolean;
  completedAt?: string;
  skipped?: boolean;
  adjustedSets?: number;
  adjustedReps?: number;
  adjustedSteps?: number;
  adjustedSeconds?: number;
  adjustedWeight?: number;
}

/* ------------------------- PROGRAM DETAILS ------------------------- */
export interface Program {
  exercises: AssignedExercise[];
  estimatedTime: number;
  assignedAt: string;
  completed: boolean;
  updatedAt?: string;
}

/* ------------------------- USER STATS DETAILS ------------------------- */
export interface UserStats {
  // STREAKS
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // ISO date string
  weeklyProgress: {
    weekStartDate: string; // ISO date string (Sunday)
    daysCompleted: number;
    exercisesCompleted: number;
  };

  // OVERALL STATS
  completedExercises: number;
  completedPrograms: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  totalDistance: number;
  totalTime: number;

  achievements: {
    [achieveId: string]: {
      unlocked: boolean;
      unlockedAt?: string;
    };
  };

  // HISTORICAL DATA
  streakHistory: {
    date: string;
    completed: boolean;
  }[];
}

/* ------------------------- TOO PAINFUL LOG DETAILS ------------------------- */
export interface TooPainfulLog {
  exerciseId: string;
  exerciseName: string;
  exerciseType: 'distance' | 'weight' | 'time';
  loggedAt: string;
}

/* ------------------------- METRICS (ROM AND STRENGTH) DETAILS ------------------------- */
export interface RangeOfMotion {
  month: number;
  degrees: number;
}

export interface Strength {
  month: number;
  strengthScale: number;
}

export interface UserMetrics {
  userId: string;
  rangeOfMotion: RangeOfMotion[];
  strength: Strength[];
  updatedAt: string;
}
