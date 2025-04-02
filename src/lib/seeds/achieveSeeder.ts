import { db } from '$lib/helpers/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const achievements = [
  // Distance-based achievements
  {
    achieveId: 'distance-1',
    achieveName: 'Height of the Statue of Liberty',
    achieveType: 'distance',
    targetValue: 62.4,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-2',
    achieveName: 'Length of an American football field',
    achieveType: 'distance',
    targetValue: 149,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-3',
    achieveName: 'Length of the Sydney Opera House',
    achieveType: 'distance',
    targetValue: 248,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-4',
    achieveName: 'Length of the Titanic',
    achieveType: 'distance',
    targetValue: 364,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-5',
    achieveName: 'Length of a Cruise Ship',
    achieveType: 'distance',
    targetValue: 413,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-6',
    achieveName: 'Length of Niagara Falls',
    achieveType: 'distance',
    targetValue: 1074,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-7',
    achieveName: 'Length of the Brooklyn Bridge',
    achieveType: 'distance',
    targetValue: 2485,
    targetUnits: 'steps'
  },
  {
    achieveId: 'distance-8',
    achieveName: 'Length of the Golden Gate Bridge',
    achieveType: 'distance',
    targetValue: 3709,
    targetUnits: 'steps'
  },

  // Weight-based achievements
  {
    achieveId: 'weight-1',
    achieveName: '42" + TV',
    achieveType: 'weight',
    targetValue: 125,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-2',
    achieveName: 'Refrigerator',
    achieveType: 'weight',
    targetValue: 250,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-3',
    achieveName: 'Grand piano',
    achieveType: 'weight',
    targetValue: 700,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-4',
    achieveName: 'Polar bear',
    achieveType: 'weight',
    targetValue: 990,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-5',
    achieveName: 'Female hippo',
    achieveType: 'weight',
    targetValue: 3000,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-6',
    achieveName: 'Forklift',
    achieveType: 'weight',
    targetValue: 9000,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-7',
    achieveName: 'Afraican elephant',
    achieveType: 'weight',
    targetValue: 12000,
    targetUnits: 'lbs'
  },
  {
    achieveId: 'weight-8',
    achieveName: 'Loaded school bus',
    achieveType: 'weight',
    targetValue: 34000,
    targetUnits: 'lbs'
  },

  // Time-based achievements
  {
    achieveId: 'time-1',
    achieveName: 'A bee to fly from its hive to a flower',
    achieveType: 'time',
    targetValue: 120,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-2',
    achieveName: 'Sea turtle to complete a typical dive',
    achieveType: 'time',
    targetValue: 270,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-3',
    achieveName: 'Sunlight to reach the Earth',
    achieveType: 'time',
    targetValue: 480,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-4',
    achieveName: 'Cook a hardboiled egg',
    achieveType: 'time',
    targetValue: 720,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-5',
    achieveName: 'Cook white rice on the storve',
    achieveType: 'time',
    targetValue: 1080,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-6',
    achieveName: 'Watch a TV sitcom',
    achieveType: 'time',
    targetValue: 1320,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-7',
    achieveName: 'Length of an average thunderstorm',
    achieveType: 'time',
    targetValue: 1800,
    targetUnits: 'seconds'
  },
  {
    achieveId: 'time-8',
    achieveName: 'Length of a basketball game',
    achieveType: 'time',
    targetValue: 2880,
    targetUnits: 'seconds'
  }
];

export async function seedAchievements() {
  const achievementsRef = collection(db, 'achievements');
  const existingAchievementsSnapshot = await getDocs(achievementsRef);
  const existingAchievementIds = new Set(existingAchievementsSnapshot.docs.map((doc) => doc.id));

  for (const achievement of achievements) {
    const achievementRef = doc(db, 'achievements', achievement.achieveId);

    if (!existingAchievementIds.has(achievement.achieveId)) {
      const achievementRef = doc(db, 'achievements', achievement.achieveId);
      await setDoc(achievementRef, achievement);
      console.log(`Achievement ${achievement.achieveId} added to Firestore`);
    } else {
      await setDoc(achievementRef, achievement, { merge: true });
      console.log(`Achievement ${achievement.achieveId} updated in Firestore`);
    }
  }
}
