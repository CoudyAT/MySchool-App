import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  personOutline,
  businessOutline,
  checkmarkCircle,
} from 'ionicons/icons';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.page.html',
  styleUrls: ['./subscription-plans.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonTitle,
    IonButtons,
    IonIcon,
    IonHeader,
    IonButton,
    IonToolbar,
    CommonModule,
  ],
})
export class SubscriptionPlansPage implements OnInit {
  plans = [
    {
      type: 'Individuelle',
      icon: 'person-outline',
      price: 1800,
      discount: '-10 %',
      period: '/ ANNÉE',
      features: [
        'Cours complets',
        'Suivi instructeurs',
        'Certificat de réussite',
        'Ressources disponibles',
        'Sessions en ligne',
      ],
    },
    {
      type: 'Entreprise',
      icon: 'business-outline',
      price: 99000,
      discount: '-10 %',
      period: ', ANNÉE',
      features: [
        'Cours complets',
        'Suivi instructeurs',
        'Suivi instructeurs',
        'Ressources disponibles',
        'Sessions en ligne',
      ],
    },
  ];

  constructor(private router: Router, private location: Location) {
    // Enregistrer les icônes
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'person-outline': personOutline,
      'business-outline': businessOutline,
      'checkmark-circle': checkmarkCircle,
    });
  }

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  selectPlan(plan: any) {
    console.log('Plan sélectionné:', plan);
    // Rediriger vers la page de paiement ou traiter l'inscription
     this.router.navigate(['/payment-method'], { state: { plan } });
  }
}
