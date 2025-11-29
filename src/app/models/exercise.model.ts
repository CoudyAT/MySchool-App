export interface Exercise {
  id?: string;
  lessonId?: string;
  chapterId?: string;
  courseId?: string;
  title: string;
  type: 'qcm' | 'code' | 'text' | 'QUIZ' | 'ASSIGNMENT' | 'PROJECT';
  difficulty?: 'facile' | 'moyen' | 'difficile' | 'avancé';
  duration: string;
  instructions?: string;
  templateCode?: string;
  testCases?: any[];
  questions?: any[];
  points?: number;
  order?: number;
  score?: number;
  totalQuestions?: number;
  createdAt?: any;
  updatedAt?: any;
}
