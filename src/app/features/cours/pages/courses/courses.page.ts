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
} from 'ionicons/icons';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { Enrollment } from 'src/app/models/payment.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';

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
    private enrollmentService: EnrollmentService
  ) {
    addIcons({
      logOutOutline,
      addOutline,
      shieldCheckmark,
      arrowForwardOutline,
      ribbonOutline,
      playCircleOutline,
    });
  }

  ngOnInit() {
    this.loadEnrolledCourses();
  }

  ngAfterViewInit() {
    this.initializeSwiper();
  }

  ngOnDestroy() {
    this.enrollmentSubscription.unsubscribe();
  }

  // loadEnrolledCourses() {
  //   const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  //   this.enrollmentSubscription = this.enrollmentService
  //     .getUserEnrollments()
  //     .subscribe({
  //       next: (enrollments) => {
  //         this.enrolledCourses = enrollments;
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('❌ Erreur chargement des cours achetés:', error);
  //         this.isLoading = false;
  //       },
  //     });
  // }

  loadEnrolledCourses() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    console.log('🔄 Chargement des cours avec détails...');
    console.log('👤 Utilisateur:', localUser?.firstName, localUser?.lastName);
    console.log('🔑 UID:', localUser?.uid);

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

          // // Debug: afficher les données récupérées
          // enrollmentsWithDetails.forEach((item: any) => {
          //   console.log('📚 Enrollment avec détails:', {
          //     courseTitle: item.courseTitle,
          //     courseId: item.courseId,
          //     hasCourseDetails: !!item.courseDetails,
          //     sessions: item.courseDetails?.sessions,
          //     exercises: item.courseDetails?.exercises,
          //     description: item.courseDetails?.description,
          //   });
          // });
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

  // MODIFIER CETTE MÉTHODE : Naviguer vers les détails du cours
  openCourse(enrollment: Enrollment) {
    // Naviguer vers la page de détail du cours avec l'ID du cours
    this.router.navigate(['/cours-detail', enrollment.courseId], {
      state: {
        enrollment: enrollment, // Passer les données d'enrollment si besoin
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
}
