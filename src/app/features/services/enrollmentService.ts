// services/enrollment.service.ts
import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Observable, of, map, switchMap, from } from 'rxjs';
import { Enrollment, PaymentData } from 'src/app/models/payment.model';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(Auth);

  async createEnrollment(paymentData: PaymentData): Promise<string> {
    // UTILISER LE UID DE VOTRE BASE, PAS CELUI DE FIREBASE AUTH
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    const realUid = localUser.uid; // Le UID qui existe dans votre base

    console.log('Création inscription avec le vrai UID:', realUid);
    console.log('UID Firebase Auth (ignoré):', this.auth.currentUser?.uid);

    const enrollmentData = {
      userId: realUid,
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
      const response = await this.api.post<{ id: string; enrollment: Enrollment }>(
        '/enrollments',
        enrollmentData
      ).toPromise() as { id: string; enrollment: Enrollment } | undefined;

      console.log('Inscription créée avec ID:', response?.id);
      return response?.id || '';
    } catch (error) {
      console.error('Erreur création inscription:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur est déjà inscrit à un cours
  async isUserEnrolled(courseId: string): Promise<boolean> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!localUser?.uid) return false;

    try {
      const enrollments = await this.api.get<Enrollment[]>(
        `/enrollments/student/${localUser.uid}`
      ).toPromise();

      return enrollments?.some(
        e => e.courseId === courseId && e.status === 'completed'
      ) || false;
    } catch (error) {
      console.error('Erreur vérification inscription:', error);
      return false;
    }
  }

  // Récupérer tous les cours où l'utilisateur est inscrit
  getUserEnrollments(): Observable<Enrollment[]> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser?.uid) {
      console.warn('❌ Aucun utilisateur trouvé dans localStorage');
      return of([]);
    }

    const realUid = localUser.uid;
    console.log('🔍 Recherche des enrollments avec UID:', realUid);

    return this.api.get<Enrollment[]>(`/enrollments/student/${realUid}`).pipe(
      map((data: any[]) => {
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
    const updates: any = { progress };

    if (chapterId) {
      // Récupérer l'enrollment actuel pour ajouter le chapitre
      const enrollment = await this.api.get<Enrollment>(
        `/enrollments/${enrollmentId}`
      ).toPromise();

      if (enrollment && !enrollment.chaptersCompleted?.includes(chapterId)) {
        updates.chaptersCompleted = [...(enrollment.chaptersCompleted || []), chapterId];
      }
    }

    await this.api.put(`/enrollments/${enrollmentId}`, updates).toPromise();
  }

  getUserEnrollmentsWithCourseDetails(): Observable<Enrollment[]> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser?.uid) {
      console.warn('❌ Aucun utilisateur trouvé dans localStorage');
      return of([]);
    }

    const realUid = localUser.uid;
    console.log('🔍 Recherche des enrollments avec UID:', realUid);

    return this.api.get<Enrollment[]>(`/enrollments/student/${realUid}`).pipe(
      switchMap((enrollments: any[]) => {
        console.log('📦 Enrollments trouvés:', enrollments.length);

        if (enrollments.length === 0) {
          return of([]);
        }

        // Récupérer les détails des cours pour chaque enrollment
        const enrollmentPromises = enrollments.map(async (enrollment) => {
          try {
            const courseDetails = await this.api.get<any>(
              `/courses/${enrollment.courseId}`
            ).toPromise();

            return {
              ...this.mapToEnrollment(enrollment),
              courseDetails: courseDetails,
            } as Enrollment;
          } catch (error) {
            console.error(
              `❌ Erreur chargement cours ${enrollment.courseId}:`,
              error
            );
            return this.mapToEnrollment(enrollment);
          }
        });

        return from(Promise.all(enrollmentPromises));
      })
    );
  }

  async activatePremiumAccess(): Promise<void> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser?.uid) {
      throw new Error('Utilisateur non connecté');
    }

    // Marquer l'utilisateur comme Premium dans la base
    const premiumData = {
      isPremium: true,
      premiumSince: new Date(),
      premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    };

    await this.api.put(`/users/${localUser.uid}`, premiumData).toPromise();

    console.log('✅ Utilisateur marqué comme Premium');
  }
}
