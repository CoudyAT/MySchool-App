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

  // ⭐ AJOUTEZ CES PROPRIÉTÉS
  courseId: string = '';
  courseTitle: string = '';
  courseImage: string = '';

  constructor(private router: Router, private location: Location) {
    // Enregistrer les icônes
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'person-outline': personOutline,
      'business-outline': businessOutline,
      'checkmark-circle': checkmarkCircle,
    });

    // ⭐ RÉCUPÉREZ LES DONNÉES DU COURS DEPUIS LA NAVIGATION
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      console.log(
        '🔍 SubscriptionPlansPage - State reçu:',
        navigation.extras.state
      );

      this.courseId = navigation.extras.state['courseId'];
      this.courseTitle = navigation.extras.state['courseTitle'];
      this.courseImage = navigation.extras.state['courseImage'];

      console.log('📋 SubscriptionPlansPage - Données extraites:', {
        courseId: this.courseId,
        courseTitle: this.courseTitle,
        courseImage: this.courseImage,
      });
    }
  }

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  selectPlan(plan: any) {
    console.log('🔍 SubscriptionPlansPage - Données avant navigation:', {
      plan,
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      courseImage: this.courseImage,
    });

    // ⭐ PASSEZ TOUTES LES DONNÉES À PaymentMethodPage
    this.router.navigate(['/payment-method'], {
      state: {
        plan,
        courseId: this.courseId,
        courseTitle: this.courseTitle,
        courseImage: this.courseImage,
      },
    });
  }
}
