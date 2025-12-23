import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone'; // ✅ Import corrigé
import { signOut } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { register } from 'swiper/element/bundle';
register();
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';

import { addIcons } from 'ionicons';
import {
  addOutline,
  logOutOutline,
  arrowForwardOutline,
  ribbonOutline,
  playCircleOutline,
  shieldCheckmark,
  checkmarkCircle,
  cardOutline,
  shieldCheckmarkOutline,
  starOutline,
  personCircleOutline,
  trendingUpOutline,
  bookOutline,
  bulbOutline,
  calculatorOutline,
  lockOpenOutline,
  optionsOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { Enrollment } from 'src/app/models/payment.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';
import { PreminumModalComponent } from 'src/app/features/component/preminum-modal/preminum-modal.component';
import { InstructorService } from 'src/app/features/services/instructorService';
import { Instructor } from 'src/app/models/instructor.model';
import { UserService } from 'src/app/features/auth/services/user.service';
import { FcmService } from 'src/app/features/services/fcm.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    BottomMenuComponent,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonSpinner,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CoursesPage implements OnInit, AfterViewInit, OnDestroy {
  currentSlide = 0;
  enrolledCourses: Enrollment[] = [];
  instructors: Instructor[] = [];
  isLoading = true;
  private enrollmentSubscription: Subscription = new Subscription();

  slideOpts = {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 400,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
  };

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private auth: Auth,
    private enrollmentService: EnrollmentService,
    private modalCtrl: ModalController,
    private instructorService: InstructorService,
    private fcmService: FcmService
  ) {
    addIcons({ personCircleOutline, starOutline, addOutline, optionsOutline, lockOpenOutline, shieldCheckmark, trendingUpOutline, bookOutline, bulbOutline, calculatorOutline, logOutOutline, ribbonOutline, checkmarkCircle, cardOutline, shieldCheckmarkOutline, arrowForwardOutline, playCircleOutline, });
  }

  ngOnInit() {
    this.loadEnrolledCourses();
    this.instructorService.getInstructors().subscribe((data) => {
      this.instructors = data;
    });
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['premiumActivated']) {
      this.showPremiumSuccessToast();
      this.loadEnrolledCourses(); // Recharger les cours
    }

    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    const userId = localUser.uid;
    this.fcmService.initFCM(userId);
    this.fcmService.listenMessages();

  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  ngOnDestroy() {
    this.enrollmentSubscription.unsubscribe();
  }

  loadEnrolledCourses() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log(
      '👤 Utilisateur connecté:',
      localUser?.firstName,
      localUser?.lastName
    );
    console.log('🔑 UID:', localUser?.uid);

    if (!localUser || !localUser.uid) {
      console.error('❌ Aucun utilisateur connecté trouvé');
      this.isLoading = false;
      return;
    }

    this.enrollmentSubscription = this.enrollmentService
      .getUserEnrollmentsWithCourseDetails() // Utiliser la nouvelle méthode
      .subscribe({
        next: (enrollmentsWithDetails) => {
          console.log(
            '✅ Cours avec détails chargés:',
            enrollmentsWithDetails.length
          );

          this.enrolledCourses = enrollmentsWithDetails;
          console.log('📚 Cours assignés:', this.enrolledCourses);

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement des cours avec détails:', error);
          this.isLoading = false;
        },
      });
  }

  initializeSwiper() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      Object.assign(swiperEl, this.slideOpts);
      swiperEl.initialize();
      console.log('✅ Swiper initialisé avec succès');
    } else {
      console.log('❌ Swiper container non trouvé');
    }
  }

  onSlideChange(event: any) {
    this.currentSlide = event.detail[0].activeIndex;
    console.log('Slide changé:', this.currentSlide);
  }

  onSwiperInit(swiper: any) {
    console.log('✅ Swiper prêt');
  }

  goToCoursesPage() {
    this.router.navigate(['/mes-cours']);
  }

  goToBiblio() {
    this.router.navigate(['/biblio']);
  }

  goToTutos() {
    this.router.navigate(['/tutos']);
  }

  goToExos() {
    this.router.navigate(['/exos']);
  }

  openCourse(enrollment: Enrollment) {
    this.router.navigate(['/course-detail/', enrollment.courseId], {
      state: {
        enrollment: enrollment,
      },
    });
  }

  // Obtenir le texte de progression
  getProgressText(progress: number): string {
    return `${progress}% complété`;
  }

  // Formater la date d'inscription
  getFormattedDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      let date: Date;

      // Gérer le timestamp Firestore
      if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '';
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      const toast = await this.toastCtrl.create({
        message: 'Déconnexion  ✅',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/signup'], { replaceUrl: true });
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      const toast = await this.toastCtrl.create({
        message: 'Erreur lors de la déconnexion ❌',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async openPremiumModal() {
    const modal = await this.modalCtrl.create({
      component: PreminumModalComponent,
      cssClass: 'premium-modal',
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.subscribed) {
      // L'utilisateur a souscrit
      const toast = await this.toastCtrl.create({
        message: 'Bienvenue dans Premium ! 🌟',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    }
  }
  private async showPremiumSuccessToast() {
    const toast = await this.toastCtrl.create({
      message: '🎉 Félicitations ! Votre abonnement Premium est activé !',
      duration: 4000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToInstructorProfile(id: string) {
    this.router.navigate(['/instructor-profile', id]);
  }
}
