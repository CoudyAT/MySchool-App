export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error';
  duration?: number;
}