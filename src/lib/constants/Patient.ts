import type { Exercise } from "./Exercise";
import type { GoalsAchievements } from "./Goals";
import type { TherapistMetric } from "./TherapistMetric";

export type Patient = {
    name: string; // John Doe
    stare_date: Date; // 11/01/2024
    expected_end_date: Date; // 3/01/2024
    injury: string; // "knee"
    program: Exercise[]; // TODO: Alexis Restructure
    streak?: number; // 5
    current_range_of_motion?: TherapistMetric; // {MetricType.RangeOfMotion, 90, 12/15/2024}
    current_strength?: TherapistMetric; // {MetricType.Strength, 3, 12/15/2024}
    history_range_of_motion?: TherapistMetric[]; // [{MetricType.Strength, 3, 12/07/2024}, {MetricType.Strength, 2, 11/01/2024}]
    history_strength?: TherapistMetric[]; // [{MetricType.RangeOfMotion, 90, 12/15/2024}, {MetricType.RangeOfMotion, 90, 12/15/2024}]
    milestones: GoalsAchievements[]; // TODO: restructure
    achievements: GoalsAchievements[]; // TODO: restructure
}