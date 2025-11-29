export interface Lesson {
  id?: string;
  chapterId?: string;
  title: string;
  type: 'video' | 'text' | 'exercise' | 'quiz';
  duration: string;
  order: number;
  isCompleted?: boolean;
  passed?: boolean;
  score?: string;
  instructions?: string;
  templateCode?: string;
  testCases?: any[];
  questions?: any[];
  videoUrl?: string;
  content?: string;
  createdAt?: any;
  updatedAt?: any;
}
