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
  data?: any;
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

export interface Matiere {
  id: string;
  nom: string;
  classe: string;
  niveauScolaire: 'PRIMAIRE' | 'MOYEN' | 'SECONDAIRE' | 'SUPERIEUR';
  icon: string;
  color: string;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;

}

export interface Course {
  documents: CourseDocument[];
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  type: string;
  duration: number;
  sessions: string;
  exercises: number;
  image: string;
  matiereId: string;
  isPublished: boolean;
  certificateAvailable?: boolean;
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
  instructorId?: string;
  instructorName?: string;
  support?: string;
  isOnline?: boolean;
  onlineExtras?: OnlineCourseExtras;
  niveauScolaire?: string;
  classe?: string;
  videoUrl?: string;
  videoPath?: string;
  videoDuration?: number;
  videoName?: string;
}

export interface CourseDocument {
  name: string;
  url: string;
  size: number;
  mimeType?: string;
  uploadedAt: string | Date;
  uploadedBy?: string;
  storagePath?: string;
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

