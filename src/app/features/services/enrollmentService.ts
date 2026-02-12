// services/enrollment.service.ts
import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Observable, of, map, switchMap, from, firstValueFrom, catchError, forkJoin } from 'rxjs';
import {
  Enrollment,
  PaymentData,
  EnrollmentApiResponse,
} from 'src/app/models/payment.model';
import { ApiService } from 'src/app/core/services/api.service';
import { PaymentService } from './paymentService';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(Auth);
  private readonly paymentService = inject(PaymentService);

  /**
   * Crée une inscription avec paiement optionnel
   * Si le cours est payant et paymentMethod = 'orange-money', crée le paiement
   */
  // async createEnrollment(paymentData: PaymentData): Promise<{
  //   enrollmentId: string;
  //   payment?: any;
  // }> {
  //   // UTILISER LE UID DE VOTRE BASE, PAS CELUI DE FIREBASE AUTH
  //   const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  //   if (!localUser?.uid) {
  //     throw new Error('Utilisateur non connecté');
  //   }

  //   const realUid = localUser.uid; // Le UID qui existe dans votre base

  //   console.log('Création inscription avec le vrai UID:', realUid);
  //   console.log('UID Firebase Auth (ignoré):', this.auth);

  //   const enrollmentData = {
  //     userId: realUid,
  //     courseId: paymentData.courseId,
  //     courseTitle: paymentData.courseTitle,
  //     courseImage: paymentData.courseImage,
  //     amount: paymentData.amount,
  //     paymentMethod: paymentData.method?.id || 'unknown',
  //     status: 'active',
  //     enrolledAt: new Date(),
  //     progress: 0,
  //     chaptersCompleted: [],
  //   };

  //   try {
  //     const response = await firstValueFrom(
  //       this.api.post<{ id: string; enrollment: Enrollment }>(
  //         '/enrollments',
  //         enrollmentData
  //       )
  //     );

  //     console.log('Inscription créée avec ID:', response?.id);
  //     const enrollmentId = response?.id || '';

  //     if (paymentData.amount > 0) {
  //       console.log('💳 Création du paiement ...');

  //       // Récupérer les données client du localStorage ou du paymentData
  //       let customerData: any = {};
  //       const savedCustomerData = localStorage.getItem('paymentCustomerData');

  //       if (savedCustomerData) {
  //         try {
  //           customerData = JSON.parse(savedCustomerData);
  //         } catch (e) {
  //           console.error('Erreur parsing customerData:', e);
  //         }
  //       }

  //       // Fallback sur les données de la méthode de paiement
  //       if (!customerData.phone && paymentData.method.customerPhone) {
  //         customerData = {
  //           name: paymentData.method.customerName,
  //           email: paymentData.method.customerEmail,
  //           phone: paymentData.method.customerPhone,
  //         };
  //       }

  //       // Fallback final sur l'utilisateur connecté
  //       if (!customerData.phone) {
  //         customerData = {
  //           name:
  //             localUser.firstName + ' ' + localUser.lastName ||
  //             'Client MySchool',
  //           email: localUser.email || 'client@myschool.sn',
  //           phone: localUser.phone || '+221771234567',
  //         };
  //       }

  //       const payment = await firstValueFrom(
  //         this.paymentService.createPayment({
  //           userId: realUid,
  //           enrollmentId: enrollmentId,
  //           courseId: paymentData.courseId,
  //           amount: Math.round(paymentData.amount * 100), // Convertir en centimes
  //           currency: 'XOF',
  //           paymentMethod: 'wave',
  //           customerPhoneNumber: customerData.phone,
  //           customerFirstName: customerData.name.split(' ')[0] || 'Prénom',
  //           customerLastName:
  //             customerData.name.split(' ').slice(1).join(' ') || 'Nom',
  //           description: `Paiement pour ${paymentData.courseTitle}`,
  //         })
  //       );

  //       // Nettoyer les données client temporaires
  //       localStorage.removeItem('paymentCustomerData');

  //       if (payment.success && payment.data) {
  //         console.log('✅ Paiement créé:', payment.data);
  //         return {
  //           enrollmentId: enrollmentId,
  //           payment: payment.data,
  //         };
  //       }
  //     }

  //     return { enrollmentId: enrollmentId };
  //   } catch (error) {
  //     console.error('Erreur création inscription:', error);
  //     throw error;
  //   }
  // }

  async createEnrollment(paymentData: PaymentData): Promise<{
    enrollmentId?: string;
    payment?: any;
  }> {
    const backendUserId = this.getBackendUserId();

    const enrollmentData = {
      userId: backendUserId,
      courseId: paymentData.courseId,
      courseTitle: paymentData.courseTitle,
      courseImage: paymentData.courseImage,
      amount: paymentData.amount,
      paymentMethod: paymentData.method?.id || 'unknown',
      status: 'active',
      enrolledAt: new Date(),
      progress: 0,
      chaptersCompleted: [],
    };

    try {
      // 1️⃣ Création inscription
      const response = await firstValueFrom(
        this.api.post<EnrollmentApiResponse>('/enrollments', enrollmentData)
      );

      console.log('Enrollment response:', response);

      // ✅ récupérer l’ID correctement
      const enrollmentId =
        response.data?.id ||
        response.data?._id ||
        `${response.data.userId}_${response.data.courseId}`; // fallback sûr

      // 2️⃣ Paiement (SEULEMENT si payant)
      if (paymentData.amount > 0) {
        const payment = await firstValueFrom(
          this.paymentService.createPayment({
            userId: backendUserId, // ✅ ID backend
            courseId: paymentData.courseId, // ✅ requis
          })
        );

        if (payment.success && payment.data) {
          return {
            enrollmentId,
            payment: payment.data,
          };
        }
      }

      // 3️⃣ Cours gratuit
      return { enrollmentId };
    } catch (error) {
      console.error('Erreur création inscription:', error);
      throw error;
    }
  }

  private getBackendUserId(): string {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const backendUserId = localUser.id || localUser._id || localUser.userId; // ⚠️ PAS localUser.uid

    if (!backendUserId) {
      throw new Error('ID utilisateur backend introuvable');
    }

    return backendUserId;
  }

  // Vérifier si l'utilisateur est déjà inscrit à un cours
  async isUserEnrolled(courseId: string): Promise<boolean> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!localUser?.uid) return false;

    try {
      const enrollments = await firstValueFrom(
        this.api.get<Enrollment[]>(`/enrollments/user/${localUser.uid}`)
      );

      return (
        enrollments?.some(
          (e) => e.courseId === courseId && e.status === 'completed'
        ) || false
      );
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

    return this.api.get<any>(`/enrollments/user/${realUid}`).pipe(
      map((response) => {
        console.log('Réponse API enrollments:', response);

        // ✅ On récupère le vrai tableau
        const enrollments = response?.data ?? [];

        return enrollments.map((doc: any) => this.mapToEnrollment(doc));
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
      const enrollment = await firstValueFrom(
        this.api.get<Enrollment>(`/enrollments/${enrollmentId}`)
      );

      if (enrollment && !enrollment.chaptersCompleted?.includes(chapterId)) {
        updates.chaptersCompleted = [
          ...(enrollment.chaptersCompleted || []),
          chapterId,
        ];
      }
    }

    await firstValueFrom(this.api.put(`/enrollments/${enrollmentId}`, updates));
  }

  // getUserEnrollmentsWithCourseDetails(): Observable<Enrollment[]> {
  //   const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  //   if (!localUser?.uid) {
  //     console.warn('❌ Aucun utilisateur trouvé dans localStorage');
  //     return of([]);
  //   }

  //   const realUid = localUser.uid;
  //   console.log('🔍 Recherche des enrollments avec UID:', realUid);

  //   return this.api.get<Enrollment[]>(`/enrollments/user/${realUid}`).pipe(
  //     switchMap((enrollments: any[]) => {
  //       console.log('📦 Enrollments trouvés:', enrollments.length);

  //       if (enrollments.length === 0) {
  //         return of([]);
  //       }

  //       // Récupérer les détails des cours pour chaque enrollment
  //       const enrollmentPromises = enrollments.map(async (enrollment) => {
  //         try {
  //           const courseDetails = await firstValueFrom(
  //             this.api.get<any>(`/courses/${enrollment.courseId}`)
  //           );

  //           return {
  //             ...this.mapToEnrollment(enrollment),
  //             courseDetails: courseDetails,
  //           } as Enrollment;
  //         } catch (error) {
  //           console.error(
  //             `❌ Erreur chargement cours ${enrollment.courseId}:`,
  //             error
  //           );
  //           return this.mapToEnrollment(enrollment);
  //         }
  //       });

  //       return from(Promise.all(enrollmentPromises));
  //     })
  //   );
  // }

  // getUserEnrollmentsWithCourseDetails(): Observable<Enrollment[]> {
  //   const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  //   if (!localUser?.uid) {
  //     console.warn('❌ Aucun utilisateur trouvé dans localStorage');
  //     return of([]);
  //   }

  //   const realUid = localUser.uid;

  //   return this.api.get<Enrollment[]>(`/enrollments/user/${realUid}`).pipe(
  //     switchMap((enrollments: any[]) => {
  //       if (enrollments.length === 0) {
  //         return of([]);
  //       }

  //       // Appels parallèles RxJS (plus propre que async/await dans map)
  //       const requests$ = enrollments.map((enr) =>
  //         this.api.get<any>(`/courses/${enr.courseId}`).pipe(
  //           map((courseRes) => ({
  //             ...this.mapToEnrollment(enr),
  //             courseDetails: courseRes?.data ?? null, // 🟢 extraction du data
  //           })),
  //           catchError(
  //             () => of(this.mapToEnrollment(enr)) // en cas d'erreur, on renvoie juste l’enrollment
  //           )
  //         )
  //       );

  //       return forkJoin(requests$);
  //     })
  //   );
  // }

  getUserEnrollmentsWithCourseDetails(): Observable<Enrollment[]> {
    const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (!localUser?.uid) {
      console.warn('❌ Aucun utilisateur trouvé dans localStorage');
      return of([]);
    }

    const realUid = localUser.uid;

    return this.api
      .get<EnrollmentApiResponse>(`/enrollments/user/${realUid}`)
      .pipe(
        switchMap((response) => {
          const enrollments = response.data; // ✅ EXTRACTION CORRECTE

          if (!Array.isArray(enrollments) || enrollments.length === 0) {
            return of([]);
          }

          const requests$ = enrollments.map((enr) =>
            this.api.get<any>(`/courses/${enr.courseId}`).pipe(
              map((courseRes) => ({
                ...this.mapToEnrollment(enr),
                courseDetails: courseRes?.data, // ⚠️ PAS null
              })),
              catchError(() =>
                of({
                  ...this.mapToEnrollment(enr),
                  courseDetails: undefined, // ✅ OK pour TypeScript
                })
              )
            )
          );

          return forkJoin(requests$);
        })
      );
  }
  // getUserEnrollmentsWithCourseDetails(): Observable<Enrollment[]> {
  //   const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  //   if (!localUser?.uid) {
  //     console.warn('❌ Aucun utilisateur trouvé dans localStorage');
  //     return of([]);
  //   }

  //   const realUid = localUser.uid;

  //   return this.api.get<any>(`/enrollments/user/${realUid}`).pipe(
  //     map((response) => response.data ?? []), // ✅ EXTRACTION DU TABLEAU
  //     switchMap((enrollments: any[]) => {
  //       if (!Array.isArray(enrollments) || enrollments.length === 0) {
  //         return of([]);
  //       }

  //       const requests$ = enrollments.map((enr) =>
  //         this.api.get<any>(`/courses/${enr.courseId}`).pipe(
  //           map((courseRes) => ({
  //             ...this.mapToEnrollment(enr),
  //             courseDetails: courseRes?.data ?? null, // ✅ extraction du data
  //           })),
  //           catchError(() =>
  //             of({
  //               ...this.mapToEnrollment(enr),
  //               courseDetails: null,
  //             })
  //           )
  //         )
  //       );

  //       return forkJoin(requests$);
  //     })
  //   );
  // }

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

    await firstValueFrom(this.api.put(`/users/${localUser.uid}`, premiumData));

    console.log('✅ Utilisateur marqué comme Premium');
  }

  /**
   * Méthodes supplémentaires selon OpenAPI spec
   */

  // Récupérer toutes les inscriptions (Admin)
  getAllEnrollments(): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>('/enrollments');
  }

  // Récupérer une inscription par ID
  getEnrollmentById(enrollmentId: string): Observable<Enrollment> {
    return this.api.get<Enrollment>(`/enrollments/${enrollmentId}`);
  }

  // Récupérer les inscriptions d'un cours
  getCourseEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>(`/enrollments/course/${courseId}`);
  }

  // Récupérer les inscriptions par statut
  getEnrollmentsByStatus(
    status: 'active' | 'completed' | 'cancelled'
  ): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>(`/enrollments/status/${status}`);
  }

  // Récupérer l'inscription d'un utilisateur à un cours spécifique
  getUserCourseEnrollment(
    userId: string,
    courseId: string
  ): Observable<Enrollment> {
    return this.api.get<Enrollment>(
      `/enrollments/user/${userId}/course/${courseId}`
    );
  }

  // Mettre à jour une inscription complète
  updateEnrollment(
    enrollmentId: string,
    data: Partial<Enrollment>
  ): Observable<Enrollment> {
    return this.api.put<Enrollment>(`/enrollments/${enrollmentId}`, data);
  }

  // Supprimer une inscription
  deleteEnrollment(enrollmentId: string): Observable<void> {
    return this.api.delete<void>(`/enrollments/${enrollmentId}`);
  }

  // Mettre à jour uniquement la progression (PATCH)
  updateEnrollmentProgress(
    enrollmentId: string,
    progress: number
  ): Observable<Enrollment> {
    return this.api.patch<Enrollment>(`/enrollments/${enrollmentId}/progress`, {
      progress,
    });
  }

  // Mettre à jour uniquement le statut (PATCH)
  updateEnrollmentStatus(
    enrollmentId: string,
    status: 'active' | 'completed' | 'cancelled'
  ): Observable<Enrollment> {
    return this.api.patch<Enrollment>(`/enrollments/${enrollmentId}/status`, {
      status,
    });
  }

  // Marquer un cours comme complété
  async completeCourse(enrollmentId: string): Promise<void> {
    await firstValueFrom(
      this.updateEnrollmentStatus(enrollmentId, 'completed')
    );
    await firstValueFrom(this.updateEnrollmentProgress(enrollmentId, 100));
  }

  // Annuler une inscription
  async cancelEnrollment(enrollmentId: string): Promise<void> {
    await firstValueFrom(
      this.updateEnrollmentStatus(enrollmentId, 'cancelled')
    );
  }

  /**
   * Récupérer l'abonnement actif d'un utilisateur
   */
  getActiveSubscription(userId: string): Observable<{ success: boolean; data?: any }> {
    return this.api.get<{ success: boolean; data?: any }>(`/subscriptions/active/${userId}`).pipe(
      catchError(error => {
        console.error('Erreur récupération abonnement actif:', error);
        return of({ success: false, data: null });
      })
    );
  }

  /**
   * Récupérer tous les abonnements d'un utilisateur
   */
  getUserSubscriptions(userId: string): Observable<{ success: boolean; data?: any[] }> {
    return this.api.get<{ success: boolean; data?: any[] }>(`/subscriptions/user/${userId}`).pipe(
      catchError(error => {
        console.error('Erreur récupération abonnements:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  /**
   * Vérifier l'accès aux cours d'un utilisateur
   */
  checkCourseAccess(userId: string): Observable<{ success: boolean; hasAccess?: boolean; data?: any }> {
    return this.api.get<{ success: boolean; hasAccess?: boolean; data?: any }>(`/subscriptions/check-access/${userId}`).pipe(
      catchError(error => {
        console.error('Erreur vérification accès:', error);
        return of({ success: false, hasAccess: false });
      })
    );
  }

  /**
   * Annuler un abonnement
   */
  cancelSubscription(subscriptionId: string): Observable<{ success: boolean }> {
    return this.api.post<{ success: boolean }>(`/subscriptions/${subscriptionId}/cancel`, {}).pipe(
      catchError(error => {
        console.error('Erreur annulation abonnement:', error);
        return of({ success: false });
      })
    );
  }
}

