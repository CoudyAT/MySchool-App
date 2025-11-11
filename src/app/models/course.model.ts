// interfaces/course.interface.ts
export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  videos?: Video[];
  exercises?: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  order: number;
  isFree: boolean;
  createdAt: Date;
}

export interface Exercise {
  id: string;
  title: string;
  instructions: string;
  type: 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  points: number;
  order: number;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  type: 'En ligne' | 'VIDEO';
  duration: number;
  sessions: number;
  exercises: number;
  image: string;
  isPublished: boolean;
  certificateAvailable: boolean;
  price?: number;
  rating?: number;
  chapters: Chapter[]; // Relation avec les chapitres
  createdAt: Date;
  updatedAt: Date;
  levels?: Array<{
    icon: string;
    completed: boolean;
  }>;
  maxRating?: number;
}
