import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.api.get<Instructor[]>('/instructors');
  }

  // Récupérer un instructeur par son ID avec ses cours
  getInstructorById(instructorId: string): Observable<Instructor> {
    return this.api.get<Instructor>(`/instructors/${instructorId}`);
  }

  // Récupérer les cours d'un instructeur
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/instructors/${instructorId}/courses`);
  }

  // Récupérer les étudiants d'un instructeur
  getInstructorStudents(instructorId: string): Observable<any[]> {
    return this.api.get<any[]>(`/instructors/${instructorId}/students`);
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
}

