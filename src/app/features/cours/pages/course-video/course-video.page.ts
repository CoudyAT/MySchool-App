// import { Component, OnInit } from '@angular/core';
// import { CommonModule, Location } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import {
//   IonContent,
//   IonHeader,
//   IonTitle,
//   IonToolbar,
//   IonIcon,
//   IonButtons,
//   IonButton,
//   IonCard,
//   IonCardContent,
// } from '@ionic/angular/standalone';
// import {
//   chevronBackOutline,
//   languageOutline,
//   playCircle,
//   star,
//   starHalf,
//   downloadOutline,
// } from 'ionicons/icons';
// import { Router, ActivatedRoute } from '@angular/router'; // Ajoutez ActivatedRoute
// import { addIcons } from 'ionicons';

// @Component({
//   selector: 'app-course-video',
//   templateUrl: './course-video.page.html',
//   styleUrls: ['./course-video.page.scss'],
//   imports: [
//     IonCardContent,
//     IonButton,
//     IonButtons,
//     IonIcon,
//     IonContent,
//     IonHeader,
//     IonTitle,
//     IonToolbar,
//     CommonModule,
//     FormsModule,
//     IonCard,
//   ],
// })
// export class CourseVideoPage implements OnInit {
//   course: any = {}; // Initialiser comme objet vide
//   enrollment: any;
//   progress: number = 0;

//   constructor(
//     private router: Router,
//     private location: Location,
//     private route: ActivatedRoute // Injectez ActivatedRoute
//   ) {
//     addIcons({
//       chevronBackOutline,
//       languageOutline,
//       downloadOutline,
//       star,
//       starHalf,
//     });
//   }

//   ngOnInit() {
//     // Récupérer les données passées depuis cours-detail
//     const navigation = this.router.getCurrentNavigation();
//     if (navigation?.extras?.state) {
//       this.course = navigation.extras.state['course'] || {};
//       this.enrollment = navigation.extras.state['enrollment'];
//       this.progress = navigation.extras.state['progress'] || 0;

//       console.log('📋 Données du cours reçues:', this.course);
//       console.log('📊 Progression:', this.progress + '%');
//       console.log('📝 Enrollment:', this.enrollment);
//     }

//     // Récupérer l'ID du cours depuis l'URL
//     const courseId = this.route.snapshot.paramMap.get('id');
//     console.log('🎬 CourseVideoPage - ID du cours:', courseId);

//     // Si pas de données reçues, charger depuis le service
//     if (!this.course.title) {
//       this.loadCourseData(courseId);
//     }
//   }

//   // Méthode de fallback si pas de données reçues
//   private loadCourseData(courseId: string | null) {
//     if (!courseId) return;

//     // Ici vous pouvez appeler un service pour charger les données du cours
//     console.log('🔄 Chargement des données du cours depuis le service...');
//     // this.courseService.getCourse(courseId).subscribe(course => {
//     //   this.course = course;
//     // });
//   }

//   goBack() {
//     //this.location.back(); 
//     this.router.navigate(['/mes-cours']);
//   }

//   startCourse() {
//     console.log('🎬 Démarrage du cours:', this.course.title);
//     // Logique pour démarrer la vidéo
//   }

//   // Méthode utilitaire pour obtenir la durée formatée
//   getFormattedDuration(): string {
//     if (this.course.duration) {
//       return this.course.duration;
//     }
//     return this.course.sessions ? `${this.course.sessions} min` : '25 min';
//   }

//   // Méthode utilitaire pour obtenir le nombre de chapitres
//   getChaptersCount(): number {
//     return this.course.chapters?.length || this.course.exercises || 15;
//   }

//   getFormattedDate(timestamp: any): string {
//     if (!timestamp) return '';

//     try {
//       let date: Date;

//       // Gérer le timestamp Firestore
//       if (timestamp.seconds) {
//         date = new Date(timestamp.seconds * 1000);
//       } else if (timestamp.toDate) {
//         date = timestamp.toDate();
//       } else {
//         date = new Date(timestamp);
//       }

//       return date.toLocaleDateString('fr-FR', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric',
//       });
//     } catch (error) {
//       console.error('Erreur formatage date:', error);
//       return '';
//     }
//   }

//   // Méthode pour générer les étoiles
//   // getStars(rating: number, maxRating: number = 5): string[] {
//   //   const stars = [];
//   //   const fullStars = Math.floor(rating);
//   //   const hasHalfStar = rating % 1 >= 0.5;

//   //   for (let i = 1; i <= maxRating; i++) {
//   //     if (i <= fullStars) {
//   //       stars.push('full');
//   //     } else if (i === fullStars + 1 && hasHalfStar) {
//   //       stars.push('half');
//   //     } else {
//   //       stars.push('empty');
//   //     }
//   //   }
//   //   return stars;
//   // }
// }

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
} from 'ionicons/icons';

import { Router, ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';

import { ChapterService } from 'src/app/features/services/chapter.service';

// 🔥 Firestore
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-course-video',
  templateUrl: './course-video.page.html',
  styleUrls: ['./course-video.page.scss'],
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
export class CourseVideoPage implements OnInit {
  course: any = {};
  enrollment: any;

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
      languageOutline,
      downloadOutline,
      star,
      starHalf,
    });
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();

    if (nav?.extras?.state) {
      this.course =
        nav.extras.state['lesson'] || nav.extras.state['course'] || {};
      this.enrollment = nav.extras.state['enrollment'];

      const chapter = nav.extras.state['chapter'];
      this.currentChapterIndex = nav.extras.state['chapterIndex'] ?? 0;

      if (chapter) {
        this.currentChapterTitle = chapter.title;
      }

      // 🔥 récupérer les chapitres complétés depuis openLesson()
      if (nav.extras.state['completedChapters']) {
        this.completedChapters = new Set(nav.extras.state['completedChapters']);
      }
    }

    // Charger les chapitres
    this.chapterService
      .getChaptersWithExercises(this.course.courseId || this.course.id)
      .subscribe((chaps) => {
        this.chapters = chaps;
        this.totalChapters = chaps.length;

        if (!this.currentChapterTitle && chaps.length > 0) {
          this.currentChapterTitle = chaps[this.currentChapterIndex].title;
        }

        this.updateProgress();
      });

    // Fallback vidéo
    // this.course.session =
    //   this.course.session ||
    //   'https://firebasestorage.googleapis.com/v0/b/myschool-f862b.firebasestorage.app/o/VIDEOS%2FV1%20Presentation%20et%20programme%20IDK.mp4?alt=media&token=1acb57c8-0325-4c06-9710-b88cc85aa13a';
  }

  goBack() {
    this.router.navigate(['/mes-cours']);
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
      (this.completedChapters.size / this.totalChapters) * 100
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

