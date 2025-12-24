import { Course } from "./course.model";

// Types de paiement
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type PaymentMethod = 'orange-money' | 'wave' | 'free-money' | 'card';

// Interface Payment (v2.1.0 - Payment API)
export interface Payment {
  id?: string;
  userId: string;
  enrollmentId: string;
  courseId: string;
  amount: number;
  currency: string; // 'XOF' par défaut
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  orderReferenceNumber?: string;
  payToken?: string;
  paymentUrl?: string;
  customerPhoneNumber: string;
  customerFirstName: string;
  customerLastName: string;
  transactionId?: string;
  operatorTransactionId?: string;
  description?: string;
  metadata?: any;
  createdAt?: any;
  updatedAt?: any;
  completedAt?: any;
  expiresAt?: any;
}

// Interface Enrollment
export interface Enrollment {
  id?: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  paymentMethod: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'active' | 'cancelled';
  enrolledAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
  chaptersCompleted: string[];
  courseDetails?: {
    // Changez Course[] en objet
    id: string;
    title: string;
    description: string;
    image: string;
    sessions: number;
    exercises: number;
    rating: number;
    category: string;
    certificateAvailable: boolean;
    duration: number;
    level: string;
    price: number;
    type: string;
    isPublished: boolean;
    enrolledUsers: string[];
    createdAt: any;
    updatedAt: any;
    chapters?: any[];
  };
}

// Interface PaymentData (pour les composants)
export interface PaymentData {
  plan?: any;
  method?: any;
  amount: number;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  customerPhoneNumber?: string;
  customerFirstName?: string;
  customerLastName?: string;
  userId?: string;
  promoCode?: string;
  discountAmount?: number;
}

export interface EnrollmentApiResponse {
  success: boolean;
  data: any[];
  count: number;
}

