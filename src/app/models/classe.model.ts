export interface ClasseInfo {
  classe: string;
  niveauScolaire: string;
  matieres: MatiereInfo[];
  totalCourses: number;
}

export interface MatiereInfo {
  matiereId: string;
  matiereName: string;
  courses: any[];
  totalDuration: number;
}

export interface ClasseSubscription {
  userId: string;
  classe: string;
  niveauScolaire: string;
  matieres: string[];
  startDate: Date;
  endDate: Date;
  plan: string;
  amount: number;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
}
