import { writable, derived } from 'svelte/store';
import { getUser } from '$firebase/services/userService';
import type { User } from "$firebase/types/userType";
import { browser } from "$app/environment";

let authStorePromise: Promise<typeof import("./authStore")> | null = null;
async function getAuthStore() {
    if (!authStorePromise) {
        authStorePromise = import("./authStore");
    }
    return authStorePromise;
}

interface UserStoreState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

function createUserStore() {
    const { subscribe, set, update } = writable<UserStoreState>({
        user: null,
        isLoading: false,
        error: null
    });

    async function loadUser(userId: string) {
        if (!userId) {
            update(state => ({ ...state, error: "No user ID provided", isLoading: false }));
            return;
        }

        update(state => ({ ...state, isLoading: true, error: null }));

        try {
            console.log(`Loading user data for ${userId}`);
            const userData = await getUser(userId);
            console.log("User data loaded:", userData ? "success" : "not found");
            update(state => ({ ...state, user: userData, isLoading: false }));
        } catch (error) {
            console.error("Error loading user:", error);
            update(state => ({ 
                ...state, 
                error: error instanceof Error ? error.message : "Failed to load user data", 
                isLoading: false 
            }));
        }
    }

    function reset() {
        set({ user: null, isLoading: false, error: null });
    }

    if (browser) {
        getAuthStore().then(({ authStore }) => {
            authStore.subscribe($authState => {
                if ($authState?.userId) {
                    loadUser($authState.userId);
                } else {
                    reset();
                }
            });
        }).catch(error => {
            console.error("Error loading authStore:", error);
        });
    }


    return {
        subscribe,
        loadUser,
        reset
    };
}

export const userStore = createUserStore();

export const userStats = derived(userStore, $userStore => $userStore.user?.stats || null);
export const userName = derived(userStore, $userStore => 
    $userStore.user ? `${$userStore.user.firstName} ${$userStore.user.lastName}` : ""
);