/**
 * Content dictionary for the tough/kind tone system
 */

export type ContentKey =
  // Home page
  | 'home_program_cta_1'
  | 'home_program_cta_2'
  | 'home_program_cta_3'

  // Complete messages
  | 'complete_1'
  | 'complete_2'
  | 'complete_3'

  // Check-in feelings
  | 'motivated_title'
  | 'motivated_subtitle'
  | 'hopeful_title'
  | 'hopeful_subtitle'
  | 'indifferent_title'
  | 'indifferent_subtitle'
  | 'uncertain_title'
  | 'uncertain_subtitle'
  | 'discouraged_title'
  | 'discouraged_subtitle'

  // Streaks
  | 'streak_complete'

  // Goal complete variants
  | 'goal_complete_1'
  | 'goal_complete_2'
  | 'goal_complete_3'

  // Recap measurements
  | 'recap_rom_decrease'
  | 'rom_steady'
  | 'rom_increase'
  | 'strength_decrease'
  | 'strength_steady'
  | 'strength_increase'
  | 'goals'

  // Program interstitial
  | 'you_did_it_bubble'
  | 'nice_work_star'
  | 'way_to_go_stairs';

// content dictionary type
export type ToneContentDictionary = Record<
  ContentKey,
  {
    tough: string;
    kind: string;
  }
>;

/**
 * Content dictionary with both tough and kind tones for each key
 */
export const toneContent: ToneContentDictionary = {
  // Home page
  home_program_cta_1: {
    tough: 'No excuses—start your program.',
    kind: 'Start your program for today.',
  },
  home_program_cta_2: {
    tough: "Get to it— your program won't do itself.",
    kind: "You’ve got this—let's start your program!",
  },
  home_program_cta_3: {
    tough: 'Want results? Start your program.',
    kind: 'Time to start your program!',
  },

  // Complete messages
  complete_1: {
    tough: 'You showed up and completed your program.',
    kind: "You've completed your program for today!",
  },
  complete_2: {
    tough: "You put in the work—today's program is done.",
    kind: "You did it—today's program is complete!",
  },
  complete_3: {
    tough: "Program's done for today—don’t let up.",
    kind: "Great work! You finished today's program!",
  },

  // Check-in feelings
  motivated_title: {
    tough: 'You’re motivated? Prove it.',
    kind: 'Keep channeling that motivation',
  },
  motivated_subtitle: {
    tough: '90% of people improved their quality of life with PT. Join them.',
    kind: '90% of people improved their quality of life with PT—you’re on your way!',
  },
  hopeful_title: {
    tough: 'Intention is nice. Execution is better.',
    kind: 'Belief opens the door to possibility.',
  },
  hopeful_subtitle: {
    tough: "79% saw pain relief by doing the work. Pain won't fix itself.",
    kind: '79% saw pain relief with PT—stick with it!',
  },
  indifferent_title: {
    tough: 'Comfort is the enemy of growth.',
    kind: 'Small steps today, big leaps tomorrow.',
  },
  indifferent_subtitle: {
    tough: '25% of adults experience knee pain—now is the time to do something about it.',
    kind: "25% of adults experience knee pain—you're not alone.",
  },
  uncertain_title: {
    tough: 'Stop overthinking, and start moving.',
    kind: 'It will be okay—just trust the process',
  },
  uncertain_subtitle: {
    tough: '70% show improvement with PT—why not you?',
    kind: '70% people show improvement with PT—recovery is possible',
  },
  discouraged_title: {
    tough: "Recovery isn't supposed to be easy, so keep pushing.",
    kind: 'Recovery is tough, but it does get better.',
  },
  discouraged_subtitle: {
    tough:
      "3 out of 4 adults improve or fully recover from a knee injury after a year—don't be the one who doesn't.",
    kind: '75% of adults with knee injuries improve or fully recover after one year—you can too',
  },

  // Streak related
  streak_complete: {
    tough: 'Nice work—now prove you can keep it going next week',
    kind: 'Nice work on your program this week. Keep it up!',
  },

  // Goal complete variants
  goal_complete_1: {
    tough: 'You met that goal—time to aim higher.',
    kind: 'Great job working towards this goal!',
  },
  goal_complete_2: {
    tough: "Now it's time to crush the next one.",
    kind: 'Nice job hitting this goal—keep it up!',
  },
  goal_complete_3: {
    tough: "Don't stop now, look towards the next one.",
    kind: 'Celebrate this win—you deserve it!',
  },

  // Recap measurements
  recap_rom_decrease: {
    tough: 'This happens—but what you do next matters. Stick with your program.',
    kind: "Don't worry, this can happen. Your program will help get these numbers up!",
  },
  rom_steady: {
    tough: 'Stick with it, and you’ll see improvement.',
    kind: 'This is still progress—gains are coming!',
  },
  rom_increase: {
    tough: 'There’s more work to do—don’t stop now.',
    kind: 'Keep it up—the numbers will keep rising!',
  },
  strength_decrease: {
    tough: "This is normal. Put in the work, and you'll get back on track.",
    kind: "This is normal. Keep up with your program and you'll get back on track!",
  },
  strength_steady: {
    tough: 'Keep at it—every rep counts.',
    kind: 'Stay mentally strong—results will follow!',
  },
  strength_increase: {
    tough: 'Nice progress—now keep raising the bar.',
    kind: 'This is the result of your hard work!',
  },
  goals: {
    tough: 'Impressive—now let’s tackle the next one.',
    kind: 'This is a big step in your recovery!',
  },

  // Program interstitial
  you_did_it_bubble: {
    tough: "That wasn't so bad, was it?",
    kind: 'Your hard work is paying off',
  },
  nice_work_star: {
    tough: 'Put in the same effort next time',
    kind: "You're making real progress",
  },
  way_to_go_stairs: {
    tough: 'Now stay the course',
    kind: "You're one step closer to recovery",
  },
};

/**
 * Helper function to get content by page and descriptor
 */
export function getContentKey(page: string, descriptor: string): ContentKey | undefined {
  // Normalize the inputs
  const normalizedPage = page.trim();
  const normalizedDescriptor = descriptor.trim().replace(/\s+/g, '_').toLowerCase();

  // Create the potential key formats
  const pageDescriptorKey = `${normalizedPage.toLowerCase()}_${normalizedDescriptor}` as ContentKey;
  const descriptorOnlyKey = normalizedDescriptor as ContentKey;

  // Check if either key exists in the content dictionary
  if (pageDescriptorKey in toneContent) {
    return pageDescriptorKey;
  } else if (descriptorOnlyKey in toneContent) {
    return descriptorOnlyKey;
  }

  // If no matching key is found
  return undefined;
}
