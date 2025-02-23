import { db } from "$lib/helpers/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// Base achievement interface with common fields
interface BaseExercise {
    achieveId: string;
    achieveName: string;
    achieveType: 'distance' | 'weight' | 'time';
}