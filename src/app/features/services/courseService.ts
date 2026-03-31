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
    return this.api
      .get<any>('/courses/published')
      .pipe(map((res) => res?.data ?? []));
  }

  // Récupérer tous les cours (publiés et non publiés)
  getAllCourses(): Observable<Course[]> {
    return this.api.get<any>('/courses').pipe(map((res) => res?.data ?? []));
  }

  // Récupérer un cours par ID
  getCourse(id: string): Observable<Course> {
    return this.api
      .get<Course>(`/courses/${id}`)
      .pipe(map((res) => res?.data ?? []));
  }

  getPaginatedCourses(page: number = 1, limit: number = 100): Observable<any> {
    return this.api.get<any>(`/courses?page=${page}&limit=${limit}`)
      .pipe(
        map((res) => ({
          courses: res?.data ?? [],           
          total: res?.total ?? 0,             
          totalPages: res?.totalPages ?? 1,
          hasMore: res?.hasMore ?? true      
        }))
      );
  }

  // Récupérer les cours par catégorie
  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/category/${category}`);
  }

  // Récupérer les cours par niveau scolaire (ELEMENTAIRE, MOYEN, SECONDAIRE, UNIVERSITAIRE)
  getCoursesByNiveau(niveau: string): Observable<Course[]> {
    return this.api
      .get<any>(`/courses/niveau/${niveau}`)
      .pipe(map((res) => res?.data ?? []));
  }

  // Récupérer les cours par classe précise
  getCoursesByClasse(classe: string): Observable<Course[]> {
    return this.api
      .get<any>(`/courses/classe/${encodeURIComponent(classe)}`)
      .pipe(map((res) => res?.data ?? []));
  }

  // Récupérer les cours par niveau
  getCoursesByLevel(level: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/level/${level}`);
  }

  // Récupérer les cours par type
  getCoursesByType(type: string): Observable<Course[]> {
    return this.api.get<Course[]>(`/courses/type/${type}`);
  }

  // Récupérer les cours par niveau scolaire
  getCoursesByNiveauScolaire(niveauScolaire: string): Observable<any> {
    console.log('\n🌐 === API CALL: getCoursesByNiveauScolaire ===');
    console.log('📍 URL:', `/courses/niveau/${niveauScolaire}`);
    console.log('📊 Paramètre:', niveauScolaire);

    return this.api.get<any>(`/courses/niveau/${niveauScolaire}`).pipe(
      map((response) => {
        console.log('✅ Réponse de l\'API getCoursesByNiveauScolaire:');
        console.log('   - success:', response?.success);
        console.log('   - Nombre de cours:', response?.data?.length || 0);
        if (response?.data?.length > 0) {
          console.log('   - Premier cours:', response.data[0]);
        }
        console.log('🌐 === FIN API CALL ===\n');
        return response;
      })
    );
  }

  // Récupérer les matières par niveau scolaire
  getMatieresByNiveau(niveau: string): Observable<any> {
    console.log('\n🌐 === API CALL: getMatieresByNiveau ===');
    console.log('📍 URL:', `/matieres/niveau/${niveau}`);
    console.log('📊 Paramètre:', niveau);

    return this.api.get<any>(`/matieres/niveau/${niveau}`).pipe(
      map((response) => {
        console.log('✅ Réponse de l\'API getMatieresByNiveau:');
        console.log('   - success:', response?.success);
        console.log('   - Nombre de matières:', response?.data?.length || 0);
        console.log('🌐 === FIN API CALL ===\n');
        return response;
      })
    );
  }

  // Récupérer les matières par classe précise
  getMatieresByClasse(classe: string): Observable<any> {
    console.log('\n🌐 === API CALL: getMatieresByClasse ===');
    console.log('📍 URL:', `/matieres/classe/${classe}`);
    console.log('📊 Paramètre:', classe);

    return this.api.get<any>(`/matieres/classe/${classe}`).pipe(
      map((response) => {
        console.log('✅ Réponse de l\'API getMatieresByClasse:');
        console.log('   - success:', response?.success);
        console.log('   - Nombre de matières:', response?.data?.length || 0);
        console.log('🌐 === FIN API CALL ===\n');
        return response;
      })
    );
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

  // Publier un cours
  publishCourse(id: string): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}/publish`, {});
  }

  // Dépublier un cours
  unpublishCourse(id: string): Observable<Course> {
    return this.api.patch<Course>(`/courses/${id}/unpublish`, {});
  }

  // Récupérer les inscriptions (enrollments) d'un cours
  // Note: Utilise l'endpoint /enrollments/course/{courseId}
  getCourseEnrollments(courseId: string): Observable<any[]> {
    return this.api.get<any[]>(`/enrollments/course/${courseId}`);
  }
}
