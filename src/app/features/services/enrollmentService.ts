// services/enrollment.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  collectionData,
  getDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { Enrollment, PaymentData } from 'src/app/models/payment.model';


@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createEnrollment(paymentData: PaymentData): Promise<string> {
    // UTILISER LE UID DE VOTRE BASE, PAS CELUI DE FIREBASE AUTH
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser || !localUser.uid) {
      throw new Error('Utilisateur non connecté');
    }

    const realUid = localUser.uid; // Le UID qui existe dans votre base

    console.log('Création inscription avec le vrai UID:', realUid);
    console.log('UID Firebase Auth (ignoré):', this.auth.currentUser?.uid);

    const enrollmentData = {
      userId: realUid, // ← UTILISER LE VRAI UID ICI
      courseId: paymentData.courseId,
      courseTitle: paymentData.courseTitle,
      courseImage: paymentData.courseImage,
      amount: paymentData.amount,
      paymentMethod: paymentData.method?.id || 'unknown',
      status: 'completed',
      enrolledAt: new Date(),
      progress: 0,
      chaptersCompleted: [],
    };

    try {
      const enrollmentRef = await addDoc(
        collection(this.firestore, 'enrollments'),
        enrollmentData
      );
      console.log('Inscription créée avec ID:', enrollmentRef.id);
      return enrollmentRef.id;
    } catch (error) {
      console.error('Erreur création inscription:', error);
      throw error;
    }
  }

  // Ajouter l'utilisateur au cours
  private async addUserToCourse(
    courseId: string,
    userId: string
  ): Promise<void> {
    const courseRef = doc(this.firestore, 'courses', courseId);
    await updateDoc(courseRef, {
      enrolledUsers: arrayUnion(userId),
    });
  }

  // Vérifier si l'utilisateur est déjà inscrit à un cours
  async isUserEnrolled(courseId: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const enrollmentsRef = collection(this.firestore, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('userId', '==', user.uid),
      where('courseId', '==', courseId),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // Récupérer tous les cours où l'utilisateur est inscrit

  getUserEnrollments(): Observable<Enrollment[]> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser || !localUser.uid) {
      console.warn('❌ Aucun utilisateur trouvé dans localStorage');
      return of([]);
    }

    const realUid = localUser.uid;

    console.log('🔍 Recherche des enrollments avec UID:', realUid);

    const enrollmentsRef = collection(this.firestore, 'enrollments');
    const q = query(enrollmentsRef, where('userId', '==', realUid));

    return collectionData(q, { idField: 'id' }).pipe(
      map((data: any[]) => {
        // Convertir les données Firestore en objets Enrollment
        return data.map((doc) => this.mapToEnrollment(doc));
      })
    );
  }

  private mapToEnrollment(data: any): Enrollment {
    return {
      id: data.id,
      userId: data.userId,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      courseImage: data.courseImage,
      amount: data.amount || 0,
      enrolledAt: data.enrolledAt,
      paymentMethod: data.paymentMethod,
      progress: data.progress || 0,
      chaptersCompleted: data.chaptersCompleted || [],
      status: data.status || 'active',
    };
  }

  // Mettre à jour la progression d'un cours
  async updateProgress(
    enrollmentId: string,
    progress: number,
    chapterId?: string
  ): Promise<void> {
    const enrollmentRef = doc(this.firestore, 'enrollments', enrollmentId);
    const updates: any = { progress };

    if (chapterId) {
      updates.chaptersCompleted = arrayUnion(chapterId);
    }

    await updateDoc(enrollmentRef, updates);
  }

  getUserEnrollmentsWithCourseDetails(): Observable<any[]> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser || !localUser.uid) {
      console.warn('❌ Aucun utilisateur trouvé dans localStorage');
      return of([]);
    }

    const realUid = localUser.uid;

    console.log('🔍 Recherche des enrollments avec UID:', realUid);

    const enrollmentsRef = collection(this.firestore, 'enrollments');
    const q = query(enrollmentsRef, where('userId', '==', realUid));

    return collectionData(q, { idField: 'id' }).pipe(
      switchMap((enrollments: any[]) => {
        console.log('📦 Enrollments trouvés:', enrollments.length);

        // Si aucun enrollment, retourner un tableau vide
        if (enrollments.length === 0) {
          return of([]);
        }

        // Pour chaque enrollment, récupérer les données du cours
        const enrollmentPromises = enrollments.map(async (enrollment) => {
          try {
            // Récupérer les données du cours depuis la collection 'courses'
            const courseDoc = await getDoc(
              doc(this.firestore, 'courses', enrollment.courseId)
            );

            if (courseDoc.exists()) {
              const courseData = courseDoc.data();
              return {
                ...this.mapToEnrollment(enrollment),
                courseDetails: {
                  id: courseDoc.id,
                  ...courseData,
                },
              };
            } else {
              console.warn(`❌ Cours ${enrollment.courseId} non trouvé`);
              return this.mapToEnrollment(enrollment);
            }
          } catch (error) {
            console.error(
              `❌ Erreur chargement cours ${enrollment.courseId}:`,
              error
            );
            return this.mapToEnrollment(enrollment);
          }
        });

        // Convertir les promesses en observable
        return from(Promise.all(enrollmentPromises));
      })
    );
  }
}
