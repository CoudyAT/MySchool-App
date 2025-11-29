import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Course } from 'src/app/models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly api = inject(ApiService);

  // Créer un nouveau cours via l'API REST
  async createCourse(courseData: Partial<Course>): Promise<string> {
    try {
      const newCourse = {
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
        certificateAvailable: false,
      };

      const response = await firstValueFrom(
        this.api.post<{ id: string; course: Course }>('/courses', newCourse)
      );

      console.log('✅ Cours créé avec ID:', response.id);
      return response.id;
    } catch (error) {
      console.error('❌ Erreur création cours:', error);
      throw error;
    }
  }

  // Créer un cours avec un ID spécifique
  async createCourseWithId(id: string, courseData: Partial<Course>): Promise<void> {
    try {
      const newCourse = {
        ...courseData,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firstValueFrom(
        this.api.post<Course>('/courses', newCourse)
      );

      console.log('✅ Cours créé avec ID spécifique:', id);
    } catch (error) {
      console.error('❌ Erreur création cours avec ID:', error);
      throw error;
    }
  }

  // Récupérer tous les cours
  getCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/courses');
  }

  // Récupérer un cours par ID
  getCourse(id: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${id}`);
  }

  // Mettre à jour un cours
  async updateCourse(id: string, courseData: Partial<Course>): Promise<void> {
    try {
      await firstValueFrom(
        this.api.put<Course>(`/courses/${id}`, {
          ...courseData,
          updatedAt: new Date(),
        })
      );
      console.log('✅ Cours mis à jour:', id);
    } catch (error) {
      console.error('❌ Erreur mise à jour cours:', error);
      throw error;
    }
  }

  // Supprimer un cours
  async deleteCourse(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.api.delete<void>(`/courses/${id}`)
      );
      console.log('✅ Cours supprimé:', id);
    } catch (error) {
      console.error('❌ Erreur suppression cours:', error);
      throw error;
    }
  }
}
