import React, { useEffect, useRef, useState } from "react";
import Zuck from "zuck.js";
import { type VendorStories } from '@/data/demoStories';
import { storyService } from '@/services/storyService';
import { toast } from 'sonner';

interface StoriesCarouselProps {
  stories: VendorStories[];
  onReaction?: (storyId: string, reaction: string) => void;
}

export default function StoriesCarousel({ stories, onReaction }: StoriesCarouselProps) {
  const storiesRef = useRef<HTMLDivElement>(null);
  const zuckRef = useRef<any>(null);
  const [reactions, setReactions] = useState<{[storyId: string]: any}>({});

  useEffect(() => {
    if (storiesRef.current && stories.length > 0) {
      // Clean up previous instance
      if (zuckRef.current) {
        try {
          zuckRef.current.destroy?.();
        } catch (e) {
          console.warn('Error destroying zuck instance:', e);
        }
      }

      // Create new zuck instance
      const zuckInstance = new (Zuck as any)(storiesRef.current, {
        skin: "snapgram",
        avatars: true,
        list: false,
        openEffect: true,
        autoFullScreen: false,
        backButton: true,
        paginationArrows: true,
        cubeEffect: true,
        localStorage: false,
        stories: stories.map((vendor) => ({
          id: vendor.id,
          photo: vendor.avatar,
          name: vendor.name,
          items: vendor.stories.map((story) => ({
            id: story.id,
            type: story.media_type,
            length: 5,
            src: story.media_url,
            preview: story.media_url,
            time: new Date(story.created_at).getTime() / 1000,
            link: "",
            linkText: ""
          })),
        })),
        callbacks: {
          onView: (storyId: string) => {
            console.log('Viewing story:', storyId);
          },
          onEnd: (storyId: string, callback: () => void) => {
            console.log('Story ended:', storyId);
            callback();
          },
          onClose: (storyId: string, callback: () => void) => {
            console.log('Story closed:', storyId);
            callback();
          },
          onOpen: (storyId: string, callback: () => void) => {
            console.log('Story opened:', storyId);
            // Add reaction buttons when story opens
            setTimeout(() => {
              addReactionButtons(storyId);
            }, 100);
            callback();
          }
        }
      });

      zuckRef.current = zuckInstance;
    }

    return () => {
      if (zuckRef.current) {
        try {
          zuckRef.current.destroy?.();
        } catch (e) {
          console.warn('Error destroying zuck instance:', e);
        }
      }
    };
  }, [stories]);

  const addReactionButtons = (currentStoryId: string) => {
    const modal = document.querySelector('.zuck-modal');
    if (!modal) return;

    // Remove existing reaction buttons
    const existingReactions = modal.querySelector('.story-reactions');
    if (existingReactions) {
      existingReactions.remove();
    }

    // Create reaction buttons
    const reactionsContainer = document.createElement('div');
    reactionsContainer.className = 'story-reactions';
    reactionsContainer.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      border-radius: 25px;
      padding: 8px 16px;
      z-index: 1000;
    `;

    const emojis = ["❤️", "👍", "👎", "😮"];
    
    emojis.forEach((emoji) => {
      const button = document.createElement('button');
      button.textContent = emoji;
      button.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        transition: transform 0.2s ease;
        padding: 4px;
        border-radius: 50%;
      `;
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.2)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
      });

      button.addEventListener('click', () => {
        handleReaction(currentStoryId, emoji);
        // Add visual feedback
        button.style.transform = 'scale(1.5)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 200);
      });

      reactionsContainer.appendChild(button);
    });

    modal.appendChild(reactionsContainer);
  };

  const handleReaction = async (storyId: string, emoji: string) => {
    try {
      const result = await storyService.reactToStory(storyId, emoji as any);
      setReactions(prev => ({
        ...prev,
        [storyId]: result.reactions
      }));
      
      onReaction?.(storyId, emoji);
      toast.success(`Reacted with ${emoji}`);
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast.error('Failed to react to story');
    }
  };

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <div ref={storiesRef} className="w-full overflow-hidden rounded-lg" />
      <style>{`
        .zuck-modal {
          z-index: 9999 !important;
        }
        
        .zuck-modal .story {
          border-radius: 12px !important;
        }
        
        .zuck-modal .story-viewer {
          background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6)) !important;
        }
        
        .stories > .story .info .name {
          color: white !important;
          font-weight: 600 !important;
        }
        
        .stories > .story {
          border: 3px solid hsl(var(--primary)) !important;
          border-radius: 50% !important;
        }
        
        .stories > .story.seen {
          border-color: hsl(var(--muted)) !important;
        }
        
        .stories > .story:hover {
          transform: scale(1.05) !important;
          transition: transform 0.2s ease !important;
        }
      `}</style>
    </div>
  );
}