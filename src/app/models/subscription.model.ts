export interface Subscription {
  userId: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  startDate: { _seconds: number; _nanoseconds: number };
  endDate: { _seconds: number; _nanoseconds: number };
  autoRenew: boolean;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
  id: string;
}

export interface SubscriptionApiResponse {
  success: boolean;
  data: Subscription[];
  count: number;
}
