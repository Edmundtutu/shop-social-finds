declare module 'zuck.js' {
    interface ZuckStoryItem {
        id: string;
        type: 'photo' | 'video';
        length?: number;
        src: string;
        preview?: string;
        time?: number;
        link?: string;
        linkText?: string;
    }

    interface ZuckStory {
        id: string;
        photo: string;
        name: string;
        items: ZuckStoryItem[];
    }

    interface ZuckCallbacks {
        onView?: (storyId: string) => void;
        onEnd?: (storyId: string, callback: () => void) => void;
        onClose?: (storyId: string, callback: () => void) => void;
        onOpen?: (storyId: string, callback: () => void) => void;
    }

    interface ZuckOptions {
        skin?: string;
        avatars?: boolean;
        list?: boolean;
        openEffect?: boolean;
        autoFullScreen?: boolean;
        backButton?: boolean;
        paginationArrows?: boolean;
        cubeEffect?: boolean;
        localStorage?: boolean;
        stories?: ZuckStory[];
        callbacks?: ZuckCallbacks;
    }

    export default class Zuck {
        constructor(element: HTMLElement, options?: ZuckOptions);
        destroy?: () => void;
    }
}

