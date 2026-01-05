import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from "@ionic/angular";
import { Chapter, Course } from 'src/app/models/course.model';
import { CourseService } from 'src/app/features/services/courseService';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { ChapterService } from 'src/app/features/services/chapter.service';
import { LessonService } from 'src/app/features/services/lesson.service';
import { ExerciseService } from 'src/app/features/services/exercise.service';

@Component({
  selector: 'app-detail-cours',
  templateUrl: './detail-cours.page.html',
  styleUrls: ['./detail-cours.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
})
export class DetailCoursPage implements OnInit {
  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private chapterService: ChapterService,
    private lessonService: LessonService,
    private exerciseService: ExerciseService,
    private router: Router) { }
  course!: Course;
  courseId: string = '';
  isAddChapterModalOpen = false;
  isAddLessonModalOpen = false;
  isAddExerciseModalOpen = false;
  isSubmitting = false;
  currentChapterId: string = '';

  // Nouveau chapitre
  newChapter: any = {
    title: '',
    order: 1,
    description: '',
    duration: '',
    lessonsIds: [],
    exercisesIds: [],
  };

  newLesson: any = {
    title: '',
    description: '',
    duration: '',
    order: 1,
    contentUrl: '',
    type: 'video'
  };

  newExercise: any = {
    title: '',
    instructions: '',
    duration: '',
    difficulty: 'moyen',
    questions: []
  };
  isLoading: boolean = false;


  selectedLessonId: string = '';
  selectedExerciseId: string = '';


  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')!;

    if (!this.courseId) {
      console.error('ID du cours manquant');
      return;
    }

    this.courseService.getCourse(this.courseId).subscribe({
      next: (response: Course) => {
        this.course = response.data;
        console.log('Détails du cours chargés:', this.course);
        this.loadChapters();
      }
    });

  }

  loadChapters() {
    this.chapterService.getChaptersByCourse(this.courseId).subscribe({
      next: (chapters: any) => {
        this.course.chapters = chapters.data;
      }
    });
  }

  togglePublish() {
    if (!this.course) {
      console.error('Aucun cours chargé');
      return;
    }
    const updatedStatus = !this.course.isPublished;
    this.courseService.updateCourse(this.course.id, { isPublished: updatedStatus }).subscribe({
      next: async (response) => {
        this.course.isPublished = updatedStatus;
        console.log(`Le cours a été ${updatedStatus ? 'publié' : 'dépublié'} avec succès.`);
        await this.toastCtrl.create({
          message: `Le cours a été ${updatedStatus ? 'publié' : 'dépublié'} avec succès.`,
          duration: 2000,
          color: 'success'
        }).then(toast => toast.present());

      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut de publication:', error);
      }
    });
  }

  openAddChapterModal() {
    this.newChapter = {
      title: '',
      order: (this.course.chapters?.length || 0) + 1,
      description: '',
      duration: '',
      lessonsIds: [],
      exercisesIds: []
    };
    this.selectedLessonId = '';
    this.selectedExerciseId = '';
    this.isAddChapterModalOpen = true;
  }
  availableLessons: any[] = [];
  availableExercises: any[] = [];

  closeAddChapterModal() {
    this.isAddChapterModalOpen = false;
  }

  openAddLessonModal(chapterId: string) {
    this.currentChapterId = chapterId;
    this.newLesson = {
      title: '',
      description: '',
      duration: '',
      order: 1, // tu peux charger le prochain ordre si tu veux
      contentUrl: '',
      type: 'video'
    };
    this.isAddLessonModalOpen = true;
  }

  openAddExerciseModal(chapterId: string) {
    this.currentChapterId = chapterId;
    this.newExercise = {
      title: '',
      instructions: '',
      duration: '',
      difficulty: 'moyen',
      questions: ''
    };
    this.isAddExerciseModalOpen = true;
  }

  closeAddLessonModal() {
    this.isAddLessonModalOpen = false;
  }

  closeAddExerciseModal() {
    this.isAddExerciseModalOpen = false;
  }
  createLesson() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const lessonData: any = {
      title: this.newLesson.title,
      description: this.newLesson.description || '',
      duration: this.newLesson.duration || '',
      order: this.newLesson.order || 1,
      contentUrl: this.newLesson.contentUrl || '',
      type: this.newLesson.type || 'video'
    };

    this.lessonService.createLesson(lessonData, this.currentChapterId, this.courseId)
      .subscribe({
        next: () => {
          this.chapterService.updateChapter(this.currentChapterId, { lessonsIds: lessonData }).subscribe({
            next: () => {
            },
            error: (err) => {
              console.error('Erreur mise à jour chapitre après ajout leçon', err);
            }
          });
          this.presentToast('Leçon ajoutée avec succès !', 'success');
          this.closeAddLessonModal();
          this.loadChapters();
        },
        error: (err) => {
          console.error('Erreur lors de la création de la leçon', err);
          this.presentToast('Erreur lors de la création de la leçon', 'danger');
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  createExercise() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const exerciseData: any = {
      title: this.newExercise.title,
      instructions: this.newExercise.instructions || '',
      duration: this.newExercise.duration || '',
      difficulty: this.newExercise.difficulty || 'moyen',
      questions: this.newExercise.questions || []
    };

    this.exerciseService.createExercise(exerciseData, this.currentChapterId, this.courseId)
      .subscribe({
        next: () => {
          this.presentToast('Exercice ajouté avec succès !', 'success');
          this.chapterService.updateChapter(this.currentChapterId, { exercisesIds: exerciseData }).subscribe({
            next: () => {
            },
            error: (err) => {
              console.error('Erreur mise à jour chapitre après ajout exercice', err);
            }
          });
          this.closeAddExerciseModal();
          this.loadChapters();
        },
        error: (err) => {
          console.error('Erreur lors de la création de l\'exercice', err);
          this.presentToast('Erreur lors de la création de l\'exercice', 'danger');
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  createChapter() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    this.chapterService.createChapter(this.newChapter, this.courseId).subscribe({
      next: (createdChapter) => {
        // Ajouter au cours ou recharge
        this.course.chapters.push(createdChapter);
        this.courseService.updateCourse(this.course.id, { chapters: this.course.chapters }).subscribe();
        this.loadChapters();
        this.closeAddChapterModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Erreur création chapitre', err);
        this.isSubmitting = false;
      }
    });
  }

  deleteChapter(chapterId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      return;
    }
    this.chapterService.deleteChapter(chapterId).subscribe({
      next: () => {
        this.course.chapters = this.course.chapters.filter(ch => ch.id !== chapterId);
        this.courseService.updateCourse(this.course.id, { chapters: this.course.chapters }).subscribe();
      },
      error: (err) => {
        console.error('Erreur suppression chapitre', err);
      }
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }

  editCourse(course: Course) {
    this.router.navigate(['/admin-login/edit-cours', course.id]);

  }
}
