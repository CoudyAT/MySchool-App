import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { PreminumModalComponent } from 'src/app/features/component/preminum-modal/preminum-modal.component';
import { ToastController } from '@ionic/angular';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSearchbar,
  IonButtons,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  arrowBackOutline,
  checkmarkCircle,
  chevronBackOutline,
  flagOutline,
  helpCircleOutline,
  languageOutline,
  star,
  starHalf,
  starOutline,
  timeOutline,
  trophyOutline,
  downloadOutline,
  ellipsisVertical,
  eyeOutline,
  lockOpenOutline,
  lockClosedOutline,
  chevronForwardOutline,
  barChartOutline,
  schoolOutline,
  listOutline,
  documentOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CourseService } from 'src/app/features/services/courseService';
import { Chapter, Course } from 'src/app/models/course.model';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';
import { ChapterService } from 'src/app/features/services/chapter.service';
import { CourseAccessService, CourseAccessResult } from 'src/app/features/services/course-access.service';
import { User } from 'src/app/models/user.model';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-cours-detail',
  templateUrl: './cours-detail.page.html',
  styleUrls: ['./cours-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonButtons,
    RouterModule,
    IonCard,
    IonCardContent,
    DesktopHeaderComponent,
  ],
})
export class CoursDetailPage implements OnInit, OnDestroy {
  course: Course | null = null;
  isLoading = true;
  isUserEnrolled = false;
  enrollmentProgress = 0;
  currentEnrollment: any = null;
  chapter!: Chapter;
  heroActiveTab: 'chapters' | 'documents' = 'chapters';

  // Accès abonné
  hasSubscriptionAccess = false;
  accessResult: CourseAccessResult | null = null;
  currentUser: User | null = null;

