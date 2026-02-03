import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';
import { PreminumModalComponent } from 'src/app/features/component/preminum-modal/preminum-modal.component';
import { ToastController, IonicModule } from '@ionic/angular';

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
  selector: 'app-video-detail',
  templateUrl: './video-detail.page.html',
  styleUrls: ['./video-detail.page.scss'],
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
export class VideoDetailPage implements OnInit {
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
    private chapterService: ChapterService,
    private firestore: Firestore,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
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
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/video-page']);
  }

  goToVideo() {
    this.router.navigate(['/video-player', this.course?.id]);
  }

  getSimpleDate(timestamp: any): string {
    if (!timestamp) return '';

    try {
      const seconds = timestamp._seconds || timestamp.seconds || 0;
      const date = new Date(seconds * 1000);

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return '';
    }
  }
}
