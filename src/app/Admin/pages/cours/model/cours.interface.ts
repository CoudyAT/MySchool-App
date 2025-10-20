export interface Course {
  id: number;
  title: string;
  category: string;
  sessions: number;
  exercises: number;
  language: string;
  instructor: string;
  rating: number;
  maxRating: number;
  image: string;
  certificateAvailable: boolean;
  description: string;
  levels: Array<{ icon: string; completed: boolean }>;
}

//export type StatutDemande = 'En attente' | 'Approuvée' | 'Rejetée';
