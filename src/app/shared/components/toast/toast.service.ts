import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from './toast.model';


@Injectable({
  providedIn: 'root'
})
export class ToastService {
    private toastSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastSubject.asObservable();

  constructor() { }

  showSuccess(message: string, duration: number = 4000) {
    this.showToast(message, 'success', duration);
  }

  showWarning(message: string, duration: number = 5000) {
    this.showToast(message, 'warning', duration);
  }

  showError(message: string, duration: number = 6000) {
    this.showToast(message, 'error', duration);
  }

  private showToast(message: string, type: 'success' | 'warning' | 'error', duration: number) {
    const id = this.generateId();
    const toast: ToastMessage = { id, message, type, duration };
    
    const currentToasts = this.toastSubject.value;
    this.toastSubject.next([...currentToasts, toast]);

    // Auto-remove après la durée spécifiée
    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  removeToast(id: string) {
    const currentToasts = this.toastSubject.value;
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastSubject.next(filteredToasts);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}