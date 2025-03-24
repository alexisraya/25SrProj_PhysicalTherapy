/**
 * Content dictionary for the tough/kind tone system
 */

export type ContentKey = 
  // Home page
  | 'home_program_cta_1'
  
  // Program CTAs
  | 'program_cta_2'
  | 'program_cta_3'
  
  // Complete messages
  | 'complete_1'
  | 'complete_2'
  | 'complete_3'
  
  // Check-in feelings
  | 'checkin_motivated'
  | 'hopeful'
  | 'indifferent'
  | 'uncertain'
  | 'discouraged'
  
  // Streaks
  | 'streak_complete_na'
  
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
export type ToneContentDictionary = Record<ContentKey, {
  tough: string;
  kind: string;
}>;

/**
 * Content dictionary with both tough and kind tones for each key
 */
export const toneContent: ToneContentDictionary = {
  // Home page
  "home_program_cta_1": {
    "tough": "No excuses—start your program.",
    "kind": "Start your program for today."
  },
  
  // Program CTAs
  "program_cta_2": {
    "tough": "Get to it— your program won't do itself.",
    "kind": "You've got this—let's start your program!"
  },
  "program_cta_3": {
    "tough": "Want results? Start your program.",
    "kind": "Time to start your program!"
  },
  
  // Complete messages
  "complete_1": {
    "tough": "You showed up and completed your program.",
    "kind": "You've completed your program for today!"
  },
  "complete_2": {
    "tough": "You put in the work—today's program is done.",
    "kind": "You did it—today's program is complete!"
  },
  "complete_3": {
    "tough": "You finished what you started. Next.",
    "kind": "Great job completing your program today!"
  },
  
  // Check-in feelings
  "checkin_motivated": {
    "tough": "Channel that motivation into your recovery.",
    "kind": "That's wonderful to hear! Use that motivation to keep going."
  },
  "hopeful": {
    "tough": "Hope isn't enough. Action is what gets results.",
    "kind": "That's a positive mindset to have. Let's build on that hope!"
  },
  "indifferent": {
    "tough": "Indifference leads to mediocre results. Choose better.",
    "kind": "That's okay. Some days are just like that. Let's work through it together."
  },
  "uncertain": {
    "tough": "Uncertainty is just an excuse. Commit and move forward.",
    "kind": "It's normal to have uncertain days. Let's take it one step at a time."
  },
  "discouraged": {
    "tough": "Everyone faces setbacks. The strong push through anyway.",
    "kind": "I'm sorry you're feeling discouraged. Remember each day is a new opportunity."
  },
  
  // Streak related
  "streak_complete_na": {
    "tough": "One day down. Keep the momentum going.",
    "kind": "You've started a streak! Keep up the great work!"
  },
  
  // Goal complete variants
  "goal_complete_1": {
    "tough": "Goal achieved. Set a bigger one.",
    "kind": "Congratulations on achieving your goal!"
  },
  "goal_complete_2": {
    "tough": "You hit your target. Now raise the bar.",
    "kind": "You've reached your goal! That's something to celebrate!"
  },
  "goal_complete_3": {
    "tough": "Goal complete. What's next?",
    "kind": "Goal accomplished! You should be proud of yourself!"
  },
  
  // Recap measurements
  "recap_rom_decrease": {
    "tough": "Your range decreased. Work harder next time.",
    "kind": "Your range of motion has decreased slightly. Let's focus on gentle stretching."
  },
  "rom_steady": {
    "tough": "Your range stayed the same. Push for improvement.",
    "kind": "Your range of motion is holding steady. That's still progress!"
  },
  "rom_increase": {
    "tough": "Range improved. Keep pushing those limits.",
    "kind": "Your range of motion has improved! That's wonderful progress!"
  },
  "strength_decrease": {
    "tough": "Your strength decreased. Time to step it up.",
    "kind": "Your strength has decreased a bit. Let's adjust and build back up."
  },
  "strength_steady": {
    "tough": "Strength maintained. Now aim for gains.",
    "kind": "Your strength is holding steady. That's consistency at work!"
  },
  "strength_increase": {
    "tough": "Strength up. That's what happens when you put in the work.",
    "kind": "Your strength has increased! Your hard work is paying off!"
  },
  "goals": {
    "tough": "Goals: complete.",
    "kind": "You've achieved your goals!"
  },
  
  // Program interstitial
  "you_did_it_bubble": {
    "tough": "Did it. Next.",
    "kind": "You did it!"
  },
  "nice_work_star": {
    "tough": "Work done.",
    "kind": "Nice work!"
  },
  "way_to_go_stairs": {
    "tough": "Progress made.",
    "kind": "Way to go!"
  }
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