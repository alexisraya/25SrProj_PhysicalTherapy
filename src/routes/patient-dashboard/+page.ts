import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '$lib/helpers/firebase';
import { authStore } from "$stores/authStore";
import { getCurrentProgram } from "$firebase/services/programService";
import {
    getUserStats,
    getWeeklyProgress,
    checkAndResetProgress,
} from "$firebase/services/statService";
import { browser } from '$app/environment';

// Disable SSR for this page
export const ssr = false;

export const load: PageLoad = async ({ depends }) => {
    // Only proceed with authentication on the client side
    if (browser) {
        // Wait for authentication to be ready before proceeding
        return new Promise((resolve) => {
            const unsubscribe = authStore.subscribe(auth => {
                // Check if auth is still loading
                if (auth.isLoading) {
                    // Don't do anything yet, wait for the next update
                    return;
                }
                
                // Auth is no longer loading, we can unsubscribe
                unsubscribe();
                
                // Check if user is authenticated
                if (!auth.currentUser) {
                    // Redirect to login if not authenticated
                    throw redirect(302, '/login');
                }
                
                // User is authenticated, proceed with data loading
                const userId = auth.currentUser.uid;
                
                // Load the data
                const loadData = async () => {
                    try {
                        await checkAndResetProgress(userId);
                        
                        const [program, stats, weeklyProgress, userData] = await Promise.all([
                            getCurrentProgram(userId),
                            getUserStats(userId),
                            getWeeklyProgress(userId),
                            (await getDoc(doc(db, 'users', userId))).data(),
                        ]);
                        
                        resolve({
                            program,
                            stats,
                            weeklyProgress,
                            userData,
                            error: null
                        });
                    } catch (err) {
                        console.error("Error loading completion data:", err);
                        
                        resolve({
                            program: null,
                            stats: null,
                            weeklyProgress: null,
                            userData: null,
                            error: err instanceof Error ? err.message : "Failed to load completion data"
                        });
                    }
                };
                
                // Execute the data loading
                loadData();
            });
        });
    }
    
    // Return loading state for server-side (though with ssr=false, this shouldn't execute)
    return {
        program: null,
        stats: null,
        weeklyProgress: null,
        loading: true
    };
};