export enum MetricType {
    RangeOfMotion = "range of motion",
    Strength = "strength"
}

export type TherapistMetric = {
    metricType: MetricType; // "range of motion" or "strength"
    metric: number; // 3
    collectionDate: Date; // 12/15/2024
}