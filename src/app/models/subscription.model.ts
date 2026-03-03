export type TypeAbonnement = 'CLASSE' | 'MATIERE';
export type StatutAbonnement = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
export type NiveauScolaire = 'ELEMENTAIRE' | 'MOYEN' | 'SECONDAIRE' | 'UNIVERSITAIRE';

export interface Subscription {
  id?: string;
  userId: string;

  // Type d'abonnement selon le niveau
  type: TypeAbonnement; // CLASSE pour ELEMENTAIRE, MATIERE pour les autres

  // Niveau et classe
  niveauScolaire: NiveauScolaire;
  classe?: string; // Obligatoire si type = CLASSE

  // Matières (uniquement pour MOYEN/SECONDAIRE/UNIVERSITAIRE)
  matiereIds?: string[]; // Exactement 3 matières obligatoires
  matieres?: Array<{
    id: string;
    nom: string;
    icon?: string;
    color?: string;
  }>;

  // Informations de paiement
  montant: number; // 5000 FCFA
  devise: string; // 'XOF'

  // Dates
  dateDebut: Date | { _seconds: number; _nanoseconds: number };
  dateFin: Date | { _seconds: number; _nanoseconds: number };

  // Statut
  statut: StatutAbonnement;
  autoRenew: boolean;

  // Métadonnées
  createdAt: Date | { _seconds: number; _nanoseconds: number };
  updatedAt: Date | { _seconds: number; _nanoseconds: number };

  // Compatibilité avec l'ancien modèle
  plan?: string;
  status?: string;
  amount?: number;
  currency?: string;
  startDate?: { _seconds: number; _nanoseconds: number };
  endDate?: { _seconds: number; _nanoseconds: number };
}

export interface SubscriptionApiResponse {
  success: boolean;
  data: Subscription[];
  count: number;
}

// Helper pour créer un nouvel abonnement (format API backend)
export interface CreateSubscriptionDTO {
  userId: string;
  classe: string;
  niveauScolaire: NiveauScolaire;
  typeAbonnement: 'CLASSE' | 'MATIERE';
  matieres?: string[]; // Noms des matières, pas IDs
}

// Réponse de l'API lors de la création d'un paiement
export interface CreatePaymentResponse {
  success: boolean;
  data: {
    paymentUrl: string;
    paymentId: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    typeAbonnement: 'CLASSE' | 'MATIERE';
    classe: string;
    matieres?: string[];
  };
  message: string;
}

