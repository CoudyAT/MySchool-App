import { Course } from "./course.model";

export interface Enrollment {
  id?: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseImage: string;
  paymentMethod: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
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

export interface PaymentData {
  plan: any;
  method: any;
  amount: number;
  courseId: string;
  courseTitle: string;
  courseImage: string;
}
