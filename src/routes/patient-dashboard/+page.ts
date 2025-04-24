import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '$lib/helpers/firebase';
import { authStore } from '$stores/authStore';
import { getCurrentProgram } from '$firebase/services/programService';
import {
  getUserStats,
  getWeeklyProgress,
  checkAndResetProgress
} from '$firebase/services/statService';
import { browser } from '$app/environment';

// Disable SSR for this page
export const ssr = false;

export const load: PageLoad = async () => {
  // Only proceed with authentication on the client side
  if (browser) {
    // Wait for authentication to be ready before proceeding
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        // Timeout safety to prevent infinite loading
        console.warn('Auth subscription timed out - proceeding with null data');
        
        if (window.location.pathname === '/patient-dashboard') {
          window.location.reload();
        }
        
        resolve({
          program: null,
          stats: null,
          weeklyProgress: null,
          userData: null,
          error: 'Authentication timed out'
        });
      }, 5000); // 5 second timeout
      
      let unsubscribe: (() => void) | undefined;

      // Define a safe cleanup function that can be called anytime
      const cleanup = () => {
        if (unsubscribe) {
          unsubscribe();
          clearTimeout(timeout);
        }
      };

      // Now initialize unsubscribe
      unsubscribe = authStore.subscribe((auth) => {
        // Check if auth is still loading
        if (auth.isLoading) {
          // Don't do anything yet, wait for the next update
          return;
        }

        // Auth is no longer loading, we can unsubscribe
        cleanup();

        // Check if user is authenticated
        if (!auth.currentUser) {
          // Return an object instead of redirecting to prevent race conditions
          resolve({
            program: null,
            stats: null,
            weeklyProgress: null,
            userData: null,
            error: 'Not authenticated'
          });
          return;
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
              (await getDoc(doc(db, 'users', userId))).data()
            ]);

            // If we're on the patient dashboard, ensure the nav is visible
            if (window.location.pathname === '/patient-dashboard') {
              // Force render with minimal data if program is missing
              if (!program || !stats || !weeklyProgress) {
                resolve({
                  program: program || { completed: false, exercises: [] },
                  stats: stats || { longestStreak: 0 },
                  weeklyProgress: weeklyProgress || { daysCompleted: 0, daysNeededForStreak: 5 },
                  userData: userData || { firstName: 'User' },
                  error: null
                });
                return;
              }
            }

            resolve({
              program,
              stats,
              weeklyProgress,
              userData,
              error: null
            });
          } catch (err) {
            console.error('Error loading completion data:', err);

            resolve({
              program: null,
              stats: null,
              weeklyProgress: null,
              userData: null,
              error: err instanceof Error ? err.message : 'Failed to load completion data'
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
