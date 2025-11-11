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
}

export interface PaymentData {
  plan: any;
  method: any;
  amount: number;
  courseId: string;
  courseTitle: string;
  courseImage: string;
}
