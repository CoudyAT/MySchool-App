import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private firestore: Firestore) {}

  // Méthode pour créer un nouveau cours
  async createCourse(courseData: any): Promise<string> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const docRef = await addDoc(coursesCollection, {
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
        certificateAvailable: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('Erreur création cours:', error);
      throw error;
    }
  }

  // Méthode avec ID spécifique
  async createCourseWithId(id: string, courseData: any): Promise<void> {
    try {
      const courseDoc = doc(this.firestore, 'courses', id);
      await setDoc(courseDoc, {
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur création cours avec ID:', error);
      throw error;
    }
  }
}
