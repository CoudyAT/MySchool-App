import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
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

  chapters: Chapter[] = [];
  private courseSubscription: Subscription = new Subscription();
  private enrollmentSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private chapterService: ChapterService
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
    this.loadCourseDetails();
  }

  ngOnDestroy() {
    this.courseSubscription.unsubscribe();
    this.enrollmentSubscription.unsubscribe();
  }

  loadCourseDetails() {
    const courseId = this.route.snapshot.paramMap.get('id');

    if (courseId) {
      console.log('Loading course details for ID:', courseId);

      this.courseSubscription = this.courseService
        .getCourse(courseId)
        .subscribe({
          next: (courseData: any) => {
            if (courseData) {
              this.course = courseData;
              console.log('Course loaded:', this.course);

              // Charger les chapitres après avoir le cours
              this.loadChapters(courseId);

              // Vérifier si l'utilisateur est déjà inscrit à ce cours
              this.checkUserEnrollment(courseId);
            } else {
              console.error('Course not found');
              this.router.navigate(['/mes-cours']);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading course:', error);
            this.isLoading = false;
          },
        });
    } else {
      console.error('No course ID provided');
      this.router.navigate(['/mes-cours']);
    }
  }

  checkUserEnrollment(courseId: string) {
    this.enrollmentSubscription = this.enrollmentService
      .getUserEnrollments()
      .subscribe({
        next: (enrollments: any[]) => {
          console.log('Enrollments trouvés:', enrollments);

          // Vérifier si l'utilisateur est inscrit à ce cours
          const enrollment = enrollments.find(
            (enroll) => enroll.courseId === courseId
          );

          if (enrollment) {
            this.isUserEnrolled = true;
            this.currentEnrollment = enrollment;
            this.enrollmentProgress = enrollment.progress || 0;
            console.log(
              'Utilisateur déjà inscrit, progression:',
              this.enrollmentProgress + '%'
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
