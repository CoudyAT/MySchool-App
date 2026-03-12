import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';

import {
  chevronBackOutline,
  languageOutline,
  downloadOutline,
  star,
  starHalf,
  playCircleOutline,
  layersOutline,
  timeOutline,
  personOutline,
  pencilOutline,
  bookOutline,
  shieldCheckmarkOutline,
  playOutline,
  arrowForwardOutline,
} from 'ionicons/icons';

import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';

import { ChapterService } from 'src/app/features/services/chapter.service';

// 🔥 Firestore
import {
  DocumentData,
  DocumentReference,
  Firestore,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { CourseService } from 'src/app/features/services/courseService';

@Component({
  selector: 'app-chapitre-player',
  templateUrl: './chapitre-player.page.html',
  styleUrls: ['./chapitre-player.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
  ],
})
export class ChapitrePlayerPage implements OnInit {
  course: any = {};
  enrollment: any;
  isLoading = true;
  private courseSubscription: Subscription = new Subscription();

  progress: number = 0;

  chapters: any[] = [];
  totalChapters = 0;

  currentChapterTitle = '';
  currentChapterIndex = 0;

  completedChapters: Set<number> = new Set();

  showVideo = false;

  constructor(
    private router: Router,
    // private location: Location,
    private route: ActivatedRoute,
    private chapterService: ChapterService,
    private firestore: Firestore
  ) {
    addIcons({
      chevronBackOutline,
      playCircleOutline,
      layersOutline,
      timeOutline,
      personOutline,
      pencilOutline,
      bookOutline,
      shieldCheckmarkOutline,
      playOutline,
      arrowForwardOutline,
      languageOutline,
      downloadOutline,
      star,
      starHalf,
    });
  }

  ngOnInit() {
    this.loadCourseDetails();
  }

  goBack() {
    this.router.navigate(['/mes-cours']);
  }

  async loadCourseDetails() {
    const courseId = this.route.snapshot.paramMap.get('id');
    console.log("courseId:", courseId);
    

    if (!courseId) {
      console.error('No course ID provided');
      this.router.navigate(['/mes-cours']);
      return;
    }

    console.log('Loading course details for ID:', courseId);

    this.courseSubscription = this.chapterService
      .getChapterById(courseId)
      .subscribe({
        next: async (courseData: any) => {
          if (!courseData) {
            console.error('Course not found');
            this.router.navigate(['/mes-cours']);
            return;
          }

          // 🔹 Données venant de l'API
          this.course = courseData.data;
          console.log('Course loaded from API:', this.course);
          // Charger autres données

          this.isLoading = false;
        },

        error: (error) => {
          console.error('Error loading course:', error);
          this.isLoading = false;
        },
      });
  }

  startCourse() {
    this.showVideo = true;
  }

  /** 🔥 Lorsque la vidéo se termine */
  finishChapter() {
    this.markChapterAsCompleted(this.currentChapterIndex);
  }

  /** 🔥 Marquer chapitre terminé + Firestore */
  async markChapterAsCompleted(chapterIndex: number) {
    if (!this.completedChapters.has(chapterIndex)) {
      this.completedChapters.add(chapterIndex);
      this.updateProgress();

      try {
        const ref = doc(this.firestore, 'enrollments', this.enrollment.id);

        await updateDoc(ref, {
          completedChapters: Array.from(this.completedChapters),
          progress: this.progress,
        });

        console.log('🔥 Progression mise à jour dans Firestore');
      } catch (err) {
        console.error('Erreur Firestore:', err);
      }
    }
  }

  /** 🔥 Mettre à jour la barre de progression */
  updateProgress() {
    if (this.totalChapters === 0) return;
    this.progress = Math.round(
      (this.completedChapters.size / this.totalChapters) * 100,
    );
  }

  /** Format date */
  getFormattedDate(timestamp: any): string {
    if (!timestamp) return '';
    try {
      let date: Date;
      if (timestamp.seconds) date = new Date(timestamp.seconds * 1000);
      else if (timestamp.toDate) date = timestamp.toDate();
      else date = new Date(timestamp);

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }

  // Méthode utilitaire pour obtenir la durée formatée
  getFormattedDuration(): void | string {
    if (this.course.duration) {
      return this.course.duration;
    }
  }

  // Méthode utilitaire pour obtenir le nombre de chapitres
  getChaptersCount(): number {
    return this.course.chapters?.length || this.course.exercises || 15;
  }
}




