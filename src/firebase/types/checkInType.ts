import type { FieldValue } from "firebase/firestore";

export interface CheckIn {
    id?: string;
    userId: string;
    timestamp: Date | FieldValue;
    date: string;
    painLevel: number;
    moodLevel: number;
  }
  
  export interface CheckInStats {
    startDate: Date;
    endDate: Date;
    checkIns: CheckIn[];
    averagePainLevel: number;
    averageMoodLevel: number;
  }
  
  export enum MoodRating {
    Motivated = 1,
    Hopeful = 2,
    Indifferent = 3,
    Uncertain = 4,
    Discouraged = 5
  }
  
  export function getMoodDescription(moodValue: number): string {
    switch (moodValue) {
      case 1: return "Motivated";
      case 2: return "Hopeful";
      case 3: return "Indifferent";
      case 4: return "Uncertain";
      case 5: return "Discouraged";
      default: return "Unknown";
    }
  }
  
  export function getPainDescription(painValue: number): string {
    switch (painValue) {
      case 1: return "No Pain";
      case 2: return "Very Mild Pain";
      case 3: return "Mild Pain";
      case 4: return "Moderate Pain";
      case 5: return "Moderate Pain";
      case 6: return "Moderately Severe Pain";
      case 7: return "Severe Pain";
      case 8: return "Severe Pain";
      case 9: return "Severe Pain";
      case 10: return "Very Severe Pain";
      default: return "Unknown";
    }
  }