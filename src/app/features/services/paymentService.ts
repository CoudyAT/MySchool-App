import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Payment, PaymentStatus, PaymentMethod } from 'src/app/models/payment.model';
import { ApiService } from 'src/app/core/services/api.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly api = inject(ApiService);

  /**
   * Crée un nouveau paiement Orange Money
   * @param payment - Données du paiement
   * @returns Observable avec la réponse de l'API
   */
  createPayment(payment: {
    userId: string;
    enrollmentId: string;
    courseId: string;
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    customerPhoneNumber: string;
    customerFirstName: string;
    customerLastName: string;
    description?: string;
  }): Observable<ApiResponse<Payment>> {
    return this.api.post<ApiResponse<Payment>>('/wave/create-payment', {
      ...payment,
      currency: payment.currency || 'XOF',
    });
  }

  /**
   * Récupère tous les paiements
   */
  getAllPayments(): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>('/payments');
  }

  /**
   * Récupère un paiement par ID
   */
  getPaymentById(id: string): Observable<ApiResponse<Payment>> {
    return this.api.get<ApiResponse<Payment>>(`/payments/${id}`);
  }

  /**
   * Récupère les paiements d'un utilisateur
   */
  getUserPayments(userId: string): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(`/payments/user/${userId}`);
  }

  /**
   * Récupère les paiements d'une inscription
   */
  getEnrollmentPayments(
    enrollmentId: string
  ): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(
      `/payments/enrollment/${enrollmentId}`
    );
  }

  /**
   * Filtre les paiements par statut
   */
  getPaymentsByStatus(
    status: PaymentStatus
  ): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>(`/payments/status/${status}`);
  }

  /**
   * Recherche un paiement par référence de commande
   */
  getPaymentByOrderReference(
    orderReference: string
  ): Observable<ApiResponse<Payment>> {
    return this.api.get<ApiResponse<Payment>>(
      `/payments/order/${orderReference}`
    );
  }

  /**
   * Vérifie le statut d'un paiement auprès d'Orange Money
   */
  checkPaymentStatus(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.api.get<ApiResponse<Payment>>(`/payments/${paymentId}/check`);
  }

  /**
   * Annule un paiement
   */
  cancelPayment(paymentId: string): Observable<ApiResponse<Payment>> {
    return this.api.post<ApiResponse<Payment>>(
      `/payments/${paymentId}/cancel`,
      {}
    );
  }

  /**
   * Supprime un paiement
   */
  deletePayment(paymentId: string): Observable<ApiResponse<void>> {
    return this.api.delete<ApiResponse<void>>(`/payments/${paymentId}`);
  }

  /**
   * Vérifie si un paiement a expiré
   */
  isPaymentExpired(payment: Payment): boolean {
    if (!payment.expiresAt) return false;

    // Gérer le format Firestore Timestamp
    const expiryDate = payment.expiresAt._seconds
      ? new Date(payment.expiresAt._seconds * 1000)
      : new Date(payment.expiresAt);

    return new Date() > expiryDate;
  }

  /**
   * Vérifie si un paiement peut être annulé
   */
  canBeCancelled(payment: Payment): boolean {
    return payment.status === 'PENDING' && !this.isPaymentExpired(payment);
  }

  /**
   * Formate le montant en FCFA
   */
  formatAmount(amount: number): string {
    return `${(amount / 100).toFixed(2)} FCFA`;
  }

  /**
   * Valide le format d'un numéro de téléphone sénégalais
   */
  validateSenegalPhone(phone: string): boolean {
    // Nettoyer le numéro
    const cleanPhone = phone.replace(/\s/g, '');

    // Formats acceptés: +221XXXXXXXXX, 221XXXXXXXXX, ou XXXXXXXXX
    const regex = /^(\+221|221)?[70|75|76|77|78]\d{7}$/;
    return regex.test(cleanPhone);
  }

  /**
   * Formate un numéro de téléphone sénégalais
   */
  formatSenegalPhone(phone: string): string {
    // Nettoyer le numéro
    let cleanPhone = phone.replace(/\s/g, '').replace('+', '');

    // Ajouter +221 si nécessaire
    if (cleanPhone.startsWith('221')) {
      cleanPhone = '+' + cleanPhone;
    } else if (!cleanPhone.startsWith('+221')) {
      cleanPhone = '+221' + cleanPhone;
    }

    return cleanPhone;
  }

  createSubscriptionPayment(plan: string, userId: string) {
    return this.api.post<any>('/subscriptions/create-payment', {
      plan,
      userId,
    });
  }
}