  chapters: Chapter[] = [];
  private courseSubscription: Subscription = new Subscription();
  private enrollmentSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private chapterService: ChapterService,
    private firestore: Firestore,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private courseAccessService: CourseAccessService,
  ) {
    addIcons({
      chevronBackOutline,
      barChartOutline,
      timeOutline,
      listOutline,
      documentOutline,
      documentTextOutline,
      lockOpenOutline,
      lockClosedOutline,
      chevronForwardOutline,
      schoolOutline,
      star,
      starHalf,
      downloadOutline,
      eyeOutline,
      ellipsisVertical,
      languageOutline,
      starOutline,
      checkmarkCircle,
      flagOutline,
      helpCircleOutline,
      trophyOutline,
      arrowBackOutline,
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadCourseDetails();
  }

  /**
   * Charger l'utilisateur courant
   */
  loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  /**
   * Vérifier l'accès au cours via l'abonnement
   */
  checkSubscriptionAccess() {
    if (!this.course || !this.currentUser) return;

    this.courseAccessService.checkCourseAccess(this.course, this.currentUser).subscribe({
      next: (result) => {
        this.accessResult = result;
        this.hasSubscriptionAccess = result.hasAccess;
        console.log('🔐 Accès cours:', result.hasAccess, '- Raison:', result.reason);
      },
      error: (err) => {
        console.error('Erreur vérification accès:', err);
        this.hasSubscriptionAccess = false;
      },
    });
  }

  ngOnDestroy() {
    this.courseSubscription.unsubscribe();
    this.enrollmentSubscription.unsubscribe();
  }

  // loadCourseDetails() {
  //   const courseId = this.route.snapshot.paramMap.get('id');

  //   if (courseId) {
  //     console.log('Loading course details for ID:', courseId);

  //     this.courseSubscription = this.courseService
  //       .getCourse(courseId)
  //       .subscribe({
  //         next: (courseData: any) => {
  //           if (courseData) {
  //             this.course = courseData;
  //             console.log('Course loaded:', this.course);

  //             // Charger les chapitres après avoir le cours
  //             this.loadChapters(courseId);

  //             // Vérifier si l'utilisateur est déjà inscrit à ce cours
  //             this.checkUserEnrollment(courseId);
  //           } else {
  //             console.error('Course not found');
  //             this.router.navigate(['/mes-cours']);
  //           }
  //           this.isLoading = false;
  //         },
  //         error: (error) => {
  //           console.error('Error loading course:', error);
  //           this.isLoading = false;
  //         },
  //       });
  //   } else {
  //     console.error('No course ID provided');
  //     this.router.navigate(['/mes-cours']);
  //   }
  // }

  async loadCourseDetails() {
    const courseId = this.route.snapshot.paramMap.get('id');

    if (!courseId) {
      console.error('No course ID provided');
      this.router.navigate(['/mes-cours']);
      return;
    }

    console.log('Loading course details for ID:', courseId);

    this.courseSubscription = this.courseService.getCourse(courseId).subscribe({
      next: async (courseData: any) => {
        if (!courseData) {
          console.error('Course not found');
          this.router.navigate(['/mes-cours']);
          return;
        }

        // 🔹 Données venant de l'API
        this.course = courseData;
        console.log('Course loaded from API:', this.course);

        // 🔥 Lecture Firestore pour champs manquants
        try {
          const courseRef = doc(this.firestore, 'courses', courseId);
          const snap = await getDoc(courseRef);

          if (snap.exists()) {
            const firestoreCourse: any = snap.data();

            if (this.course) {
              this.course.instructorId = firestoreCourse.instructorId || null;

              this.course.instructorName =
                firestoreCourse.instructorName || null;
            }
          }
        } catch (err) {
          console.error('Erreur lecture Firestore:', err);
        }

        // Charger autres données
        this.loadChapters(courseId);
        this.checkUserEnrollment(courseId);
        this.checkSubscriptionAccess();

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading = false;
      },
    });
  }

  checkUserEnrollment(courseId: string) {
    this.enrollmentSubscription = this.enrollmentService
      .getUserEnrollments()
      .subscribe({
        next: (enrollments: any[]) => {
          console.log('Enrollments trouvés:', enrollments);

          // Vérifier si l'utilisateur est inscrit à ce cours
          const enrollment = enrollments.find(
            (enroll) => enroll.courseId === courseId,
          );

          if (enrollment) {
            this.isUserEnrolled = true;
            this.currentEnrollment = enrollment;
            this.enrollmentProgress = enrollment.progress || 0;
            console.log(
              'Utilisateur déjà inscrit, progression:',
              this.enrollmentProgress + '%',
            );
          } else {
            this.isUserEnrolled = false;
            console.log('Utilisateur non inscrit à ce cours');
          }
        },
        error: (error) => {
          console.error('Erreur vérification inscription:', error);
          this.isUserEnrolled = false;
        },
      });
  }

  // Méthode pour générer les niveaux par défaut si non fournis
  private getDefaultLevels() {
    return [
      { icon: 'flag-outline', completed: false },
      { icon: 'time-outline', completed: false },
      { icon: 'help-circle-outline', completed: false },
      { icon: 'help-circle-outline', completed: false },
      { icon: 'trophy-outline', completed: false },
    ];
  }

  // Générer les étoiles pour l'affichage
  getStars(rating: number, maxRating: number = 5) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= maxRating; i++) {
      if (i <= fullStars) {
        stars.push('full');
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }

  goBack() {
    this.router.navigate(['/mes-cours']);
  }

  // enrollNow() {
  //   if (this.course) {
  //     console.log("S'inscrire au cours:", this.course.title);
  //     console.log('🔍 CoursDetailPage - Données avant navigation:', {
  //       courseId: this.course.id,
  //       courseTitle: this.course.title,
  //       courseImage: this.course.image,
  //     });

  //     this.router.navigate(['/subscription-plans'], {
  //       state: {
  //         course: this.course,
  //         courseId: this.course.id,
  //         courseTitle: this.course.title,
  //         courseImage: this.course.image || 'assets/images/default-course.jpg',
  //       },
  //     });
  //   }
  // }

  handleEnroll() {
    if (!this.course) return;

    // ✅ Si l'utilisateur a un accès via abonnement → auto-inscription
    if (this.hasSubscriptionAccess) {
      this.autoEnrollWithSubscription();
      return;
    }

    // 🔴 CAS 1 : COURS PAYANT → payer CE COURS
    if (this.course.price && this.course.price > 0) {
      const plan = {
        plan: 'COURSE',
        price: this.course.price,
        type: 'COURSE',
      };
      console.log('Inscription au cours payant:', this.course.id);

      this.router.navigate(['/payment-method'], {
        state: {
          plan,
          course: this.course,
          courseId: this.course.id,
          courseTitle: this.course.title,
          courseImage: this.course.image || 'assets/images/default-course.jpg',
        },
      });

      return;
    }

    // 🔵 CAS 2 : COURS GRATUIT → abonnement
    this.router.navigate(['/subscription-plans'], {
      state: {
        isPremiumSubscription: true,
        course: this.course,
        courseId: this.course.id,
        courseTitle: this.course.title,
        courseImage: this.course.image || 'assets/images/default-course.jpg',
      },
    });
  }

  async handleEnrollClick() {
    // ✅ Si accès abonnement actif → auto-inscription directe
    if (this.hasSubscriptionAccess && !this.isUserEnrolled) {
      this.autoEnrollWithSubscription();
      return;
    }

    if ((this.course?.price ?? 0) > 0) {
      // Cours payant
      this.handleEnroll();
    } else {
      const modal = await this.modalCtrl.create({
        component: PreminumModalComponent,
        cssClass: 'premium-modal',
        breakpoints: [0, 0.5, 0.8, 1],
        initialBreakpoint: 0.8,
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data?.subscribed) {
        // L'utilisateur a souscrit → refresh accès
        this.checkSubscriptionAccess();
        const toast = await this.toastCtrl.create({
          message: 'Bienvenue dans Premium ! 🌟',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
      }
    }
  }

  /**
   * Auto-inscription au cours pour les utilisateurs avec abonnement actif
   */
  async autoEnrollWithSubscription() {
    if (!this.course || !this.currentUser) return;

    try {
      const courseId = this.course.id;
      const userId = this.currentUser.uid;

      // Créer l'inscription dans Firestore
      const enrollmentRef = doc(this.firestore, 'enrollments', `${userId}_${courseId}`);
      await setDoc(enrollmentRef, {
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        source: 'subscription',
        subscriptionType: this.accessResult?.subscription?.type || 'CLASSE',
      });

      this.isUserEnrolled = true;
      this.enrollmentProgress = 0;
      this.currentEnrollment = { userId, courseId, progress: 0 };

      const toast = await this.toastCtrl.create({
        message: 'Cours activé via votre abonnement ! 🎉',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      console.log('✅ Auto-inscription via abonnement:', courseId);
    } catch (error) {
      console.error('Erreur auto-inscription:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erreur lors de l\'activation du cours',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  continueCourse() {
    if (this.course && this.currentEnrollment) {
      console.log('Continuer le cours:', this.course.title);
      console.log('Progression actuelle:', this.enrollmentProgress + '%');
      console.log('Continuer le cours:', this.course.id);
      const courseId = this.route.snapshot.paramMap.get('id');

      // Rediriger vers la page du cours/player
      this.router.navigate(['/course-video', courseId], {
        state: {
          enrollment: this.currentEnrollment,
          course: this.course,
          progress: this.enrollmentProgress,
        },
      });
    }
  }

  goToDetailsCours() {
    console.log('Aller aux détails du cours', this.course?.id);
    this.router.navigate(['/detail'], {
      queryParams: { courseId: this.course?.id },
    });
  }

  loadChapters(courseId: string) {
    this.chapterService.getChaptersByCourse(courseId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.chapters = response.data;
          console.log('Chapitres chargés :', this.chapters);

          this.chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
        } else {
          this.chapters = [];
        }
      },
      error: (err) => {
        console.error('Erreur chargement chapitres:', err);
        this.chapters = [];
      },
    });
  }
}
