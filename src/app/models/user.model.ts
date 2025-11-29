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
  login?: string;
  password?: string;
  birthDate?: string;
  country?: string;
  address?: string;
  profession?: string;
  school?: string;
  objectives?: string[];
  isPremium?: boolean;
  premiumSince?: Date;
  premiumExpiresAt?: Date;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: any;
  updatedAt?: any;
}
