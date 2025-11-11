// services/course.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Course } from 'src/app/models/course.model';


@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private firestore = inject(Firestore);

  // Récupérer tous les cours publiés
  getCourses(): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const q = query(
      coursesRef,
      where('isPublished', '==', true),
    //  orderBy('title')
    );

    return collectionData(q, { idField: 'id' }) as Observable<
      Course[]
    >;
  }

  // Récupérer un cours par ID
  getCourse(id: string): Observable<Course> {
    const courseRef = doc(this.firestore, `courses/${id}`);
    return docData(courseRef, { idField: 'id' }) as Observable<Course>;
  }

  // Récupérer les cours par catégorie
  getCoursesByCategory(category: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const q = query(
      coursesRef,
      where('category', '==', category),
      where('isPublished', '==', true),
      orderBy('title')
    );

    return collectionData(q, { idField: 'id' }) as Observable<
      Course[]
    >;
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
}
