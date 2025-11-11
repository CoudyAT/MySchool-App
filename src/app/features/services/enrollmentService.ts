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
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { Enrollment, PaymentData } from 'src/app/models/payment.model';


@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Créer un nouvel enregistrement de paiement
  //   async createEnrollment(paymentData: PaymentData): Promise<string> {
  //     const user = this.auth.currentUser;
  //     if (!user) {
  //       throw new Error('Utilisateur non connecté');
  //     }

  //     const enrollment: Enrollment = {
  //       userId: user.uid,
  //       courseId: paymentData.courseId,
  //       courseTitle: paymentData.courseTitle,
  //       courseImage: paymentData.courseImage,
  //       paymentMethod: paymentData.method.id,
  //       amount: paymentData.amount,
  //       status: 'completed', // Ou 'pending' selon votre logique
  //       enrolledAt: new Date(),
  //       progress: 0,
  //       chaptersCompleted: [],
  //     };

  //     try {
  //       const enrollmentsRef = collection(this.firestore, 'enrollments');
  //       const docRef = await addDoc(enrollmentsRef, enrollment);

  //       // Mettre à jour également le cours avec l'utilisateur inscrit
  //       await this.addUserToCourse(paymentData.courseId, user.uid);

  //       console.log('✅ Inscription créée:', docRef.id);
  //       return docRef.id;
  //     } catch (error) {
  //       console.error('❌ Erreur création inscription:', error);
  //       throw error;
  //     }
  //   }

  async createEnrollment(paymentData: PaymentData): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    // ⭐ VALIDATION DES DONNÉES
    if (!paymentData.courseId) {
      throw new Error('courseId est requis');
    }
    if (!paymentData.courseTitle) {
      throw new Error('courseTitle est requis');
    }

    console.log('📝 Données de paiement reçues:', paymentData);
    console.log('👤 Utilisateur:', user.uid);

    const enrollment: Enrollment = {
      userId: user.uid,
      courseId: paymentData.courseId,
      courseTitle: paymentData.courseTitle,
      courseImage: paymentData.courseImage || 'assets/algo.svg', // Valeur par défaut
      paymentMethod: paymentData.method?.id || 'unknown',
      amount: paymentData.amount || 0,
      status: 'completed',
      enrolledAt: new Date(),
      progress: 0,
      chaptersCompleted: [],
    };

    console.log('📄 Données enrollment préparées:', enrollment);

    try {
      const enrollmentsRef = collection(this.firestore, 'enrollments');
      const docRef = await addDoc(enrollmentsRef, enrollment);

      // Mettre à jour également le cours avec l'utilisateur inscrit
      await this.addUserToCourse(paymentData.courseId, user.uid);

      console.log('✅ Inscription créée:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(' Erreur création inscription:', error);
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
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const enrollmentsRef = collection(this.firestore, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('userId', '==', user.uid),
      where('status', '==', 'completed')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Enrollment)
        )
      )
    );
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
}
