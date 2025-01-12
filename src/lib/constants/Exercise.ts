export type Exercise = {
    exerciseId: number;
    title: string; // "Long Sitting Quad Set"
    description: string; // "This exercise helps to..."
    reps: number; // 10
    set: number; // 3
    equipment: string;
    image: string;
    hasBeenCompleted: boolean; // false
    hasBeenSkipped: boolean; // false
    material?: string; // kettle bell
    weight?: string; // 3 lbs
    order?: number; // 1
}