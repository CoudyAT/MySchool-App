import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Exercise } from 'src/app/models/exercise.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private readonly api = inject(ApiService);

  /**
   * CRUD de base
   */

  // Créer un nouvel exercice
  createExercise(exercise: Exercise): Observable<Exercise> {
    return this.api.post<Exercise>('/exercises', exercise);
  }

  // Récupérer tous les exercices
  getAllExercises(): Observable<Exercise[]> {
    return this.api.get<Exercise[]>('/exercises');
  }

  // Récupérer un exercice par ID
  getExerciseById(exerciseId: string): Observable<Exercise> {
    return this.api.get<Exercise>(`/exercises/${exerciseId}`);
  }

  // Mettre à jour un exercice
  updateExercise(exerciseId: string, exercise: Partial<Exercise>): Observable<Exercise> {
    return this.api.put<Exercise>(`/exercises/${exerciseId}`, exercise);
  }

  // Supprimer un exercice
  deleteExercise(exerciseId: string): Observable<void> {
    return this.api.delete<void>(`/exercises/${exerciseId}`);
  }

  /**
   * Recherches spécifiques
   */

  // Récupérer les exercices d'un cours
  getExercisesByCourse(courseId: string): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(`/exercises/course/${courseId}`);
  }

  // Récupérer les exercices d'un chapitre
  getExercisesByChapter(chapterId: string): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(`/exercises/chapter/${chapterId}`);
  }

  // Récupérer les exercices par type
  getExercisesByType(type: 'quiz' | 'coding' | 'essay'): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(`/exercises/type/${type}`);
  }

  // Récupérer les exercices par difficulté
  getExercisesByDifficulty(difficulty: string): Observable<Exercise[]> {
    return this.api.get<Exercise[]>(`/exercises/difficulty/${difficulty}`);
  }

  /**
   * Méthodes utilitaires
   */

  // Obtenir le nombre total de points d'un chapitre
  async getChapterTotalPoints(chapterId: string): Promise<number> {
    const exercises = await this.getExercisesByChapter(chapterId).toPromise();
    return exercises?.reduce((total, ex) => total + (ex.points || 0), 0) || 0;
  }

  // Obtenir le nombre d'exercices d'un chapitre par type
  async getChapterExerciseCountByType(
    chapterId: string,
    type: 'quiz' | 'coding' | 'essay'
  ): Promise<number> {
    const exercises = await this.getExercisesByChapter(chapterId).toPromise();
    return exercises?.filter((ex) => ex.type === type).length || 0;
  }

  // Vérifier si un exercice est complété par un utilisateur
  // Note: Nécessiterait un endpoint backend dédié ou une collection "completedExercises"
  async isExerciseCompleted(exerciseId: string, userId: string): Promise<boolean> {
    // Cette méthode nécessite un endpoint backend supplémentaire
    // Pour l'instant, retourner false
    console.warn('isExerciseCompleted: Endpoint backend manquant');
    return false;
  }

  // Soumettre une réponse à un exercice
  // Note: Nécessiterait un endpoint backend dédié
  submitExerciseResponse(
    exerciseId: string,
    userId: string,
    response: any
  ): Observable<{ score: number; passed: boolean; feedback: string }> {
    // Cette méthode nécessite un endpoint backend supplémentaire
    console.warn('submitExerciseResponse: Endpoint backend manquant');

    // Retourner un Observable vide pour éviter les erreurs
    return new Observable((observer) => {
      observer.error('Endpoint backend manquant pour la soumission d\'exercice');
    });
  }
}
