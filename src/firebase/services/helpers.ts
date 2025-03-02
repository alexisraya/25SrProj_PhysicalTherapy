// NOT SURE IF THIS FILE IS STILL NEEDED - DONT WORRY ABOUT THIS FOR NOW - SAB MIGHT REMOVE IT

import type { UserStats } from "../types/userType";

export function getWeekStartDate(date: Date = new Date()): string {
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());
    sunday.setHours(0, 0, 0, 0);
    return sunday.toISOString();
}

export function calculateStreak(streakHistory: UserStats['streakHistory']): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = streakHistory.length - 1; i >= 0; i--) {
        const date = new Date(streakHistory[i].date);
        date.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) break;
        if (streakHistory[i].completed) streak++;
    }

    return streak;
}

export function calculateWeeklyStreak(
    streakHistory: UserStats['streakHistory'],
    weekStartDate: string
): boolean {
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekEntries = streakHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate < weekEnd && entry.completed;
    });

    const uniqueDays = new Set(
        weekEntries.map(entry => entry.date.split('T')[0])
    );

    return uniqueDays.size >= 5;
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