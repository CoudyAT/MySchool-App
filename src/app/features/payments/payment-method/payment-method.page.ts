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
  isPremiumSubscription = false;
  selectedCategory: string | null = null;
  userInfo: any = null;
  selectedMatieres: any[] = [];

  course: any = null;
  courseId = '';
  courseTitle = '';
  courseImage = '';

  customerPhone = '';
  customerName = '';
  customerEmail = '';
  showPhoneInput = false;
  selectedMethodId = '';

  paymentMethods = [
    { id: 'wave', name: 'Wave' },
    { id: 'orange-money', name: 'Orange Money' },
    { id: 'yas-mixx', name: 'Yas Mixx' },
    { id: 'card', name: 'Carte bancaire' },
  ];

  constructor(
    private router: Router,
    private location: Location,
    private paymentService: PaymentService,
    private toastCtrl: ToastController,
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'card-outline': cardOutline,
    });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    console.log('🔍 PaymentMethodPage - State reçu:', state);

    if (state) {
      this.selectedPlan = state['plan'];
      this.isPremiumSubscription = state['isPremiumSubscription'] ?? false;
      this.selectedCategory = state['selectedCategory'] || null;
      this.userInfo = state['userInfo'] || null;
      this.selectedMatieres = state['matieres'] || [];
      
      if (!this.isPremiumSubscription) {
        this.course = state['course'] ?? null;

        // ✅ CORRECTION MAJEURE ICI
        this.courseId =
          state['courseId'] || this.course?.id || this.course?._id || '';

        this.courseTitle =
          state['courseTitle'] ||
          this.course?.title ||
          this.course?.courseTitle ||
          '';

        this.courseImage =
          state['courseImage'] ||
          this.course?.image ||
          this.course?.courseImage ||
          '';

        if (!this.courseId) {
          console.error('❌ courseId introuvable');
        }
      }
    }

    console.log('📋 PaymentMethodPage - Données finales:', {
      plan: this.selectedPlan,
      isPremiumSubscription: this.isPremiumSubscription,
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      courseImage: this.courseImage,
    });
  }

  ngOnInit() {
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
    if (method.id === 'orange-money') {
      this.selectedMethodId = method.id;
      this.showPhoneInput = true;
      return;
    }
    this.proceedToVerification(method);
  }

  async confirmOrangeMoneyPayment() {
    if (!this.paymentService.validateSenegalPhone(this.customerPhone)) {
      const toast = await this.toastCtrl.create({
        message: 'Numéro invalide (+221 7X XXX XX XX)',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
      return;
    }

    const formattedPhone = this.paymentService.formatSenegalPhone(
      this.customerPhone,
    );

    localStorage.setItem(
      'paymentCustomerData',
      JSON.stringify({
        name: this.customerName,
        email: this.customerEmail,
        phone: formattedPhone,
      }),
    );

    this.proceedToVerification({
      id: 'orange-money',
      name: 'Orange Money',
      customerPhone: formattedPhone,
      customerName: this.customerName,
      customerEmail: this.customerEmail,
    });
  }

  cancelPhoneInput() {
    this.showPhoneInput = false;
    this.selectedMethodId = '';
  }

  private proceedToVerification(method: any) {
    if (this.isPremiumSubscription) {
      console.log("hhh",this.userInfo);
      this.router.navigate(['/payment-verify'], {
        state: {
          method,
          plan: this.selectedPlan,
          isPremiumSubscription: true,
          selectedCategory: this.selectedCategory,
          userInfo: this.userInfo,
          selectedMatieres: this.selectedMatieres,
        },
      });
    } else {
      this.router.navigate(['/payment-verify'], {
        state: {
          method,
          plan: this.selectedPlan,
          course: this.course,
          courseId: this.courseId, // ✅ GARANTI
          courseTitle: this.courseTitle,
          courseImage: this.courseImage,
         
        },
      });
    }
  }
}
