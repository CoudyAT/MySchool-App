import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  IonContent,
  IonSpinner,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { PaymentService } from '../../services/paymentService';

@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.page.html',
  styleUrls: ['./payment-callback.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
    IonIcon,
    IonButton
  ]
})
export class PaymentCallbackPage implements OnInit {
  paymentStatus: 'loading' | 'success' | 'failed' | 'pending' | 'expired' | 'cancelled' = 'loading';
  paymentId: string = '';
  enrollmentId: string = '';
  courseId: string = '';
  message: string = '';
  icon: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {
    addIcons({
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      'time-outline': timeOutline,
      'alert-circle-outline': alertCircleOutline
    });
  }

  async ngOnInit() {
    // Récupérer les paramètres de la query string ou du localStorage
    this.paymentId = this.route.snapshot.queryParams['paymentId'] ||
                     localStorage.getItem('pendingPaymentId') || '';
    this.enrollmentId = localStorage.getItem('pendingEnrollmentId') || '';
    this.courseId = localStorage.getItem('pendingCourseId') || '';

    if (!this.paymentId) {
      this.paymentStatus = 'failed';
      this.message = 'Aucun paiement à vérifier';
      this.icon = 'close-circle-outline';
      return;
    }

    await this.checkPaymentStatus();
  }

  async checkPaymentStatus() {
    try {
      this.paymentStatus = 'loading';
      this.message = 'Vérification du paiement en cours...';

      const response = await firstValueFrom(
        this.paymentService.checkPaymentStatus(this.paymentId)
      );

      if (!response.success || !response.data) {
        throw new Error('Erreur lors de la récupération du paiement');
      }

      const payment = response.data;

      switch (payment.status) {
        case 'SUCCESS':
          this.paymentStatus = 'success';
          this.message = 'Paiement réussi ! Vous allez être redirigé vers votre cours.';
          this.icon = 'checkmark-circle-outline';

          // Nettoyer le localStorage
          this.clearPendingPayment();

          // Rediriger vers le cours après 2 secondes
          setTimeout(() => {
            if (this.courseId) {
              this.router.navigate(['/course-video', this.courseId], {
                replaceUrl: true
              });
            } else {
              this.router.navigate(['/courses'], { replaceUrl: true });
            }
          }, 2000);
          break;

        case 'PENDING':
          this.paymentStatus = 'pending';
          this.message = 'Paiement en attente. Veuillez compléter le paiement sur votre téléphone.';
          this.icon = 'time-outline';
          break;

        case 'FAILED':
          this.paymentStatus = 'failed';
          this.message = 'Le paiement a échoué. Veuillez réessayer.';
          this.icon = 'close-circle-outline';
          this.clearPendingPayment();
          break;

        case 'CANCELLED':
          this.paymentStatus = 'cancelled';
          this.message = 'Le paiement a été annulé.';
          this.icon = 'alert-circle-outline';
          this.clearPendingPayment();
          break;

        case 'EXPIRED':
          this.paymentStatus = 'expired';
          this.message = 'Le paiement a expiré (délai de 15 minutes dépassé).';
          this.icon = 'time-outline';
          this.clearPendingPayment();
          break;

        default:
          this.paymentStatus = 'failed';
          this.message = 'Statut de paiement inconnu.';
          this.icon = 'close-circle-outline';
      }
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      this.paymentStatus = 'failed';
      this.message = 'Erreur lors de la vérification du paiement.';
      this.icon = 'close-circle-outline';
    }
  }

  clearPendingPayment() {
    localStorage.removeItem('pendingPaymentId');
    localStorage.removeItem('pendingEnrollmentId');
    localStorage.removeItem('pendingCourseId');
  }

  retryPayment() {
    // Rediriger vers la page de sélection de méthode de paiement
    if (this.courseId) {
      this.router.navigate(['/payment-method'], {
        state: { courseId: this.courseId }
      });
    } else {
      this.router.navigate(['/courses']);
    }
  }

  goToCourses() {
    this.clearPendingPayment();
    this.router.navigate(['/courses'], { replaceUrl: true });
  }

  async cancelPayment() {
    if (this.paymentStatus !== 'pending') {
      this.goToCourses();
      return;
    }

    try {
      // Récupérer le paiement pour vérifier s'il peut être annulé
      const response = await firstValueFrom(
        this.paymentService.getPaymentById(this.paymentId)
      );

      if (!response.success || !response.data) {
        this.message = 'Impossible de récupérer les informations du paiement.';
        return;
      }

      const payment = response.data;
      const canCancel = this.paymentService.canBeCancelled(payment);

      if (!canCancel) {
        this.message = 'Ce paiement ne peut plus être annulé.';
        return;
      }

      // Annuler le paiement
      const cancelResponse = await firstValueFrom(
        this.paymentService.cancelPayment(this.paymentId)
      );

      if (cancelResponse.success) {
        this.paymentStatus = 'cancelled';
        this.message = 'Paiement annulé avec succès.';
        this.icon = 'alert-circle-outline';
        this.clearPendingPayment();
      } else {
        this.message = 'Erreur lors de l\'annulation du paiement.';
      }
    } catch (error) {
      console.error('Erreur annulation paiement:', error);
      this.message = 'Erreur lors de l\'annulation du paiement.';
    }
  }
}
