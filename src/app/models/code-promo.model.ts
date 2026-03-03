export interface CodePromo {
  id?: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  expirationDate: string;
  influenceurId: string;
  commissionType: 'fixed' | 'percentage';
  commissionValue: number;
  usageLimit: number;
  description: string;
  isActive: boolean;
}
