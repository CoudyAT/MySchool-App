import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { Chapter, Exercise, Lesson } from 'src/app/models/course.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ChapterService {
  private readonly api = inject(ApiService);

  // Récupérer tous les chapitres d'un cours avec leurs exercices et leçons
  getChaptersWithExercises(courseId: string): Observable<Chapter[]> {
    return this.api.get<Chapter[]>(`/chapters/course/${courseId}`);
  }

  // Récupérer tous les chapitres d'un cours
  getChaptersByCourse(courseId: string): Observable<Chapter[]> {
    return this.api.get<Chapter[]>(`/chapters/course/${courseId}`);
  }

  // Récupérer un chapitre par ID
  getChapterById(chapterId: string): Observable<Chapter> {
    return this.api.get<Chapter>(`/chapters/${chapterId}`);
  }

  // Récupérer un chapitre avec ses exercices
  getChapterWithExercises(
    chapterId: string
  ): Observable<{ chapter: Chapter; exercises: Exercise[] }> {
    return forkJoin({
      chapter: this.api.get<Chapter>(`/chapters/${chapterId}`),
      exercises: this.getExercisesByChapter(chapterId)
    });
  }

  // Récupérer tous les exercices d'un chapitre
  getExercisesByChapter(chapterId: string): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(`/exercises/chapter/${chapterId}`);
  }

  // Récupérer toutes les leçons d'un chapitre
  getLessonsByChapter(chapterId: string): Observable<Lesson[]> {
    return this.api.get<Lesson[]>(`/lessons/chapter/${chapterId}`);
  }

  // Créer un nouveau chapitre
  createChapter(chapter: Chapter): Observable<Chapter> {
    return this.api.post<Chapter>('/chapters', chapter);
  }

  // Mettre à jour un chapitre
  updateChapter(id: string, chapter: Partial<Chapter>): Observable<Chapter> {
    return this.api.put<Chapter>(`/chapters/${id}`, chapter);
  }

  // Supprimer un chapitre
  deleteChapter(id: string): Observable<void> {
    return this.api.delete<void>(`/chapters/${id}`);
  }

  // Récupérer tous les chapitres
  getAllChapters(): Observable<Chapter[]> {
    return this.api.get<Chapter[]>('/chapters');
  }

  // Transformer les exercices en leçons pour l'affichage
  private transformExercisesToLessons(exercises: Exercise[]): Lesson[] {
    return exercises.map(
      (exercise, index) =>
        ({
          id: exercise.id,
          title: exercise.title,
          type: 'exercise',
          duration: exercise.duration,
          isCompleted: false,
          order: index + 1,
          passed: false,
          score: 'À compléter',
          instructions: exercise.instructions,
          templateCode: exercise.templateCode,
          testCases: exercise.testCases,
          questions: exercise.questions,
        } as Lesson)
    );
  }
}

export { Lesson } from 'src/app/models/course.model';

