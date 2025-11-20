import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { Instructor } from 'src/app/models/instructor.model';
import { Course } from 'src/app/models/course.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  constructor(private firestore: Firestore) {}

  getInstructors(): Observable<Instructor[]> {
    const instructorsRef = collection(this.firestore, 'instructors');
    return collectionData(instructorsRef, { idField: 'id' }) as Observable<
      Instructor[]
    >;
  }

  // NOUVELLE MÉTHODE: Récupérer un instructeur par son ID
  getInstructorById(instructorId: string): Observable<Instructor> {
    const instructorDocRef = doc(this.firestore, 'instructors', instructorId);

    return from(getDoc(instructorDocRef)).pipe(
      switchMap((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          console.log('📊 Données instructeur:', data);

          // Récupérer les détails des cours
          const coursesIds = data['coursesIds'] || [];
          const expertiseIds = data['expertiseIds'] || [];

          return this.getCoursesDetails(coursesIds).pipe(
            map(
              (courses) =>
                ({
                  id: docSnapshot.id,
                  name: data['name'],
                  title: data['title'],
                  bio: data['bio'],
                  image: data['image'] || 'assets/slide1.svg',
                  backgroundColor: data['backgroundColor'] || '#0066ff',
                  rating: data['rating'] || 4.5,
                  totalStudents: data['totalStudents'] || 0,
                  totalCourses: data['totalCourses'] || coursesIds.length,
                  totalHours: data['totalHours'] || 0,
                  expertise: expertiseIds, // Vous pouvez aussi récupérer les détails des expertises
                  courses: courses,
                } as Instructor)
            )
          );
        } else {
          throw new Error('Instructeur non trouvé');
        }
      })
    );
  }

  // Méthode pour récupérer les détails des cours
  private getCoursesDetails(courseIds: string[]): Observable<any[]> {
    if (!courseIds || courseIds.length === 0) {
      return of([]);
    }

    const coursesPromises = courseIds.map((courseId) => {
      const courseDocRef = doc(this.firestore, 'courses', courseId);
      return getDoc(courseDocRef).then((doc) => {
        if (doc.exists()) {
          return {
            id: doc.id,
            ...doc.data(),
          };
        }
        return null;
      });
    });

    return from(Promise.all(coursesPromises)).pipe(
      map((courses) => courses.filter((course) => course !== null))
    );
  }

  // Méthode pour récupérer les cours d'un instructeur
  getInstructorCourses(instructorId: string): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    const q = query(coursesRef, where('instructorId', '==', instructorId));

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Course)
        );
      })
    );
  }
}

