import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController, AlertController } from '@ionic/angular/standalone';

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
  star,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

import { PaymentData } from 'src/app/models/payment.model';
import { EnrollmentService } from '../../services/enrollmentService';
import { PaymentService } from '../../services/paymentService';
import { firstValueFrom } from 'rxjs';
import { LoadingController } from '@ionic/angular/standalone';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  displayNumber?: string;
  bgColor?: string;
}

@Component({
  selector: 'app-payment-verify',
  templateUrl: './payment-verify.page.html',
  styleUrls: ['./payment-verify.page.scss'],
  standalone: true,
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
  ],
})
export class PaymentVerifyPage implements OnInit {
  selectedPlan: any;
  selectedMethod: any;
  selectedPaymentOption = '';

  isPremiumSubscription = false;

  course: any = {};
  courseId = '';
  courseTitle = '';
  courseImage = '';

  userId = '';

  summary = {
    formula: '',
    price: 0,
    promoCode: 0,
    tva: 0,
    total: 0,
  };

  allPaymentMethods: PaymentMethod[] = [
    {
      id: 'wave',
      name: 'Wave',
      type: 'Paiement mobile',
      displayNumber: '78 710 64 65',
    },
    {
      id: 'orange-money',
      name: 'Orange Money',
      type: 'Paiement mobile',
      displayNumber: '77 123 45 67',
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      type: 'Carte bancaire',
      displayNumber: '**** **** **** 3345',
    },
  ];

  displayedPaymentMethods: PaymentMethod[] = [];

  // Propriétés pour le code promo
  showPromoInput = false;
  promoCodeInput = '';
  appliedPromoCode = '';
  discountPercentage = 0;

