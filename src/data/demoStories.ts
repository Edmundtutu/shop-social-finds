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
        created_at: "2025-09-24T10:00:00Z"
      },
      {
        id: "story2",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=600&fit=crop",
        created_at: "2025-09-24T11:00:00Z"
      },
      {
        id: "story6",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&h=600&fit=crop",
        created_at: "2025-09-24T14:30:00Z"
      },
      {
        id: "story7",
        media_type: "image",
        media_url: "https://picsum.photos/400/600",
        created_at: "2025-09-24T16:45:00Z"
      }
    ]
  },
  {
    id: "vendor2",
    name: "Urban Cafe",
    avatar: "https://thewaterfrontkaren.com/wp-content/uploads/2019/05/Cafe-Javas-1.jpg",
    stories: [
      {
        id: "story3",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=600&fit=crop",
        created_at: "2025-09-24T09:30:00Z"
      },
      {
        id: "story8",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=600&fit=crop",
        created_at: "2025-09-24T13:20:00Z"
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
        created_at: "2025-09-24T08:45:00Z"
      },
      {
        id: "story5",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop",
        created_at: "2025-09-24T12:15:00Z"
      },
      {
        id: "story9",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=600&fit=crop",
        created_at: "2025-09-24T15:10:00Z"
      }
    ]
  },
  {
    id: "vendor4",
    name: "Fashion Hub",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    stories: [
      {
        id: "story10",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=600&fit=crop",
        created_at: "2025-09-24T11:30:00Z"
      },
      {
        id: "story11",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop",
        created_at: "2025-09-24T17:00:00Z"
      }
    ]
  },
  {
    id: "vendor5",
    name: "Fitness Zone",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    stories: [
      {
        id: "story12",
        media_type: "image",
        media_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
        created_at: "2025-09-24T07:20:00Z"
      }
    ]
  }
]