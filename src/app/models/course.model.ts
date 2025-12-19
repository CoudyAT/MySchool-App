// interfaces/course.interface.ts
export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
  duration?: string;
  exercisesIds?: string[];
  exercises?: Exercise[];
  lessons?: Lesson[];
  lessonsIds?: string[];
}

export interface Exercise {
  id: string;
  chapterId: string;
  courseId: string;
  title: string;
  type: 'qcm' | 'code' | 'text';
  difficulty: 'facile' | 'moyen' | 'difficile' | 'avancé';
  duration: string;
  questions?: any[];
  instructions?: string;
  templateCode?: string;
  testCases?: any[];
  score?: number;
  totalQuestions?: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'exercise' | 'quiz';
  duration: string;
  isCompleted: boolean;
  order: number;
  passed?: boolean;
  score?: string;
  instructions?: string;
  templateCode?: string;
  testCases?: any[];
  questions?: any[];
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
  chapters: Chapter[];
  chaptersIds?: string[]; // Relation avec les chapitres
  createdAt: Date;
  updatedAt: Date;
  levels?: Array<{
    icon: string;
    completed: boolean;
  }>;
  maxRating?: number;
  enrolled?: boolean;
  data?: any;
  isOnline?: boolean;
  onlineExtras?: OnlineCourseExtras;
}

export interface OnlineCourseExtras {
  livePlatform?: 'Zoom' | 'Meet' | 'Teams';
  startDate?: Date;
  endDate?: Date;
  schedule?: string; // ex: "Lundi & Mercredi 18h-20h"
  instructor?: string;
  meetingLink?: string;
}


export type CourseKind = 'CLASSIC' | 'ONLINE';

