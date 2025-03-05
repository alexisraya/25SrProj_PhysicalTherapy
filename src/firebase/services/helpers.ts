// NOT SURE IF THIS FILE IS STILL NEEDED - DONT WORRY ABOUT THIS FOR NOW - SAB MIGHT REMOVE IT

import type { UserStats } from "../types/userType";

export function getWeekStartDate(date: Date = new Date()): string {
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString();
}

export function initializeUserStats(): UserStats {
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        weeklyProgress: {
            weekStartDate: getWeekStartDate(),
            daysCompleted: 0,
            exercisesCompleted: 0
        },
        completedExercises: 0,
        completedPrograms: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        totalDistance: 0,
        totalTime: 0,
        streakHistory: [],
        achievements: {}
    };
}