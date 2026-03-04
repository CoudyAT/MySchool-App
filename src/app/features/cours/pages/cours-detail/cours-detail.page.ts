import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { PreminumModalComponent } from 'src/app/features/component/preminum-modal/preminum-modal.component';
import { ToastController, AlertController } from '@ionic/angular';

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
import { EnrollmentService } from 'src/app/features/services/enrollmentService'; // Ajouter cet import
import { ChapterService } from 'src/app/features/services/chapter.service';
import { DesktopHeaderComponent } from 'src/app/shared/components/desktop-header/desktop-header.component';
import { InstructorService } from 'src/app/features/services/instructorService';

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
  instructor: any = null;

  chapters: Chapter[] = [];
  private courseSubscription: Subscription = new Subscription();
  private enrollmentSubscription: Subscription = new Subscription();

  // Données utilisateur pour l'abonnement
  userNiveauScolaire: string = '';
  userClasse: string = '';

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
    private alertCtrl: AlertController,
    private instructorService: InstructorService,
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
    this.loadUserData();
    this.loadCourseDetails();
  }



  loadUserData() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (localUser) {
      this.userClasse = localUser.classe || '';
      this.userNiveauScolaire = localUser.niveauScolaire || '';
    }
  }

  handleDocumentAccess(doc: any) {
    if (!this.isUserEnrolled) {
      this.openSubscription(); // popup abonnement
      return;
    }

    if (doc?.url) {
      window.open(doc.url, '_blank');
    }
  }

  get subscriptionButtonText(): string {
    if (this.userNiveauScolaire === 'ELEMENTAIRE' && this.userClasse) {
      return `Souscrire à l'abonnement ${this.userClasse}`;
    }
    if (
      ['MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'].includes(
        this.userNiveauScolaire,
      ) &&
      this.userClasse
    ) {
      return `Souscrire à l'abonnement ${this.userClasse}`;
    }
    return "Souscrire à l'abonnement";
  }

  openSubscription() {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Cas ÉLÉMENTAIRE → redirection directe vers payment-method (abonnement classe)
    if (localUser?.niveauScolaire === 'ELEMENTAIRE') {
      this.router.navigate(['/payment-method'], {
        state: {
          isPremiumFlow: true,
          method: 'premium',
          plan: {
            type: 'ANNUAL',
            name: `Abonnement ${localUser.classe}`,
            price: 5000,
            currency: 'XOF',
          },
          isClasseSubscription: true,
          classe: localUser.classe,
          niveauScolaire: localUser.niveauScolaire,
        },
      });
      return;
    }

    // Autres niveaux → sélection des matières
    this.router.navigate(['/premium-course-selection'], {
      state: {
        isPremiumFlow: true,
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
        // try {
        //   const courseRef = doc(this.firestore, 'courses', courseId);
        //   const snap = await getDoc(courseRef);

        //   if (snap.exists()) {
        //     const firestoreCourse: any = snap.data();

        //     if (this.course) {
        //       this.course.instructorId = firestoreCourse.instructorId || null;

        //       this.course.instructorName =
        //         firestoreCourse.instructorName || null;
        //     }
        //   }
        // } catch (err) {
        //   console.error('Erreur lecture Firestore:', err);
        // }
        this.loadInstructorData();
        // Charger autres données
        this.loadChapters(courseId);
        this.checkUserEnrollment(courseId);

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading = false;
      },
    });
  }

  async loadInstructorData() {
    this.isLoading = true;

    const instructorId = this.course?.instructorId;
    console.log('instructorId', this.course);
    
    if (!instructorId) {
      // Pas d'instructeur associé au cours : arrêter et enlever le loader
      this.isLoading = false;
      return;
    }

    this.instructorService
      .getInstructorById(instructorId)
      .subscribe({
        next: async (instructor) => {
          this.instructor = instructor;
          console.log("jjj", this.instructor);
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement instructeur :', error);
          this.isLoading = false;
        },
      });
  }

  checkUserEnrollment(courseId: string) {
    // D'abord vérifier si l'utilisateur a un abonnement actif
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.id || currentUser._id;

    // Vérifier si l'utilisateur a un abonnement actif dans le localStorage
    if (currentUser.hasActiveSubscription) {
      console.log('✅ Utilisateur a un abonnement actif (localStorage)');
      this.isUserEnrolled = true;
      return;
    }

    // Vérifier l'abonnement via l'API
    if (userId) {
      console.log('je suis ici');

      this.enrollmentService.checkCourseAccess(userId).subscribe({
        next: (response) => {
          if (response.success && response.hasAccess) {
            console.log('✅ Utilisateur a accès via abonnement');
            this.isUserEnrolled = true;

            // Mettre à jour le localStorage
            currentUser.hasActiveSubscription = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            return;
          }

          // Sinon vérifier les enrollments individuels
          this.checkIndividualEnrollment(courseId);
        },
        error: () => {
          // En cas d'erreur API, vérifier les enrollments
          this.checkIndividualEnrollment(courseId);
        },
      });
    } else {
      this.checkIndividualEnrollment(courseId);
    }
  }

  private checkIndividualEnrollment(courseId: string) {
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
        // L'utilisateur a souscrit
        const toast = await this.toastCtrl.create({
          message: 'Bienvenue dans Premium ! 🌟',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
      }
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

  /**
   * Ouvrir un chapitre :
   * - Si inscrit → naviguer vers le contenu du chapitre
   * - Si non inscrit → proposer l'abonnement selon le niveau du cours
   */
  async openChapter(chapter: Chapter, index: number) {
    if (this.isUserEnrolled) {
      // L'utilisateur est abonné → ouvrir le contenu
      const courseId = this.route.snapshot.paramMap.get('id');
      this.router.navigate(['/course-video', courseId], {
        state: {
          enrollment: this.currentEnrollment,
          course: this.course,
          progress: this.enrollmentProgress,
          chapterIndex: index,
          chapter: chapter,
        },
      });
      return;
    }

    // Non inscrit → demander l'abonnement
    const niveau = this.course?.niveauScolaire || '';
    const classe = this.course?.classe || '';

    // Niveaux qui utilisent l'abonnement par matière
    const niveauxMatiere = ['MOYEN', 'SECONDAIRE', 'UNIVERSITAIRE'];

    if (niveauxMatiere.includes(niveau.toUpperCase())) {
      // MOYEN / SECONDAIRE / UNIVERSITAIRE → rediriger vers la page courses pour sélectionner les matières
      const alert = await this.alertCtrl.create({
        header: 'Abonnement requis',
        message: `Pour accéder à ce chapitre, vous devez vous abonner. Choisissez 3 matières pour votre niveau ${niveau}.`,
        buttons: [
          { text: 'Annuler', role: 'cancel' },
          {
            text: 'Choisir mes matières',
            handler: () => {
              this.router.navigate(['/courses'], {
                state: { openMatiereSelection: true, niveau, classe },
              });
            },
          },
        ],
      });
      await alert.present();
    } else if (niveau.toUpperCase() === 'ELEMENTAIRE') {
      // ELEMENTAIRE → abonnement par classe
      const alert = await this.alertCtrl.create({
        header: 'Abonnement requis',
        message: `Pour accéder à ce chapitre, vous devez vous abonner à la classe ${classe || 'de ce cours'}.`,
        buttons: [
          { text: 'Annuler', role: 'cancel' },
          {
            text: "S'abonner",
            handler: () => {
              this.router.navigate(['/courses'], {
                state: { openClasseSubscription: true, classe },
              });
            },
          },
        ],
      });
      await alert.present();
    } else {
      // Autre cas (cours payant ou premium) → modal premium
      const modal = await this.modalCtrl.create({
        component: PreminumModalComponent,
        cssClass: 'premium-modal',
        breakpoints: [0, 0.5, 0.8, 1],
        initialBreakpoint: 0.8,
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data?.subscribed) {
        const toast = await this.toastCtrl.create({
          message: 'Bienvenue dans Premium ! 🌟',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
      }
    }
  }
}
