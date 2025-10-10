import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
  IonRadio,
  IonRadioGroup,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import {
  cardOutline,
  checkmarkCircle,
  chevronBackOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  displayNumber?: string;
  fullNumber?: string;
  logo?: string;
  bgColor?: string;
}

@Component({
  selector: 'app-payment-verify',
  templateUrl: './payment-verify.page.html',
  styleUrls: ['./payment-verify.page.scss'],
  imports: [
    IonRadioGroup,
    IonRadio,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonIcon,
    IonButtons,
    IonRadio,
  ],
})
export class PaymentVerifyPage implements OnInit {
  selectedPlan: any;
  selectedMethod: any;
  selectedPaymentOption: string = '';

  // Informations du résumé
  summary = {
    formula: 'Formule Individuelle',
    price: 1800,
    promoCode: 0,
    tva: 200,
    total: 2000,
  };

  // Toutes les options de paiement disponibles
  allPaymentMethods: PaymentMethod[] = [
    {
      id: 'wave',
      name: 'Wave',
      type: 'Paiement mobile',
      displayNumber: '78 710 64 65',
      fullNumber: '78 710 64 65',
      bgColor: '#00D9FF',
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      type: 'Paiement mobile',
      displayNumber: '77 123 45 67',
      fullNumber: '77 123 45 67',
      bgColor: '#FF6600',
    },
    {
      id: 'yas-mixx',
      name: 'Yas Mixx',
      type: 'Paiement mobile',
      displayNumber: '70 987 65 43',
      fullNumber: '70 987 65 43',
      bgColor: '#FFD500',
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      type: 'Paiement mobile',
      displayNumber: '-- -- 3345',
      fullNumber: '**** **** **** 3345',
      bgColor: '#2a2a2a',
    },
  ];

  // Méthodes de paiement à afficher (celle sélectionnée + une autre)
  displayedPaymentMethods: PaymentMethod[] = [];

  constructor(private router: Router, private location: Location) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'card-outline': cardOutline,
      'checkmark-circle': checkmarkCircle,
    });

    // Récupérer les données de navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.selectedPlan = navigation.extras.state['plan'];
      this.selectedMethod = navigation.extras.state['method'];

      // Mettre à jour le résumé en fonction du plan
      if (this.selectedPlan) {
        this.summary.formula = `Formule ${this.selectedPlan.type}`;
        this.summary.price = this.selectedPlan.price;
        this.calculateTotal();
      }

      // Configurer les méthodes de paiement affichées
      if (this.selectedMethod) {
        this.selectedPaymentOption = this.selectedMethod.id;
        this.setupDisplayedMethods();
      }
    }
  }

  ngOnInit() {}

  setupDisplayedMethods() {
    // Trouver la méthode sélectionnée
    const selectedMethod = this.allPaymentMethods.find(
      (m) => m.id === this.selectedPaymentOption
    );
    const cardMethod = this.allPaymentMethods.find((m) => m.id === 'card');

    if (selectedMethod && cardMethod) {
      if (this.selectedPaymentOption === 'card') {
        // Si carte bancaire est sélectionnée, afficher seulement la carte
        this.displayedPaymentMethods = [cardMethod];
      } else {
        // Afficher la méthode sélectionnée + carte bancaire
        this.displayedPaymentMethods = [selectedMethod, cardMethod];
      }
    } else if (selectedMethod) {
      this.displayedPaymentMethods = [selectedMethod];
    } else {
      // Par défaut, afficher Wave et Carte
      this.displayedPaymentMethods = this.allPaymentMethods.filter(
        (m) => m.id === 'wave' || m.id === 'card'
      );
      this.selectedPaymentOption = 'wave';
    }
  }

  calculateTotal() {
    const subtotal = this.summary.price - this.summary.promoCode;
    this.summary.tva = Math.round(subtotal * 0.1); // TVA 10%
    this.summary.total = subtotal + this.summary.tva;
  }

  goBack() {
    this.location.back();
  }

  changePaymentMethod() {
    this.router.navigate(['/payment-method'], {
      state: { plan: this.selectedPlan },
    });
  }

  onPaymentMethodChange(methodId: string) {
    this.selectedPaymentOption = methodId;
  }

  proceedToPayment() {
    const selectedMethod = this.allPaymentMethods.find(
      (m) => m.id === this.selectedPaymentOption
    );

    console.log('Procéder au paiement');
    console.log('Plan:', this.selectedPlan);
    console.log('Méthode:', selectedMethod);
    console.log('Total:', this.summary.total);
    // Rediriger vers la page de traitement du paiement
    // this.router.navigate(['/payment-process'], {
    //   state: {
    //     plan: this.selectedPlan,
    //     method: selectedMethod,
    //     amount: this.summary.total
    //   }
    // });
  }
}