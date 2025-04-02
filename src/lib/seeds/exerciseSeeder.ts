import { db } from '$lib/helpers/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const exercises = [
  // Distance-based exercises
  {
    exerciseId: 'side-stepping',
    exerciseName: 'Side Stepping',
    instructions:
      "1. Place band around your ankles or arches of your feet. 2. Take ~10-15 steps to one side, keeping your knees over your toes (don't let your knees cave in).",
    information:
      "This movement helps you get back to those side-to-side motions that your knee needs to handle in daily life and sports. By strengthening your hips and knees, you'll feel more confident and stable when shifting weight, bending, or moving laterally.",
    exerciseType: 'distance',
    defaultSets: 3,
    defaultSteps: 10,
    equipment: 'Resistance band',
    modification:
      'Move the resistance band higher, just above your knees, to reduce resistance and strain on your joints. If still painful, try performing the movement without a band.'
  },
  {
    exerciseId: 'monster-walk',
    exerciseName: 'Monster Walk',
    instructions:
      '1. Place band around your ankles. 2. Zig-zag step forward, bringing your feet together each time, for 10-15 steps forward. 3. Then, zig-zag step backwards.',
    information:
      "This exercise works on strengthening your hip muscles, glutes, and quads. These muscles play a big role in knee stability, so by training them, you're helping your knee move safely and effectively. This exercise also prepares your body for activities that require side-to-side movement, like walking or playing sports.",
    exerciseType: 'distance',
    defaultSets: 3,
    defaultSteps: 10,
    equipment: 'Resistance band',
    modification:
      'Place the band just above your knees instead of around your ankles to reduce resistance and strain. If still painful, try performing the movement without a band.'
  },

  // Weight-based exercises
  {
    exerciseId: 'bulgarian-split-squat',
    exerciseName: 'Bulgarian Split Squat',
    instructions:
      "1. Stand in front of a bench and place one foot back up on it (doesn't matter if your toes are curled under of the top of your foot is resting on the bench). 2. With the majority of your weight on that standing leg, squat up and down, keeping your knee in line with your hips and making your hips/trunk wiggle as minimally as possible. Note: Use a balance pole/wall for support as needed!",
    information:
      "This squat variation is excellent for building strength in your legs while focusing on knee stability. It targets your quads and glutes, helping to improve balance and mobility. By using the bench for support, you'll also work on your stability, which is important for movements like walking upstairs or standing up from a low position.",
    exerciseType: 'weight',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 20,
    equipment: 'Dumbbell',
    modification:
      'For additional balance or support, hold onto a wall or balance pole. If you are using a weight, try decreasing it or removing it altogether.'
  },
  {
    exerciseId: 'straight-leg-raise',
    exerciseName: 'Straight Leg Raise',
    instructions:
      "1. Lay on your back, other knee bent (this will serve as your target height). 2. Squeeze the heck out of your quad, keeping your leg super straight. 3. Lift your whole leg into the air, trying to make it so that the back of your knee and heel leave the table at the same time. 4. Raise your leg up as high as parallel to the other side, and then slowly lower it back down. Again, try to make it so that the back of your knee and heel touch down at the table at the same time. 5. From there, relax, and then resqueeze the quad to start again. Note: If you can't do this without having your leg be super straight (with the back of your knee and heel lifting off/touching down at the same time), you will need to use a belt and your arms to assist you to unweight the leg a bit until thiscan be achieved.",
    information:
      "This exercise helps you strengthen your quads and improve knee extension, which is important for things like walking and getting up from a chair. It's a simple way to rebuild strength in your leg without putting extra stress on your knee.",
    exerciseType: 'weight',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 20,
    modification: 'Try using a belt or your arms to assist you to lift the leg a bit.'
  },
  {
    exerciseId: 'single-leg-squat',
    exerciseName: 'Single Leg Squat',
    instructions:
      "1. Start sitting in a chair. 2. Keep your affected leg close, and stick your other foot out in front of you, heel only on the ground. 3. From here, use mainly your close leg to stand up, using your other leg for balance as needed. Try to keep your hips level, and don't let your knee cave in.",
    information:
      'This exercise helps you focus on strengthening your leg and knee individually, which is important for regaining full knee function. This exercise mimics the movements you use every day, like getting up from a chair or balancing on one leg. It also teaches you to maintain proper knee alignment, preventing excess stress on the joint.',
    exerciseType: 'weight',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 20,
    equipment: 'Dumbbell',
    modification:
      'For additional balance or support, hold onto a wall or balance pole. If you are using a weight, try decreasing it or removing it altogether.'
  },

  // Time-based exercises
  {
    exerciseId: 'bridge',
    exerciseName: 'Bridge',
    instructions:
      "1. Lay on your back, both knees bent. Knees and ankles should be about hip-width apart. 2. Engage your core like someone is going to sucker punch you in the gut, and then use your glutes to raise your hips up into the air. 3. Slowly lower yourself back down to the starting position. Note: You shouldn't feel this in your low back and only minimally in your hamstrings.",
    information:
      'This exercise helps strengthen your glutes and core, which support your knee as you move. By building strength in these areas, your knee will feel more stable and protected, making everyday activities like standing up or walking easier.',
    exerciseType: 'time',
    defaultSets: 1,
    defaultReps: 10,
    defaultSeconds: 10,
    modification:
      'Place a folded towel or a small pillow under your lower back or hips to provide extra support and reduce strain.'
  },
  {
    exerciseId: 'clamshell',
    exerciseName: 'Clamshell',
    instructions:
      '1. Lay on your side with your hips, knees, and ankles stacked right on top of each other. Your hips should be facing straight forward (might need to roll your hips forward farther than you think necessary). 2. Engage your core like someone is going to sucker punch you in the gut. Keeping your heels together, rotate your top knee towards the ceiling, using your "outside buttcheek" to do so. Note: You should not feel this in your hip flexors or groin muscle groups, only that "back pocket" or "side glute" muscle group.',
    information:
      'This exercise strengthens your hip muscles and helps keep your knee aligned as you move, which can prevent extra stress on your joint. This exercise is perfect for improving balance and making sure your knee tracks properly when you walk or exercise, reducing the chance of further injury.',
    exerciseType: 'time',
    defaultSets: 1,
    defaultReps: 10,
    defaultSeconds: 10,
    equipment: 'Resistance band',
    modification: 'Try using a lighter band or removing it altogether.'
  },
  {
    exerciseId: 'quad-set',
    exerciseName: 'Quad Set',
    instructions:
      '1. While laying or sitting, flex your quads by pressing your knee down towards the mat.\n2. Think about straightening your knee,"squeezing" your knee cap, trying to smash a hand/towel behind your knee into the table, or off-weighting your heel (see which cue works best for you!).\n\nNote: Do this multiple times throughout the day - you literally cannot do this too much.',
    information:
      "Your quadriceps are the muscles on the front of your thigh that help stabilize your knee. This exercise makes them stronger, so your knee doesn't have to do all the work. It's key for improving your ability to stand, walk, and climb stairs without discomfort.",
    exerciseType: 'time',
    defaultSets: 1,
    defaultReps: 10,
    defaultSeconds: 10,
    modification:
      'Place a small rolled-up towel under your knee and focus on gently squeezing your quad without fully straightening your leg.'
  },
  {
    exerciseId: 'standing-tke',
    exerciseName: 'Standing TKE',
    instructions:
      '1. Start in a standing position with an elastic band above your knee and the other end tied with a knot and fixated behind a closed door or other anchor. The target knee should be partially bent with your toes touching the ground. 2. From here, squeze your quad to straighten that knee using your quad and not your hips, having your heel now touch the floor. Think about straightening your knee, squeezing your quad, "squeezing" or tightneing your knee cap, or even just pulling against the resistance of the band. Note: Do this multiple times throughout the day.',
    information:
      "This exercise focuses on strengthening your quadriceps, which help stabilize your knee. By straightening your knee with control, you're training your muscles to support your knee better during everyday movements like walking or standing. It's a great way to improve knee function without putting strain on your joint.",
    exerciseType: 'time',
    defaultSets: 1,
    defaultReps: 10,
    defaultSeconds: 5,
    equipment: 'Resistance band',
    modification: 'Switch to a lighter band or move closer to the anchor to reduce tension.'
  },
  {
    exerciseId: 'heel-slide',
    exerciseName: 'Heel Slide',
    instructions:
      '1. Sit with your back up against a wall with your legs in front of you. 2. Place a non-stretchy strap, belt, or towel around your foot. Try to bring your heel towards your butt as best you can on your own, but then use your hands to help pull your foot even closer until you feel a stretch at your knee. Note: Keep this pain free! Just a stretch! Do this multiple times a day.',
    information:
      'This exercise helps improve knee flexibility and range of motion. Stretching your knee joint gently is key for regaining full movement, especially after an injury. This exercise is great for getting your knee to bend properly, which will make activities like walking and bending down much easier and more comfortable.',
    exerciseType: 'time',
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 10,
    equipment: 'Towel',
    modification: 'Move your heel only a few inches—just enough to stay within a pain-free range.'
  }
];

export async function seedExercises() {
  const exercisesRef = collection(db, 'exercises');
  const existingExercisesSnapshot = await getDocs(exercisesRef);
  const existingExerciseIds = new Set(existingExercisesSnapshot.docs.map((doc) => doc.id));

  for (const exercise of exercises) {
    const exerciseRef = doc(db, 'exercises', exercise.exerciseId);

    if (!existingExerciseIds.has(exercise.exerciseId)) {
      await setDoc(exerciseRef, exercise);
      console.log(`Exercise ${exercise.exerciseId} added to Firestore`);
    } else {
      await setDoc(exerciseRef, exercise, { merge: true });
      console.log(`Exercise ${exercise.exerciseId} updated in Firestore`);
    }
  }
}
