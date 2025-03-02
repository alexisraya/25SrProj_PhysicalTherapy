import { db } from "$lib/helpers/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

const goals = [
    // Month 1
    {
        goalId: "goal-1",
        goalName: "Get Off Couch",
        description: "You can easily stand up from a sitting position on the couch.",
        month: 1,
        timeframe: "2 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-2",
        goalName: "Sit Through Work Meeting",
        description: "You can sit comfortably for an hour at a time, allowing you to focus on work or enjoy a long meal with friends.",
        month: 1,
        timeframe: "4 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-3",
        goalName: "Lift Groceries",
        description: "You can squat down to pick up items like groceries or toys from the floor without discomfort.",
        month: 1,
        timeframe: "4 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-4",
        goalName: "Stand in Checkout Line",
        description: "You can stand comfortably for 15 minutes, making it easier to shop for groceries or wait in line.",
        month: 1,
        timeframe: "4 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-5",
        goalName: "Sleep Through the Night",
        description: "You can sleep for 6 hours straight without pain waking you up.",
        month: 1,
        timeframe: "4 weeks",
        unlocked: false,
    },

    // Month 2
    {
        goalId: "goal-6",
        goalName: "Climb Stairs",
        description: "You can safely go up and down stairs step-by-step.",
        month: 2,
        timeframe: "6 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-7",
        goalName: "Cook a Meal",
        description: "You can stand for an hour without your symptoms getting worse.",
        month: 2,
        timeframe: "6 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-8",
        goalName: "Take a Leisurely Walk",
        description: "You can walk moderate distances for over 20 minutes without your symptoms increasing.",
        month: 2,
        timeframe: "6 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-9",
        goalName: "Drive a Car",
        description: "You can drive without pain and without needing pain medication.",
        month: 2,
        timeframe: "6 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-10",
        goalName: "Lift a Basket of Laundry",
        description: "You can safely lift and carry items up to 10 pounds.",
        month: 2,
        timeframe: "8 weeks",
        unlocked: false,
    },

    // Month 3
    {
        goalId: "goal-11",
        goalName: "Light Running",
        description: "You can go for a light jog or run without experiencing knee pain or swelling afterwards.",
        month: 3,
        timeframe: "12 weeks",
        unlocked: false,
    },
    {
        goalId: "goal-12",
        goalName: "Jump Rope",
        description: "You can comfortably jump rope for 3-5 minutes.",
        month: 3,
        timeframe: "12 weeks",
        unlocked: false,
    },
    
    // Month 4
    {
        goalId: "goal-13",
        goalName: "Jump a Trampoline",
        description: "You can jump with both feet on a mini trampoline.",
        month: 4,
        timeframe: "14 weeks",
        unlocked: false,
    },

    // Month 5
    {
        goalId: "goal-14",
        goalName: "Kick a Soccer Ball",
        description: "You can kick a soccer ball forward while maintaining balance.",
        month: 5,
        timeframe: "20 weeks",
        unlocked: false,
    },

    // Month 6
    {
        goalId: "goal-15",
        goalName: "Jump over Hurdles",
        description: "You can clear small hurdles or obstacles, demonstrating improved knee strength and stability.",
        month: 6,
        timeframe: "22 weeks",
        unlocked: false,
    },
];

export async function seedGoals() {
    const goalsRef = collection(db, "goals");
    const existingGoalsSnapshot = await getDocs(goalsRef);
    const existingGoalIds = new Set(existingGoalsSnapshot.docs.map(doc => doc.id));

    for (const goal of goals) {
        const goalRef = doc(db, "goals", goal.goalId);

        if (!existingGoalIds.has(goal.goalId)) {
            const goalRef = doc(db, "goals", goal.goalId);
            await setDoc(goalRef, goal);
            console.log(`Goal ${goal.goalId} added to Firestore`);
        } else {
            await setDoc(goalRef, goal, { merge: true });
            console.log(`Goal ${goal.goalId} already exists, skipping`);
        }
    }
}