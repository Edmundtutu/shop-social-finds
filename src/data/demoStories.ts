export interface Story {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  created_at: string;
}

export interface VendorStories {
  id: string;
  name: string;
  avatar: string;
  stories: Story[];
}

export const demoStories: VendorStories[] = [
  {
    id: "vendor1",
    name: "Fresh Market Co.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    stories: [
      {
        id: "story1",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=600&fit=crop",
        created_at: "2025-09-21T10:00:00Z"
      },
      {
        id: "story2", 
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=600&fit=crop",
        created_at: "2025-09-21T11:00:00Z"
      }
    ]
  },
  {
    id: "vendor2",
    name: "Urban Cafe",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    stories: [
      {
        id: "story3",
        media_type: "image", 
        media_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=600&fit=crop",
        created_at: "2025-09-21T09:30:00Z"
      }
    ]
  },
  {
    id: "vendor3",
    name: "Tech Store Plus",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    stories: [
      {
        id: "story4",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=600&fit=crop",
        created_at: "2025-09-21T08:45:00Z"
      },
      {
        id: "story5",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop",
        created_at: "2025-09-21T12:15:00Z"
      }
    ]
  }
];