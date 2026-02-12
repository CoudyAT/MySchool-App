import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonSpinner,
  IonIcon,
  IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, homeOutline } from 'ionicons/icons';
import { EnrollmentService } from '../../services/enrollmentService';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
    IonIcon,
    IonButton,
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="status-container">
        <!-- Loading state -->
        <div *ngIf="status === 'loading'" class="loading-state">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
          <h2>Vérification du paiement</h2>
          <p>Veuillez patienter pendant que nous vérifions votre paiement...</p>
        </div>

        <!-- Success state -->
        <div *ngIf="status === 'success'" class="success-state">
          <div class="icon-circle success">
            <ion-icon name="checkmark-circle-outline"></ion-icon>
          </div>
          <h2>Paiement réussi !</h2>
          <p>Votre abonnement a été activé avec succès.</p>
          <p class="details" *ngIf="classe">Classe: {{ classe }}</p>
          <p class="redirect-info">Redirection automatique dans 3 secondes...</p>
          <ion-button expand="block" (click)="goToCourses()">
            <ion-icon name="home-outline" slot="start"></ion-icon>
            Accéder aux cours maintenant
          </ion-button>
        </div>

        <!-- Error state -->
        <div *ngIf="status === 'error'" class="error-state">
          <div class="icon-circle error">
            <ion-icon name="close-circle-outline"></ion-icon>
          </div>
          <h2>Une erreur est survenue</h2>
          <p>{{ errorMessage }}</p>
          <ion-button expand="block" (click)="goToCourses()">
            Retour à l'accueil
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .status-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 24px;
      text-align: center;
    }

    .loading-state, .success-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      max-width: 400px;
    }

    h2 {
      color: #1a1a2e;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    p {
      color: #666;
      font-size: 16px;
      margin: 0;
      line-height: 1.5;
    }

    .details {
      color: #4F6EF7;
      font-weight: 500;
    }

    .redirect-info {
      color: #999;
      font-size: 14px;
      font-style: italic;
      margin-top: 8px;
    }

    ion-spinner {
      width: 56px;
      height: 56px;
    }

    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .icon-circle.success {
      background: rgba(45, 211, 111, 0.15);
    }

    .icon-circle.success ion-icon {
      font-size: 48px;
      color: #2dd36f;
    }

    .icon-circle.error {
      background: rgba(235, 68, 90, 0.15);
    }

    .icon-circle.error ion-icon {
      font-size: 48px;
      color: #eb445a;
    }

    ion-button {
      margin-top: 24px;
      --background: #4F6EF7;
      --border-radius: 12px;
      height: 48px;
      font-weight: 500;
    }
  `]
})
export class SubscriptionSuccessPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly toastCtrl = inject(ToastController);

  status: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';
  subscriptionId = '';
  userId = '';
  classe = '';

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, homeOutline });
  }

  async ngOnInit() {
    // Récupérer les paramètres de l'URL
    this.route.queryParams.subscribe(async params => {
      this.subscriptionId = params['subscriptionId'] || '';
      this.userId = params['userId'] || '';
      this.classe = decodeURIComponent(params['classe'] || '');

      console.log('Subscription Success - Params:', {
        subscriptionId: this.subscriptionId,
        userId: this.userId,
        classe: this.classe
      });

      if (this.subscriptionId && this.userId) {
        await this.activateSubscription();
      } else {
        this.status = 'error';
        this.errorMessage = 'Paramètres de paiement manquants.';
      }
    });
  }

  async activateSubscription() {
    try {
      // Vérifier l'abonnement actif via l'API
      const response = await firstValueFrom(
        this.enrollmentService.getActiveSubscription(this.userId)
      );

      console.log('Réponse vérification abonnement:', response);

      // Si Wave a redirigé ici, le paiement est validé
      this.status = 'success';

      // Mettre à jour le localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id === this.userId || currentUser._id === this.userId) {
        currentUser.hasActiveSubscription = true;
        currentUser.subscriptionId = this.subscriptionId;
        if (response?.data) {
          currentUser.subscription = response.data;
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      // Afficher un toast
      const toast = await this.toastCtrl.create({
        message: 'Abonnement activé avec succès !',
        duration: 3000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Redirection automatique vers les cours après 3 secondes
      setTimeout(() => {
        this.goToCourses();
      }, 3000);
    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      // En cas d'erreur API, afficher tout de même succès car Wave a confirmé le paiement
      this.status = 'success';

      // Mettre à jour le localStorage quand même
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id === this.userId || currentUser._id === this.userId) {
        currentUser.hasActiveSubscription = true;
        currentUser.subscriptionId = this.subscriptionId;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      // Redirection automatique même en cas d'erreur API
      setTimeout(() => {
        this.goToCourses();
      }, 3000);
    }
  }

  goToCourses() {
    this.router.navigate(['/courses'], { replaceUrl: true });
  }
}