  constructor(
    private router: Router,
    private location: Location,
    private enrollmentService: EnrollmentService,
    private paymentService: PaymentService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController // ✅ AJOUT
  ) {
    addIcons({
      chevronBackOutline,
      star,
      cardOutline,
      checkmarkCircle,
    });

    /** ===============================
     *  DONNÉES DE NAVIGATION
     *  =============================== */
    const state =
      this.router.getCurrentNavigation()?.extras?.state || history.state;

    this.selectedPlan = state?.plan;
    this.selectedMethod = state?.method;
    this.isPremiumSubscription = state?.isPremiumSubscription || false;

    this.course = state?.course || {};
    this.courseId = state?.courseId || this.course?.id || '';
    this.courseTitle = state?.courseTitle || this.course?.title || '';
    this.courseImage = state?.courseImage || this.course?.image || '';

    /** ===============================
     *  USER
     *  =============================== */
    const userStr = localStorage.getItem('currentUser');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log(user);

        this.userId = user.id || user._id;
        console.log(this.userId);
      } catch (e) {
        console.error('Erreur parsing user', e);
      }
    }

    if (!this.isPremiumSubscription && !this.courseId) {
      console.error('❌ Aucun courseId reçu');
      this.router.navigate(['/courses']);
      return;
    }

    /** ===============================
     *  SUMMARY
     *  =============================== */
    if (this.selectedPlan) {
      this.summary.formula = this.isPremiumSubscription
        ? 'Abonnement Premium'
        : `Formule ${this.selectedPlan.plan}`;

      this.summary.price = this.selectedPlan.price || 0;
      this.calculateTotal();
    }

    if (this.selectedMethod) {
      this.selectedPaymentOption = this.selectedMethod.id;
      this.setupDisplayedMethods();
    }
  }

  ngOnInit() {}

  setupDisplayedMethods() {
    const selected = this.allPaymentMethods.find(
      (m) => m.id === this.selectedPaymentOption
    );

    this.displayedPaymentMethods = selected ? [selected] : [];
  }

  calculateTotal() {
    const subtotal = this.summary.price - this.summary.promoCode;
    this.summary.tva = Math.round(subtotal * 0.1);
    this.summary.total = subtotal + this.summary.tva;
  }

  goBack() {
    this.location.back();
  }

  // Méthodes pour le code promo
  togglePromoInput() {
    this.showPromoInput = !this.showPromoInput;
    if (!this.showPromoInput) {
      this.promoCodeInput = '';
    }
  }

  applyPromoCode() {
    const promo = this.promoCodeInput.trim().toUpperCase();

    // Liste des codes promo valides
    const validPromoCodes = {
      SANK10: 10,
      IMMA10: 10,
    };

    if (validPromoCodes[promo as keyof typeof validPromoCodes]) {
      this.discountPercentage =
        validPromoCodes[promo as keyof typeof validPromoCodes];
      this.appliedPromoCode = promo;
      this.summary.promoCode = Math.round(
        (this.summary.price * this.discountPercentage) / 100
      );
      this.calculateTotal();

      this.showSuccessToast('Code promo appliqué avec succès !');
      this.showPromoInput = false;
      this.promoCodeInput = '';
    } else {
      this.showErrorAlert(
        'Code promo invalide. Codes valides : SANK10, IMMA10'
      );
    }
  }

  removePromoCode() {
    this.appliedPromoCode = '';
    this.discountPercentage = 0;
    this.summary.promoCode = 0;
    this.calculateTotal();
    this.showToast('Code promo retiré');
  }

  // Méthodes utilitaires pour les toasts
  private async showSuccessToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'success',
    });
    await toast.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'medium',
    });
    await toast.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erreur',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private loading?: HTMLIonLoadingElement;

  // ✅ Afficher le loader
  private async showLoader(message = 'Traitement en cours...') {
    if (this.loading) {
      this.loading.message = message;
      return;
    }

    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
      backdropDismiss: false,
    });

    await this.loading.present();
  }

  // ❌ Fermer le loader
  private async hideLoader() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
    }
  }

  /** ===============================
   *  🔥 ACTION PAIEMENT
   *  =============================== */

  async proceedToPayment() {
    console.log('GGGG');

    if (this.showPromoInput && this.promoCodeInput.trim()) {
      await this.showErrorAlert(
        'Veuillez appliquer ou annuler le code promo avant de continuer'
      );
      return;
    }

    try {
      // ✅ AFFICHER LOADER
      await this.showLoader('Initialisation du paiement...');

      /** ===============================
       *  ⭐ ABONNEMENT PREMIUM
       *  =============================== */
      if (this.isPremium) {
        await this.showLoader('Redirection vers le paiement Premium...');

        if (this.selectedPlan.plan) {
          const planType = this.mapPlanTypeToBackend(this.selectedPlan.plan);

          if (!this.userId || !planType) {
            throw new Error('Infos abonnement manquantes');
          }

          const response = await firstValueFrom(
            this.paymentService.createSubscriptionPayment(planType, this.userId)
          );

          if (response?.success && response?.data?.paymentUrl) {
            await this.hideLoader(); // 🔴 IMPORTANT
            window.location.href = response.data.paymentUrl;
            return;
          }

          throw new Error('URL de paiement introuvable');
        }
      }

      /** ===============================
       *  📘 COURS INDIVIDUEL
       *  =============================== */

      await this.showLoader('Création de l’inscription...');

      const alreadyEnrolled = await this.isUserEnrolledInCourse(this.courseId);
      if (alreadyEnrolled) {
        await this.hideLoader();
        await this.showAlreadyEnrolledAlert();
        return;
      }

      const method = this.allPaymentMethods.find(
        (m) => m.id === this.selectedPaymentOption
      );

      const paymentData: PaymentData = {
        plan: this.selectedPlan,
        method,
        amount: this.summary.total,
        courseId: this.courseId,
        courseTitle: this.courseTitle,
        courseImage: this.courseImage,
        userId: this.userId,
        promoCode: this.appliedPromoCode,
        discountAmount: this.summary.promoCode,
      };

      await this.showLoader('Redirection vers Wave...');

      const result = await this.enrollmentService.createEnrollment(paymentData);

      console.log('Résultat création inscription:', result);

      if (result.payment?.paymentUrl) {
        await this.hideLoader(); // 🔴 IMPORTANT
        window.location.href = result.payment.paymentUrl;
        return;
      }

      await this.hideLoader();

      this.router.navigate(['/course-video', this.courseId], {
        replaceUrl: true,
      });
    } catch (err) {
      console.error('❌ Erreur paiement', err);
      await this.hideLoader();
      await this.showErrorAlert('Erreur lors du paiement');
    }
  }

  private async isUserEnrolledInCourse(courseId: string): Promise<boolean> {
    const enrollments =
      (await this.enrollmentService.getUserEnrollments().toPromise()) || [];
    return enrollments.some(
      (e: any) => e.courseId === courseId && e.status === 'completed'
    );
  }

  private async showAlreadyEnrolledAlert() {
    const toast = await this.toastCtrl.create({
      message: 'Vous êtes déjà inscrit à ce cours',
      duration: 3000,
      color: 'warning',
    });
    await toast.present();
  }

  planLabels: Record<string, string> = {
    MONTHLY: 'Annuelle',
    // YEARLY: 'Annuelle',
    WEEKLY: 'Hebdomadaire',
    COURSE: 'Cours individuel',
  };

  get formulaLabel(): string {
    const raw = this.summary?.formula;

    if (!raw) return '';

    // Extrait MONTHLY depuis "Formule MONTHLY"
    const plan = raw.split(' ').pop()?.toUpperCase();

    return this.planLabels[plan!] || raw;
  }

  get isPremiumPayment(): boolean {
    return this.selectedPlan?.plan == 'Annuelle';
  }

  get isCoursePayment(): boolean {
    return !this.isPremiumPayment;
  }

  private mapPlanTypeToBackend(type: string): string {
    const map: Record<string, string> = {
      Annuelle: 'MONTHLY',
      Mensuelle: 'MONTHLY',
      Hebdomadaire: 'WEEKLY',
      'Cours individuel': 'COURSE',
      Premium: 'MONTHLY',
    };

    return map[type] || type;
  }

  get isPremium(): boolean {
    // Si l'un ou l'autre est vrai, considère que c'est un paiement premium
    return this.isPremiumPayment || this.isPremiumSubscription;
  }
}
