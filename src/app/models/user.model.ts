export type NiveauScolaire = 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';

export type ClasseElementaire = 'CI' | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
export type ClasseMoyen = '6ème' | '5ème' | '4ème' | '3ème';
export type ClasseSecondaire = 'Seconde' | 'Première' | 'Terminale';
export type ClasseUniversitaire = 'Licence1' | 'Licence2' | 'Licence3' | 'Master1' | 'Master2';

export type Classe = ClasseElementaire | ClasseMoyen | ClasseSecondaire | ClasseUniversitaire;

export interface User {
  id?: string;
  uid?: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoURL?: string;
  role?: {
    libelle: 'student' | 'instructor' | 'admin';
  };
  level?: string;
  niveauScolaire?: 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE' | 'SUPERIEUR';
  classe?: string; // Ex: CM2, 3ème, 6ème, etc.
  login?: string;
  password?: string;
  birthDate?: string;
  country?: string;
  address?: string;
  profession?: string;
  school?: string;
  objectives?: string[];

  // Nouveaux champs pour le système d'abonnement


  isPremium?: boolean;
  premiumSince?: Date;
  premiumExpiresAt?: Date;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: any;
  updatedAt?: any;
  specializationId: string;
  hasActiveSubscription: boolean;
}

