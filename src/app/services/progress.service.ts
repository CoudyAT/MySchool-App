import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  getUserId(): string {
    const user = this.auth.currentUser;
    if (!user) return '';
    return user.uid;
  }

  // 📌 Récupérer la progression d’un cours
  getProgress(courseId: string): Observable<any> {
    const userId = this.getUserId();
    const ref = doc(this.firestore, `users/${userId}/progress/${courseId}`);
    return docData(ref, { idField: 'id' });
  }

  // 📌 Sauvegarder la progression
  async saveProgress(
    courseId: string,
    completedChapters: number[],
    progress: number
  ) {
    const userId = this.getUserId();
    const ref = doc(this.firestore, `users/${userId}/progress/${courseId}`);

    await setDoc(
      ref,
      {
        completedChapters,
        progress,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  }
}
