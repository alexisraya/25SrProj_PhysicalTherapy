import { db } from "$lib/helpers/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

interface BaseGoal {
    goalId: string;
    goalName: string;
    description: string;
    month: number; // or string????
    timeframe: string;
    unlocked: boolean;
}