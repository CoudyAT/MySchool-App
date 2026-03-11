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
  selectedCategory: string | null = null;
  userInfo: any = null;
  selectedMatieres: any[] = [];

  isPremiumSubscription = false;

  // Abonnement par classe (ELEMENTAIRE)
  isClasseSubscription = false;
  classe: string = '';
  niveauScolaire: string = '';
  totalCourses: number = 0;

  // Abonnement par matière (MOYEN/SECONDAIRE/UNIVERSITAIRE)
  isMatiereSubscription = false;
  subscriptionMatieres: string[] = [];

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

  private initializePaymentMethods(userPhone: string) {
    this.allPaymentMethods = [
      {
        id: 'wave',
        name: 'Wave',
        type: 'Paiement mobile',
        displayNumber: userPhone || 'Numéro non disponible',
      },
      {
        id: 'orange-money',
        name: 'Orange Money',
        type: 'Paiement mobile',
        displayNumber: userPhone || 'Numéro non disponible',
      },
      {
        id: 'card',
        name: 'Carte bancaire',
        type: 'Carte bancaire',
        displayNumber: '**** **** **** 3345',
      },
    ];

    this.setupDisplayedMethods();
  }

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
    private loadingCtrl: LoadingController, // ✅ AJOUT
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
    console.log('State reçu dans PaymentVerifyPage:', state);

    this.selectedPlan = state?.plan;
    console.log('State reçu dans PaymentVerifyPage:', this.selectedPlan);
    this.selectedMethod = state?.selectedMethod || state?.method;
    this.selectedCategory = state?.selectedCategory || null;
    this.isPremiumSubscription = state?.isPremiumSubscription || false;
    this.userInfo = state['userInfo'] || null;
    console.log('user', this.userInfo);

    this.selectedMatieres = state['selectedMatieres'] || [];
    console.log('matire', this.selectedMatieres);

    // 🎯 Abonnement par classe
    this.isClasseSubscription = state?.isClasseSubscription || false;
    // 🎯 Abonnement par matière
    this.isMatiereSubscription = state?.isMatiereSubscription || false;

    if (this.isClasseSubscription) {
      this.classe = state?.classe || '';
      this.niveauScolaire = state?.niveauScolaire || '';
      this.totalCourses = state?.totalCourses || 0;
      this.courseTitle = `Abonnement classe ${this.classe}`;

      console.log('🎯 Abonnement par classe détecté');
    } else if (this.isMatiereSubscription) {
      this.classe = state?.classe || '';
      this.niveauScolaire = state?.niveauScolaire || '';
      this.subscriptionMatieres = state?.matieres || [];
      this.totalCourses = state?.totalCourses || 0;
      this.courseTitle = `Abonnement ${this.subscriptionMatieres.length} matières - ${this.classe}`;

      console.log('🎯 Abonnement par matière détecté');
      console.log('   Classe:', this.classe);
      console.log('   Niveau:', this.niveauScolaire);
      console.log('   Matières:', this.subscriptionMatieres);
    }

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
        const userPhone = user.phone || '';
        this.initializePaymentMethods(userPhone);
        console.log(this.userId);
      } catch (e) {
        console.error('Erreur parsing user', e);
      }
    }

    // Validation : il faut soit un courseId, soit une souscription Premium, soit un abonnement classe/matière
    if (
      !this.isPremiumSubscription &&
      !this.isClasseSubscription &&
      !this.isMatiereSubscription &&
      !this.courseId
    ) {
      console.error(
        "❌ Aucun courseId reçu et ce n'est ni Premium ni abonnement classe/matière",
      );
      this.router.navigate(['/courses']);
      return;
    }

    /** ===============================
     *  SUMMARY
     *  =============================== */
    if (this.isClasseSubscription) {
      // Résumé pour abonnement par classe (ELEMENTAIRE)
      this.summary.formula = `Abonnement classe ${this.classe}`;
      this.summary.price = 5000;
      this.calculateTotal();
    } else if (this.isMatiereSubscription) {
      // Résumé pour abonnement par matière (MOYEN/SECONDAIRE/UNIVERSITAIRE)
      this.summary.formula = `Abonnement ${this.subscriptionMatieres.length} matières — ${this.classe}`;
      this.summary.price = 5000;
      this.calculateTotal();

      console.log('📊 Résumé abonnement matière:', {
        classe: this.classe,
        niveauScolaire: this.niveauScolaire,
        matieres: this.subscriptionMatieres,
        price: this.summary.price,
      });
    } else if (this.selectedPlan) {
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

  ngOnInit() { }

  setupDisplayedMethods() {
    const selected = this.allPaymentMethods.find(
      (m) => m.id === this.selectedPaymentOption,
    );

    this.displayedPaymentMethods = selected ? [selected] : [];
  }

  calculateTotal() {
    const subtotal = this.summary.price - this.summary.promoCode;
    this.summary.tva = Math.round(subtotal * 0.1);
    this.summary.total = subtotal;
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

  async applyPromoCode() {
    const promo = this.promoCodeInput.trim().toUpperCase();

    if (!promo) return;

    if (!this.userId) {
      await this.showErrorAlert('Utilisateur non identifié.');
      return;
    }

    try {
      await this.showLoader('Validation du code promo...');

      // Appel API
      const response: any = await firstValueFrom(
        this.paymentService.validatePromoCode(promo, {
          // code: promo,
          userId: this.userId,
        }),
      );

      await this.hideLoader();

      if (response.success && response.data) {
        // Ici tu peux récupérer par exemple data.discount ou data.finalPrice
        // Adapte selon la réponse exacte de ton backend
        const { discountValue, finalPrice } = response.data;

        this.appliedPromoCode = promo;
        this.summary.promoCode = discountValue || 0;
        this.calculateTotal();

        this.showSuccessToast(`Code promo appliqué : -${discountValue} FCFA`);
        this.showPromoInput = false;
        this.promoCodeInput = '';
      } else {
        this.showErrorAlert('Code promo invalide ou expiré');
      }
    } catch (err) {
      await this.hideLoader();
      console.error('Erreur validation code promo', err);
      await this.showErrorAlert('Erreur lors de la validation du code promo');
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
    if (this.showPromoInput && this.promoCodeInput.trim()) {
      await this.showErrorAlert(
        'Veuillez appliquer ou annuler le code promo avant de continuer',
      );
      return;
    }

    try {
      // ✅ AFFICHER LOADER
      await this.showLoader('Initialisation du paiement...');

      /** ===============================
       *  🎯 ABONNEMENT PAR CLASSE (ELEMENTAIRE)
       *  =============================== */
      if (this.isClasseSubscription) {
        await this.showLoader("Création de l'abonnement classe...");
        console.log('🎯 Traitement abonnement classe:', {
          classe: this.classe,
          niveauScolaire: this.niveauScolaire,
          userId: this.userId,
          promoCode: this.appliedPromoCode,
          finalAmount: this.summary.total.toString(),
        });

        if (!this.userId || !this.classe) {
          throw new Error("Informations d'abonnement manquantes");
        }

        // Appeler l'API pour créer l'abonnement classe
        // Pour CLASSE, on passe matieres = undefined et promoCode en 5ème position
        const response = await firstValueFrom(
          this.paymentService.createSubscriptionPayment(
            this.userId,
            this.classe,
            this.niveauScolaire,
            'CLASSE',
            undefined, // 👈 matieres = undefined (4ème paramètre)
            this.appliedPromoCode, // 👈 promoCode (5ème paramètre)
            this.summary.total.toString(), // 👈 finalAmount (6ème paramètre)
          ),
        );

        if (response?.success && response?.data?.paymentUrl) {
          await this.hideLoader();
          console.log('✅ URL de paiement reçue:', response.data.paymentUrl);
          window.location.href = response.data.paymentUrl;
          return;
        }

        throw new Error("URL de paiement introuvable pour l'abonnement classe");
      }

      /** ===============================
       *  📚 ABONNEMENT PAR MATIÈRE (MOYEN/SECONDAIRE/UNIVERSITAIRE)
       *  =============================== */
      if (this.isMatiereSubscription) {
        await this.showLoader("Création de l'abonnement matières...");
        console.log('📚 Traitement abonnement matière:', {
          classe: this.classe,
          niveauScolaire: this.niveauScolaire,
          matieres: this.subscriptionMatieres,
          userId: this.userId,
          promoCode: this.appliedPromoCode,
          finalAmount: this.summary.total.toString(),
        });

        if (!this.userId || this.subscriptionMatieres.length === 0) {
          throw new Error("Informations d'abonnement manquantes");
        }

        // Pour MATIERE, on passe les matieres en 4ème paramètre et promoCode en 5ème
        const response = await firstValueFrom(
          this.paymentService.createSubscriptionPayment(
            this.userId,
            this.classe || '',
            this.niveauScolaire,
            'MATIERE',
            this.subscriptionMatieres, // 👈 matieres (4ème paramètre)
            this.appliedPromoCode, // 👈 promoCode (5ème paramètre)
            this.summary.total.toString(), // 👈 finalAmount (6ème paramètre)
          ),
        );

        if (response?.success && response?.data?.paymentUrl) {
          await this.hideLoader();
          console.log('✅ URL de paiement reçue:', response.data.paymentUrl);
          window.location.href = response.data.paymentUrl;
          return;
        }

        throw new Error(
          "URL de paiement introuvable pour l'abonnement matière",
        );
      }

      /** ===============================
       *  ⭐ ABONNEMENT PREMIUM
       *  =============================== */
      // Dans la méthode proceedToPayment() - ABONNEMENT PREMIUM
      if (this.isPremium) {
        await this.showLoader('Redirection vers le paiement Premium...');
        console.log('⭐ PREMIUM', this.selectedPlan?.type);

        if (this.selectedPlan?.type) {
          const planType = this.mapPlanTypeToBackend(this.selectedPlan.type);

          if (!this.userId || !planType) {
            throw new Error('Infos abonnement manquantes');
          }
          let response;
          // ✅ CAS ÉLÉMENTAIRE
          if (this.userInfo?.niveau === 'ELEMENTAIRE') {
            response = await firstValueFrom(
              this.paymentService.createSubscriptionPayment(
                this.userId,
                this.userInfo?.classe || '',
                this.userInfo?.niveau || '',
                'CLASSE',
                undefined, // 👈 pas de matieres
                this.appliedPromoCode,
                this.summary.total.toString(),
              ),
            );
          }
          // ✅ AUTRES NIVEAUX
          else {
            response = await firstValueFrom(
              this.paymentService.createSubscriptionPayment(
                this.userId,
                this.userInfo?.classe || '',
                this.userInfo?.niveau || '',
                'MATIERE',
                this.selectedMatieres, // 👈 matieres
                this.appliedPromoCode,
                this.summary.total.toString(),
              ),
            );
          }

          if (response?.success && response?.data?.paymentUrl) {
            await this.hideLoader();
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
        (m) => m.id === this.selectedPaymentOption,
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
      (e: any) => e.courseId === courseId && e.status === 'completed',
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