import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Instructor } from 'src/app/models/instructor.model';
import { Course } from 'src/app/models/course.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  private readonly api = inject(ApiService);

  // Récupérer tous les instructeurs
  getInstructors(): Observable<Instructor[]> {
    return this.api
      .get<any>('/instructors')
      .pipe(map((res) => res?.data ?? []));
  }

  // Récupérer un instructeur par son ID
  getInstructorById(instructorId: string): Observable<Instructor> {
    return this.api
      .get<any>(`/instructors/${instructorId}`)
      .pipe(map((res) => res?.data ?? []));
  }

  // Récupérer les cours d'un instructeur
  // Note: L'API n'a pas d'endpoint dédié, on filtre côté client
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    return this.api.get<Course[]>('/courses').pipe(
      map((courses: Course[]) =>
        courses.filter((course: any) => course.instructorId === instructorId)
      )
    );
  }

  // Récupérer les étudiants d'un instructeur via les enrollments
  // Note: L'API n'a pas d'endpoint dédié
  getInstructorStudents(instructorId: string): Observable<any[]> {
    // Cette méthode nécessiterait de récupérer tous les enrollments
    // puis filtrer par instructorId via les cours
    // Pour l'instant, retourner un tableau vide
    return this.api.get<any[]>('/enrollments').pipe(
      map((enrollments: any[]) => {
        // Filtrer les enrollments par cours de l'instructeur
        // Cette logique nécessite les cours de l'instructeur
        return [];
      })
    );
  }

  // Créer un nouveau instructeur
  createInstructor(instructor: Instructor): Observable<Instructor> {
    return this.api.post<Instructor>('/instructors', instructor);
  }

  // Mettre à jour un instructeur
  updateInstructor(id: string, instructor: Partial<Instructor>): Observable<Instructor> {
    return this.api.put<Instructor>(`/instructors/${id}`, instructor);
  }

  // Supprimer un instructeur
  deleteInstructor(id: string): Observable<void> {
    return this.api.delete<void>(`/instructors/${id}`);
  }

  // Récupérer les instructeurs d'un cours
  getInstructorsByCourse(courseId: string): Observable<Instructor[]> {
    return this.api.get<Instructor[]>(`/instructors/course/${courseId}`);
  }

  // Récupérer les instructeurs par expertise
  getInstructorsByExpertise(expertiseId: string): Observable<Instructor[]> {
    return this.api.get<Instructor[]>(`/instructors/expertise/${expertiseId}`);
  }
}

