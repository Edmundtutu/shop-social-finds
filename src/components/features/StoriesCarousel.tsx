import React, { useEffect, useRef, useState } from "react";
import Zuck from "zuck.js";
import "../../../node_modules/zuck.js/dist/zuck.min.css";
import "../../../node_modules/zuck.js/dist/skins/snapgram.css";
import { type VendorStories } from '@/data/demoStories';
import { storyService } from '@/services/storyService';
import { toast } from 'sonner';
import '@/styles/components/stories-carousel.css';

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
      const zuckInstance = new Zuck(storiesRef.current, {
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
            type: story.media_type === 'image' ? 'photo' : 'video' as 'photo' | 'video',
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
          onEnd: (storyId: string, callback?: () => void) => {
            console.log('Story ended:', storyId);
            if (typeof callback === "function") {
              callback();
            }
          },
          onClose: (storyId: string, callback?: () => void) => {
            console.log('Story closed:', storyId);
            if (typeof callback === "function") {
              callback();
            }
          },
          onOpen: (storyId: string, callback?: () => void) => {
            console.log('Story opened:', storyId);
            setTimeout(() => {
              addReactionButtons(storyId);
            }, 100);
            if (typeof callback === "function") {
              callback();
            }
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

    const existingReactions = modal.querySelector('.story-reactions');
    if (existingReactions) {
      existingReactions.remove();
    }

    const reactionsContainer = document.createElement('div');
    reactionsContainer.className = 'story-reactions';
    reactionsContainer.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 25px;
      padding: 10px 18px;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    const emojis = ["❤️", "👍", "👎", "😮"];
    
    emojis.forEach((emoji) => {
      const button = document.createElement('button');
      button.textContent = emoji;
      button.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid transparent;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 8px;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.2)';
        button.style.background = 'rgba(255, 255, 255, 0.2)';
        button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.background = 'rgba(255, 255, 255, 0.1)';
        button.style.borderColor = 'transparent';
      });

      button.addEventListener('click', () => {
        handleReaction(currentStoryId, emoji);
        button.style.transform = 'scale(1.4)';
        button.style.background = 'rgba(255, 255, 255, 0.3)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
          button.style.background = 'rgba(255, 255, 255, 0.1)';
        }, 300);
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
    return (
      <div className="w-full mb-6 p-4 text-center text-muted-foreground">
        <p>No stories available</p>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <div ref={storiesRef} className="stories-container" />
    </div>
  );
}