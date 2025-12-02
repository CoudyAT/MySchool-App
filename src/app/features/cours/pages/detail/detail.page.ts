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
  IonSpinner,
  IonBadge,
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
    IonBadge,
    IonSpinner,
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
  completedChapters: number[] = [];

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
    this.courseId = this.route.snapshot.queryParamMap.get('courseId') || '';
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.completedChapters =
        navigation.extras.state['completedChapters'] || [];
    }

    if (this.courseId) {
      this.loadChaptersWithExercises();
    } else {
      console.error('Aucun courseId');
      this.isLoading = false;
    }
  }

  loadChaptersWithExercises() {
    this.chapterService.getChaptersWithExercises(this.courseId).subscribe({
      next: (chapters) => {
        this.chapters = chapters;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      },
    });
  }

  openLesson(lesson: any, chapter: any, chapterIndex: number) {
    this.router.navigate(['/course-video', lesson.id], {
      state: {
        lesson,
        chapter,
        chapterIndex,
        completedChapters: this.completedChapters,
        courseId: this.courseId,
      },
    });
  }

  goBack() {
    this.location.back();
  }

  // Vérifier si un chapitre est terminé
  isChapterCompleted(index: number): boolean {
    return this.completedChapters.includes(index);
  }
}
