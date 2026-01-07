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
  IonFooter,
  IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';
import { addIcons } from 'ionicons';
import {
  cardOutline,
  chevronBackOutline,
  checkmarkCircle,
  ellipseOutline,
  playCircle,
  checkmark,
} from 'ionicons/icons';
import { Chapter } from 'src/app/models/course.model';
import {
  ChapterService,
  Lesson,
} from 'src/app/features/services/chapter.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    // IonFooter,
    IonCardContent,
    IonCard,
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    BottomMenuComponent,
  ],
})
export class DetailPage implements OnInit {
  courseId: string = '';
  chapters: Chapter[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chapterService: ChapterService,
    private location: Location
  ) {
    addIcons({
      chevronBackOutline,
      checkmark,
      playCircle,
      cardOutline,
      checkmarkCircle,
      ellipseOutline,
    });
  }

  ngOnInit() {
    // Récupérer le courseId depuis les queryParams
    this.courseId = this.route.snapshot.queryParamMap.get('courseId') || '';
    console.log('Course ID:', this.courseId);

    if (this.courseId) {
      this.loadChaptersWithExercises();
    } else {
      console.error('Aucun courseId trouvé dans les queryParams');
      this.isLoading = false;
    }
  }

  loadChaptersWithExercises() {
    this.isLoading = true;
    this.chapterService.getChaptersWithExercises(this.courseId).subscribe({
      next: (response: any) => {
        this.chapters = response.data || [];
        this.isLoading = false;

        console.log('Chapitres chargés:', this.chapters);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.location.back();
  }

  openLesson(lesson: Lesson) {
    console.log('Opening lesson:', lesson);

    // Navigation vers la page d'exercice
    this.router.navigate(['/exercise', lesson.id], {
      state: {
        lesson: lesson,
        courseId: this.courseId,
      },
    });
  }

  getLessonTypeText(type: string): string {
    const types: { [key: string]: string } = {
      video: 'Vidéo',
      text: 'Texte',
      exercise: 'Exercices',
      quiz: 'Quiz',
    };
    return types[type] || type;
  }
}
