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
import { ActivatedRoute, Router } from '@angular/router';
import {
  cardOutline,
  checkmarkCircle,
  chevronBackOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { PaymentData } from 'src/app/models/payment.model';
import { EnrollmentService } from '../../services/enrollmentService';
import { CourseService } from 'src/app/features/services/courseService';
import { PaymentService } from '../../services/paymentService';

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
  courseId: string = '';
  courseTitle: string = '';
  courseImage: string = '';
  course: any = {};
  isPremiumSubscription: boolean = false; // Ajoutez cette propriété

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
      type: 'Paiement par carte',
      displayNumber: '-- -- 3345',
      fullNumber: '**** **** **** 3345',
      bgColor: '#2a2a2a',
    },
  ];

  // Méthodes de paiement à afficher (celle sélectionnée + une autre)
  displayedPaymentMethods: PaymentMethod[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private enrollmentService: EnrollmentService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private courseService: CourseService,
    private paymentService: PaymentService
  ) {
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
      this.isPremiumSubscription =
        navigation.extras.state['isPremiumSubscription'] || false;

      console.log(
        '🔍 PaymentVerify - Type:',
        this.isPremiumSubscription ? 'PREMIUM' : 'COURS INDIVIDUEL'
      );
      console.log('navigation extras state:', navigation.extras.state);

      this.course = navigation.extras.state['course'] || {};
      this.courseId = navigation.extras.state['courseId'];
      this.courseTitle = navigation.extras.state['courseTitle'];
      this.courseImage = navigation.extras.state['courseImage'];

      // Mettre à jour le résumé en fonction du plan
      if (this.selectedPlan) {
        if (this.isPremiumSubscription) {
          this.summary.formula = 'Abonnement Premium';
          this.summary.price = this.selectedPlan.price || 4999;
        } else {
          this.summary.formula = `Formule ${this.selectedPlan.type}`;
          this.summary.price = this.selectedPlan.price;
        }
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
      state: {
        plan: this.selectedPlan,
        isPremiumSubscription: this.isPremiumSubscription,
      },
    });
  }

  onPaymentMethodChange(methodId: string) {
    this.selectedPaymentOption = methodId;
  }

  private async getAllCourses(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.courseService.getAllCourses().subscribe({
        next: (courses) => {
          resolve(courses);
        },
        error: (error) => {
          console.error('Erreur récupération cours:', error);
          reject(error);
        },
      });
    });
  }

  // Méthode pour créer un enrollment Premium
  private async createPremiumEnrollment(
    course: any,
    paymentMethod: any
  ): Promise<void> {
    const paymentData = {
      plan: this.selectedPlan,
      method: paymentMethod,
      amount: this.summary.total,
      courseId: course.id,
      courseTitle: course.title,
      courseImage: course.image,
      status: 'completed',
    };

    try {
      const result = await this.enrollmentService.createEnrollment(paymentData);

      // Si un paiement a été créé, vérifier s'il y a une URL de redirection
      if (result.payment?.data?.paymentUrl) {
        console.log('🔗 URL de paiement Orange Money:', result.payment.data.paymentUrl);
        // Ouvrir l'URL Orange Money dans un navigateur externe ou WebView
        window.open(result.payment.data.paymentUrl, '_blank');
      }

      console.log(`✅ Cours Premium "${course.title}" ajouté`);
    } catch (error) {
      console.error(`❌ Erreur ajout cours Premium "${course.title}":`, error);
      // Ne pas throw pour continuer avec les autres cours même si un échoue
    }
  }

  async proceedToPayment() {
    const selectedMethod = this.allPaymentMethods.find(
      (m) => m.id === this.selectedPaymentOption
    );

    try {
      if (this.isPremiumSubscription) {
        // 🚀 LOGIQUE POUR L'ABONNEMENT PREMIUM
        console.log('🚀 Paiement abonnement Premium...');

        // 1. VÉRIFIER SI L'UTILISATEUR A DÉJÀ DES COURS
        const userEnrollments = await this.getUserEnrollments();
        console.log(
          `📚 ${userEnrollments.length} cours déjà achetés par l'utilisateur`
        );

        // 2. Récupérer tous les cours disponibles
        const allCourses = await this.getAllCourses();
        console.log(`📚 ${allCourses.length} cours disponibles au total`);

        // 3. Filtrer les cours que l'utilisateur n'a pas encore
        const coursesToEnroll = this.filterCoursesNotEnrolled(
          allCourses,
          userEnrollments
        );
        console.log(
          `🎯 ${coursesToEnroll.length} nouveaux cours à ajouter avec Premium`
        );

        // 4. Si l'utilisateur a déjà tous les cours, lui proposer une alternative
        if (coursesToEnroll.length === 0) {
          console.log('ℹ️ Utilisateur a déjà tous les cours');
          this.showAlreadyHaveAllCoursesAlert();
          return;
        }

        // 5. Calculer le prix ajusté si l'utilisateur a déjà certains cours
        const adjustedPrice = this.calculateAdjustedPrice(
          coursesToEnroll.length,
          allCourses.length
        );
        if (adjustedPrice < this.summary.total) {
          console.log(
            `💰 Prix ajusté: ${adjustedPrice} FCFA au lieu de ${this.summary.total}`
          );
          // Vous pouvez proposer une réduction ou continuer avec le prix normal
        }

        // 6. Créer les enrollments seulement pour les nouveaux cours
        const enrollmentPromises = coursesToEnroll.map((course) =>
          this.createPremiumEnrollment(course, selectedMethod)
        );

        // 7. Attendre que tous les enrollments soient créés
        await Promise.all(enrollmentPromises);

        console.log(
          '✅ Tous les nouveaux cours Premium ont été ajoutés avec succès'
        );

        // 8. Rediriger vers la page d'accueil avec message de succès
        this.router.navigate(['/courses'], {
          state: {
            premiumActivated: true,
            coursesCount: coursesToEnroll.length,
            totalCourses: allCourses.length,
            hadPreviousCourses: userEnrollments.length > 0,
          },
          replaceUrl: true,
        });
      } else {
        // 📖 LOGIQUE NORMALE POUR UN COURS INDIVIDUEL
        console.log('courseId dans payment-verify', this.courseId);

        // Vérifier si l'utilisateur a déjà acheté ce cours
        const isAlreadyEnrolled = await this.isUserEnrolledInCourse(
          this.courseId
        );
        if (isAlreadyEnrolled) {
          console.log('❌ Utilisateur déjà inscrit à ce cours');
          this.showAlreadyEnrolledAlert();
          return;
        }

        const paymentData: PaymentData = {
          plan: this.selectedPlan,
          method: selectedMethod,
          amount: this.summary.total,
          courseId: this.courseId,
          courseTitle: this.courseTitle,
          courseImage: this.courseImage,
        };

        const result = await this.enrollmentService.createEnrollment(paymentData);

        // Si paiement Orange Money créé, rediriger vers l'URL de paiement
        if (result.payment?.data?.paymentUrl) {
          console.log('🔗 Redirection vers Orange Money:', result.payment.data.paymentUrl);

          // Sauvegarder l'ID du paiement pour vérification ultérieure
          localStorage.setItem('pendingPaymentId', result.payment.id);
          localStorage.setItem('pendingEnrollmentId', result.enrollmentId);
          localStorage.setItem('pendingCourseId', this.courseId);

          // Ouvrir l'URL Orange Money dans le navigateur
          window.location.href = result.payment.data.paymentUrl;
          return;
        }

        console.log('✅ Paiement cours individuel enregistré avec succès');

        // Rediriger vers la page du cours si pas de paiement en ligne
        this.router.navigate(['/course-video', this.course.id], {
          state: {
            course: this.course,
            courseId: this.courseId,
            enrollmentSuccess: true,
          },
          replaceUrl: true,
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors du paiement:', error);
      this.showErrorAlert('Erreur lors du paiement');
    }
  }

  // NOUVELLES MÉTHODES DE VÉRIFICATION

  // Récupérer tous les enrollments de l'utilisateur
  private async getUserEnrollments(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.enrollmentService.getUserEnrollments().subscribe({
        next: (enrollments) => {
          resolve(enrollments);
        },
        error: (error) => {
          console.error('Erreur récupération enrollments:', error);
          reject(error);
        },
      });
    });
  }

  // Vérifier si l'utilisateur est déjà inscrit à un cours spécifique
  private async isUserEnrolledInCourse(courseId: string): Promise<boolean> {
    try {
      const enrollments = await this.getUserEnrollments();
      return enrollments.some(
        (enrollment) =>
          enrollment.courseId === courseId && enrollment.status === 'completed'
      );
    } catch (error) {
      console.error('Erreur vérification inscription:', error);
      return false;
    }
  }

  // Filtrer les cours que l'utilisateur n'a pas encore
  private filterCoursesNotEnrolled(
    allCourses: any[],
    userEnrollments: any[]
  ): any[] {
    const enrolledCourseIds = userEnrollments
      .filter((enrollment) => enrollment.status === 'completed')
      .map((enrollment) => enrollment.courseId);

    return allCourses.filter(
      (course) => !enrolledCourseIds.includes(course.id)
    );
  }

  // Calculer un prix ajusté basé sur le nombre de nouveaux cours
  private calculateAdjustedPrice(
    newCoursesCount: number,
    totalCoursesCount: number
  ): number {
    if (newCoursesCount === totalCoursesCount) {
      return this.summary.total; // Prix normal si aucun cours possédé
    }

    // Exemple: réduction de 20% par cours déjà possédé
    const discountPerCourse = (this.summary.total * 0.2) / totalCoursesCount;
    const discount = (totalCoursesCount - newCoursesCount) * discountPerCourse;

    return Math.max(this.summary.total - discount, this.summary.total * 0.5); // Minimum 50% du prix
  }

  // ALERTES UTILISATEUR

  private async showAlreadyEnrolledAlert() {
    // Vous pouvez utiliser un toast ou une alerte Ionic
    const toast = await this.toastCtrl.create({
      message: 'Vous êtes déjà inscrit à ce cours !',
      duration: 3000,
      color: 'warning',
      position: 'top',
    });
    await toast.present();

    // Rediriger vers le cours
    this.router.navigate(['/course-video', this.courseId], {
      state: {
        course: this.course,
        enrollmentSuccess: true,
      },
    });
  }

  private async showAlreadyHaveAllCoursesAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Déjà Premium ',
      message:
        'Vous avez déjà accès à tous les cours disponibles. Souhaitez-vous vraiment souscrire à Premium ?',
    });
    await alert.present();
  }

  private async continueWithPremiumAnyway() {
    // Logique pour continuer malgré tout avec Premium
    const allCourses = await this.getAllCourses();
    const selectedMethod = this.allPaymentMethods.find(
      (m) => m.id === this.selectedPaymentOption
    );

    const enrollmentPromises = allCourses.map((course) =>
      this.createPremiumEnrollment(course, selectedMethod)
    );

    await Promise.all(enrollmentPromises);

    this.router.navigate(['/courses'], {
      state: {
        premiumActivated: true,
        coursesCount: allCourses.length,
        hadAllCourses: true,
      },
      replaceUrl: true,
    });
  }

  private async showErrorAlert(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
}
