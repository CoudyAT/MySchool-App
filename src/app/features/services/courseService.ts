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

// import { Injectable, inject } from '@angular/core';
// import { Observable, map } from 'rxjs';
// import { Course } from 'src/app/models/course.model';
// import { ApiService } from 'src/app/core/services/api.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class CourseService {
//   private readonly api = inject(ApiService);

//   // GET ALL COURSES (RAW → NORMALIZED)
//   getAllCourses(): Observable<Course[]> {
//     return this.api.get<any>('/courses').pipe(
//       map((res) => {
//         if (!res?.success || !Array.isArray(res.data)) return [];

//         return res.data.map((raw: any) => this.normalizeCourse(raw));
//       })
//     );
//   }

//   // Normalisation complète
//   private normalizeCourse(raw: any): Course {
//     return {
//       id: raw.id,
//       title: this.fixEncoding(raw.title),
//       description: this.fixEncoding(raw.description),
//       category: this.fixEncoding(raw.category),
//       type: raw.type,
//       level: this.normalizeLevel(raw.level),
//       duration: this.normalizeDuration(raw.duration),

//       sessions: raw.sessions ?? 0,
//       exercises: raw.exercises ?? 0,
//       image: raw.image,
//       isPublished: raw.isPublished,
//       certificateAvailable: raw.certificateAvailable,

//       price: raw.price ?? 0,
//       rating: raw.rating ?? 0,

//       chapters: raw.chapters ?? [],
//       chaptersIds: raw.chaptersIds ?? [],

//       createdAt: this.firebaseDate(raw.createdAt),
//       updatedAt: this.firebaseDate(raw.updatedAt),

//       enrolled: false,
//       maxRating: 5,
//       levels: [],
//     };
//   }

//   // Répare JSON mal encodé (� → é, è, ê…)
//   private fixEncoding(text: string): string {
//     if (!text) return '';

//     try {
//       return decodeURIComponent(escape(text));
//     } catch {
//       return text;
//     }
//   }

//   private normalizeLevel(
//     level: string
//   ): 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' {
//     const map: any = {
//       beginner: 'DEBUTANT',
//       Beginner: 'DEBUTANT',
//       DEBUTANT: 'DEBUTANT',
//       INTERMEDIAIRE: 'INTERMEDIAIRE',
//       INTERMEDIATE: 'INTERMEDIAIRE',
//       AVANCE: 'AVANCE',
//       advanced: 'AVANCE',
//     };

//     return map[level] ?? 'DEBUTANT';
//   }

//   private normalizeDuration(value: any): number {
//     if (typeof value === 'number') return value;
//     if (typeof value === 'string')
//       return parseInt(value.replace(/\D/g, ''), 10);
//     return 0;
//   }

//   private firebaseDate(ts: any): Date {
//     if (!ts?._seconds) return new Date();
//     return new Date(ts._seconds * 1000);
//   }
// }
