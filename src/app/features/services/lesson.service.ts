import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Lesson } from 'src/app/models/lesson.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  private readonly api = inject(ApiService);

  /**
   * CRUD de base
   */

  // Créer une nouvelle leçon
  createLesson(lesson: Lesson, chapterId: string, courseId: string): Observable<Lesson> {
    return this.api.post<Lesson>('/lessons', { ...lesson, chapterId, courseId });
  }

  // Récupérer toutes les leçons
  getAllLessons(): Observable<Lesson[]> {
    return this.api.get<Lesson[]>('/lessons');
  }

  // Récupérer une leçon par ID
  getLessonById(lessonId: string): Observable<Lesson> {
    return this.api.get<Lesson>(`/lessons/${lessonId}`);
  }

  // Mettre à jour une leçon
  updateLesson(lessonId: string, lesson: Partial<Lesson>): Observable<Lesson> {
    return this.api.put<Lesson>(`/lessons/${lessonId}`, lesson);
  }

  // Supprimer une leçon
  deleteLesson(lessonId: string): Observable<void> {
    return this.api.delete<void>(`/lessons/${lessonId}`);
  }

  /**
   * Recherches spécifiques
   */

  // Récupérer les leçons d'un cours
  getLessonsByCourse(courseId: string): Observable<Lesson[]> {
    return this.api.get<Lesson[]>(`/lessons/course/${courseId}`);
  }

  // Récupérer les leçons d'un chapitre
  getLessonsByChapter(chapterId: string): Observable<Lesson[]> {
    return this.api.get<Lesson[]>(`/lessons/chapter/${chapterId}`);
  }

  /**
   * Méthodes utilitaires
   */

  // Obtenir la durée totale des leçons d'un chapitre
  async getChapterDuration(chapterId: string): Promise<number> {
    const lessons = await this.getLessonsByChapter(chapterId).toPromise();
    return lessons?.reduce((total, lesson) => total + (Number(lesson.duration) || 0), 0) || 0;
  }

  // Obtenir le nombre de leçons d'un chapitre
  async getChapterLessonCount(chapterId: string): Promise<number> {
    const lessons = await this.getLessonsByChapter(chapterId).toPromise();
    return lessons?.length || 0;
  }

  // Obtenir la leçon suivante dans un chapitre
  async getNextLesson(chapterId: string, currentOrder: number): Promise<Lesson | null> {
    const lessons = await this.getLessonsByChapter(chapterId).toPromise();
    const sortedLessons = lessons?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
    const currentIndex = sortedLessons.findIndex((l) => l.order === currentOrder);

    if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
      return sortedLessons[currentIndex + 1];
    }

    return null;
  }

  // Obtenir la leçon précédente dans un chapitre
  async getPreviousLesson(chapterId: string, currentOrder: number): Promise<Lesson | null> {
    const lessons = await this.getLessonsByChapter(chapterId).toPromise();
    const sortedLessons = lessons?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];
    const currentIndex = sortedLessons.findIndex((l) => l.order === currentOrder);

    if (currentIndex > 0) {
      return sortedLessons[currentIndex - 1];
    }

    return null;
  }
}
