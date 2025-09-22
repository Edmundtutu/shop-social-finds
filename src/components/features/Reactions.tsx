import React, { useState, useEffect } from 'react';
import { storyService } from '@/services/storyService';

interface ReactionsProps {
  storyId: string;
  onReact: (storyId: string, emoji: string) => void;
  className?: string;
}

const emojis = ["❤️", "👍", "👎", "😮"] as const;

export default function Reactions({ storyId, onReact, className = "" }: ReactionsProps) {
  const [reactionCounts, setReactionCounts] = useState<{[key: string]: number}>({
    "❤️": 0, "👍": 0, "👎": 0, "😮": 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReactions();
  }, [storyId]);

  const loadReactions = async () => {
    try {
      const reactions = await storyService.getStoryReactions(storyId);
      setReactionCounts(reactions);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleReact = async (emoji: string) => {
    if (loading) return;
    
    setLoading(true);
    
    // Optimistic update
    setReactionCounts(prev => ({
      ...prev,
      [emoji]: prev[emoji] + 1
    }));

    try {
      await storyService.reactToStory(storyId, emoji as any);
      onReact(storyId, emoji);
    } catch (error) {
      console.error('Error reacting:', error);
      // Revert optimistic update
      setReactionCounts(prev => ({
        ...prev,
        [emoji]: Math.max(0, prev[emoji] - 1)
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          disabled={loading}
          className="group flex items-center gap-1 px-3 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-background/90 transition-all duration-200 disabled:opacity-50"
        >
          <span className="text-lg group-hover:scale-110 transition-transform duration-200">
            {emoji}
          </span>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {reactionCounts[emoji] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}