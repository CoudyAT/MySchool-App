import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  checkmarkCircleOutline,
  starOutline,
  trophyOutline,
  shieldCheckmarkOutline,
  downloadOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router'; // Ajoutez Router

@Component({
  selector: 'app-premium-modal',
  templateUrl: './preminum-modal.component.html',
  styleUrls: ['./preminum-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
  ],
})
export class PreminumModalComponent implements OnInit {
  premiumFeatures = [
    {
      icon: 'checkmark-circle-outline',
      title: 'Accès illimité',
      description: 'Tous les cours disponibles sans restriction',
    },
    {
      icon: 'star-outline',
      title: 'Contenus exclusifs',
      description: 'Cours avancés et masterclass réservés aux membres Premium',
    },
    {
      icon: 'download-outline',
      title: 'Téléchargement',
      description: 'Téléchargez vos cours pour apprendre hors ligne',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Certificats Premium',
      description: 'Obtenez des certificats reconnus pour vos formations',
    },
    {
      icon: 'trophy-outline',
      title: 'Support prioritaire',
      description: 'Assistance dédiée et réponses rapides à vos questions',
    },
  ];

  constructor(
    private modalCtrl: ModalController,
    private router: Router // Injectez Router
  ) {
    addIcons({
      closeOutline,
      checkmarkCircleOutline,
      starOutline,
      trophyOutline,
      shieldCheckmarkOutline,
      downloadOutline,
    });
  }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  subscribeToPremium() {
    console.log('🚀 Redirection vers la page de paiement Premium...');

    // Fermer le modal d'abord
    this.modalCtrl.dismiss();

    // Rediriger vers la page de méthode de paiement avec les infos Premium
    this.router.navigate(['/payment-method'], {
      state: {
        plan: {
          type: 'MONTHLY',
          name: 'Abonnement Premium',
          price: 5000,
          description: 'Accès illimité à tous les cours',
          features: [
            'Tous les cours disponibles',
            'Contenus exclusifs',
            'Téléchargement hors ligne',
            'Certificats Premium',
            'Support prioritaire',
          ],
        },
        isPremiumSubscription: true, // Flag pour identifier que c'est un abonnement Premium
      },
    });
  }
}
