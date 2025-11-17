import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cardOutline, chevronBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.page.html',
  styleUrls: ['./payment-method.page.scss'],
  imports: [
    IonIcon,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
  ],
})
export class PaymentMethodPage implements OnInit {
  selectedPlan: any;
  isPremiumSubscription: boolean = false;

  // ⭐ AJOUTEZ CES PROPRIÉTÉS
  courseId: string = '';
  courseTitle: string = '';
  courseImage: string = '';
  course: any = {};

  paymentMethods = [
    {
      id: 'wave',
      name: 'Wave',
      logo: 'assets/wave-logo.png',
      bgColor: '#00D9FF',
      textColor: '#fff',
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      logo: 'assets/orange-money-logo.png',
      bgColor: '#fff',
      textColor: '#000',
      border: true,
    },
    {
      id: 'yas-mixx',
      name: 'Yas Mixx',
      logo: 'assets/yas-mixx-logo.png',
      bgColor: '#FFD500',
      textColor: '#000',
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      logo: 'card-outline',
      bgColor: '#2a2a2a',
      textColor: '#fff',
      isIcon: true,
    },
  ];

  constructor(private router: Router, private location: Location) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'card-outline': cardOutline,
    });

    // Récupérer le plan sélectionné depuis la navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      console.log(
        '🔍 PaymentMethodPage - State reçu:',
        navigation.extras.state
      );

      this.selectedPlan = navigation.extras.state['plan'];
      this.isPremiumSubscription =
        navigation.extras.state['isPremiumSubscription'] || false;

      // ⭐ RÉCUPÉREZ LES DONNÉES DU COURS (seulement si ce n'est pas un abonnement Premium)
      if (!this.isPremiumSubscription) {
        this.course = navigation.extras.state['course'] || {};
        this.courseId = navigation.extras.state['courseId'];
        this.courseTitle = navigation.extras.state['courseTitle'];
        this.courseImage = navigation.extras.state['courseImage'];
      }

      console.log('📋 PaymentMethodPage - Données extraites:', {
        plan: this.selectedPlan,
        isPremiumSubscription: this.isPremiumSubscription,
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

  selectPaymentMethod(method: any) {
    if (this.isPremiumSubscription) {
      // Cas d'un abonnement Premium
      this.router.navigate(['/payment-verify'], {
        state: {
          method,
          plan: this.selectedPlan,
          isPremiumSubscription: true,
          // Pas de courseId pour l'abonnement Premium global
        },
      });
    } else {
      // Cas d'un cours individuel
      this.router.navigate(['/payment-verify'], {
        state: {
          method,
          plan: this.selectedPlan,
          courseId: this.courseId,
          courseTitle: this.courseTitle,
          courseImage: this.courseImage,
          course: this.course,
        },
      });
    }
  }
}
