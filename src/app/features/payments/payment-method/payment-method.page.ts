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
  IonInput,
  IonItem,
  IonLabel,
  ToastController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { cardOutline, chevronBackOutline } from 'ionicons/icons';
import { PaymentService } from '../../services/paymentService';

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
    IonInput,
    IonItem,
    IonLabel,
  ],
})
export class PaymentMethodPage implements OnInit {
  selectedPlan: any;
  isPremiumSubscription: boolean = false;

  courseId: string = '';
  courseTitle: string = '';
  courseImage: string = '';
  course: any = {};

  // Données de paiement pour Orange Money
  customerPhone: string = '';
  customerName: string = '';
  customerEmail: string = '';
  showPhoneInput: boolean = false;
  selectedMethodId: string = '';

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

  constructor(
    private router: Router,
    private location: Location,
    private paymentService: PaymentService,
    private toastCtrl: ToastController
  ) {
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

      // Récupérer les données du cours (seulement si ce n'est pas un abonnement Premium)
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

  ngOnInit() {
    // Récupérer les infos utilisateur depuis localStorage si disponibles
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.customerName = user.name || '';
        this.customerEmail = user.email || '';
        this.customerPhone = user.phone || '';
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
  }

  goBack() {
    this.location.back();
  }

  selectPaymentMethod(method: any) {
    // Si c'est Orange Money, afficher le formulaire de téléphone
    if (method.id === 'orange-money') {
      this.selectedMethodId = method.id;
      this.showPhoneInput = true;
      return;
    }

    // Pour les autres méthodes, continuer normalement
    this.proceedToVerification(method);
  }

  async confirmOrangeMoneyPayment() {
    // Valider le numéro de téléphone
    if (!this.paymentService.validateSenegalPhone(this.customerPhone)) {
      const toast = await this.toastCtrl.create({
        message: 'Numéro de téléphone invalide. Format: +221 7X XXX XX XX',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      return;
    }

    // Formater le numéro
    const formattedPhone = this.paymentService.formatSenegalPhone(this.customerPhone);

    // Sauvegarder les infos client dans localStorage pour l'enrollment
    const customerData = {
      name: this.customerName,
      email: this.customerEmail,
      phone: formattedPhone,
    };
    localStorage.setItem('paymentCustomerData', JSON.stringify(customerData));

    // Créer l'objet méthode avec les données client
    const method = {
      id: 'orange-money',
      name: 'Orange Money',
      customerPhone: formattedPhone,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
    };

    this.proceedToVerification(method);
  }

  cancelPhoneInput() {
    this.showPhoneInput = false;
    this.selectedMethodId = '';
  }

  private proceedToVerification(method: any) {
    if (this.isPremiumSubscription) {
      // Cas d'un abonnement Premium
      this.router.navigate(['/payment-verify'], {
        state: {
          method,
          plan: this.selectedPlan,
          isPremiumSubscription: true,
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
