// services/course.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Course } from 'src/app/models/course.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly api = inject(ApiService);

  // Récupérer tous les cours publiés
  getCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/courses/published');
  }

  // Récupérer tous les cours (publiés et non publiés)
  getAllCourses(): Observable<Course[]> {
    return this.api.get<Course[]>('/courses');
  }

  // Récupérer un cours par ID
  getCourse(id: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${id}`);
  }

  // Récupérer les cours par catégorie
  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/category/${category}`);
  }

  // Récupérer les cours par niveau
  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/level/${level}`);
  }

  // Récupérer toutes les catégories uniques
  getCategories(): Observable<string[]> {
    return this.getCourses().pipe(
      map((courses) => {
        const categories = courses.map((course) => course.category);
        return [...new Set(categories)]; // Supprimer les doublons
      })
    );
  }

  // Créer un nouveau cours
  createCourse(course: Course): Observable<Course> {
    return this.api.post<Course>('/courses', course);
  }

  // Mettre à jour un cours
  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.api.put<Course>(`/courses/${id}`, course);
  }

  // Supprimer un cours
  deleteCourse(id: string): Observable<void> {
    return this.api.delete<void>(`/courses/${id}`);
  }

  // Récupérer les étudiants inscrits à un cours
  getCourseStudents(courseId: string): Observable<any[]> {
    return this.api.get<any[]>(`/courses/${courseId}/students`);
  }
}
