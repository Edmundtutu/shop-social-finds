import { demoStories, type VendorStories, type Story } from '@/data/demoStories';

interface StoryReactions {
  [storyId: string]: {
    "❤️": number;
    "👍": number; 
    "👎": number;
    "😮": number;
  };
}

let stories: VendorStories[] = [...demoStories];
let reactions: StoryReactions = {};

// Initialize some demo reactions
reactions["story1"] = { "❤️": 12, "👍": 8, "👎": 1, "😮": 3 };
reactions["story2"] = { "❤️": 6, "👍": 4, "👎": 0, "😮": 2 };
reactions["story3"] = { "❤️": 15, "👍": 12, "👎": 2, "😮": 5 };

export const storyService = {
  getActiveStories: async (): Promise<VendorStories[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter stories to show only those from last 24 hours
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const activeStories = stories.map(vendor => ({
      ...vendor,
      stories: vendor.stories.filter(story => 
        new Date(story.created_at) > oneDayAgo
      )
    })).filter(vendor => vendor.stories.length > 0);
    
    return Promise.resolve(activeStories);
  },

  reactToStory: async (storyId: string, reactionType: "❤️" | "👍" | "👎" | "😮"): Promise<{ storyId: string; reactions: StoryReactions[string] }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (!reactions[storyId]) {
      reactions[storyId] = { "❤️": 0, "👍": 0, "👎": 0, "😮": 0 };
    }
    
    reactions[storyId][reactionType]++;
    
    return Promise.resolve({ 
      storyId, 
      reactions: reactions[storyId] 
    });
  },

  getStoryReactions: async (storyId: string): Promise<StoryReactions[string]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return Promise.resolve(reactions[storyId] || { "❤️": 0, "👍": 0, "👎": 0, "😮": 0 });
  },

  addStory: async (vendorId: string, story: Omit<Story, 'id'>): Promise<Story> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newStory: Story = {
      ...story,
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const vendorIndex = stories.findIndex(v => v.id === vendorId);
    if (vendorIndex !== -1) {
      stories[vendorIndex].stories.push(newStory);
    }
    
    return Promise.resolve(newStory);
  }
};