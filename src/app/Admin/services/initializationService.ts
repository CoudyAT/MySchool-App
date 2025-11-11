// services/initialization.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class InitializationService {

  private firestore = inject(Firestore);
  private readonly FIXTURES_LOADED_KEY = 'myschool_fixtures_v2';

  async loadFixturesInBackground(): Promise<void> {
    console.log('🔧 [FIXTURES] Démarrage du chargement...');
    
    // Vérifier Firebase
    if (!this.firestore) {
      console.error('[FIXTURES] Firestore non disponible');
      return;
    }

    // Vérifier si déjà chargé
    if (this.areFixturesLoaded()) {
      console.log('ℹ️ [FIXTURES] Déjà chargées (skipped)');
      return;
    }

    console.log('🔄 [FIXTURES] Chargement des données...');
    
    try {
      await this.createCoursesFixtures();
      this.markFixturesAsLoaded();
      console.log('✅ [FIXTURES] Chargement terminé avec succès');
    } catch (error) {
      console.error('❌ [FIXTURES] Erreur:', error);
    }
  }

  private async createCoursesFixtures(): Promise<void> {
    console.log('📚 [FIXTURES] Création des cours...');
    
    const courses = [
      {
        id: 'maths_algo_1',
        title: 'Algorithme',
        category: 'Maths au collège',
        description: 'Cours d\'algorithmique pour collégiens',
        level: 'DEBUTANT',
        type: 'En ligne',
        duration: 25,
        sessions: 25,
        exercises: 15,
        image: 'assets/images/algorithme1.jpg',
        isPublished: true,
        certificateAvailable: true,
        price: 0,
        rating: 4.5,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: []
      },
      {
        id: 'maths_algo_2',
        title: 'Algorithme Avancé',
        category: 'Maths au collège',
        description: 'Algorithmique niveau avancé',
        level: 'INTERMEDIAIRE',
        type: 'En ligne',
        duration: 30,
        sessions: 30,
        exercises: 8,
        image: 'assets/images/algorithme2.jpg',
        isPublished: true,
        certificateAvailable: true,
        price: 29.99,
        rating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: []
      },
      {
        id: 'pc_physique_1',
        title: 'Physique',
        category: 'PC au collège',
        description: 'Cours de physique fondamentale',
        level: 'DEBUTANT',
        type: 'VIDEO',
        duration: 59,
        sessions: 59,
        exercises: 10,
        image: 'assets/images/physique.jpg',
        isPublished: true,
        certificateAvailable: false,
        price: 0,
        rating: 4.3,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: []
      },
      {
        id: 'pc_chimie_1',
        title: 'Chimie',
        category: 'PC au collège',
        description: 'Introduction à la chimie',
        level: 'DEBUTANT',
        type: 'VIDEO',
        duration: 75,
        sessions: 75,
        exercises: 9,
        image: 'assets/images/chimie.jpg',
        isPublished: true,
        certificateAvailable: true,
        price: 19.99,
        rating: 4.6,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: []
      },
      {
        id: 'svt_organes_1',
        title: 'Les Organes',
        category: 'Sciences de la Vie et de la Terre',
        description: 'Étude des organes humains',
        level: 'DEBUTANT',
        type: 'En ligne',
        duration: 59,
        sessions: 59,
        exercises: 10,
        image: 'assets/images/organes.jpg',
        isPublished: true,
        certificateAvailable: false,
        price: 0,
        rating: 4.4,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: []
      },
      {
        id: 'svt_ecosysteme_1',
        title: 'L\'écosystème',
        category: 'Sciences de la Vie et de la Terre',
        description: 'Comprendre les écosystèmes',
        level: 'INTERMEDIAIRE',
        type: 'En ligne',
        duration: 75,
        sessions: 75,
        exercises: 9,
        image: 'assets/images/ecosysteme.jpg',
        isPublished: true,
        certificateAvailable: true,
        price: 24.99,
        rating: 4.7,
        createdAt: new Date(),
        updatedAt: new Date(),
        chapters: []
      }
    ];

    let createdCount = 0;
    
    for (const course of courses) {
      const created = await this.createIfNotExists('courses', course.id, course);
      if (created) createdCount++;
    }

    console.log(`📊 [FIXTURES] ${createdCount}/${courses.length} cours créés`);
  }

  private async createIfNotExists(collectionName: string, docId: string, data: any): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, data);
        console.log(`✅ [FIXTURES] Créé: ${data.title}`);
        return true;
      } else {
        console.log(`ℹ️ [FIXTURES] Existe déjà: ${data.title}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ [FIXTURES] Erreur avec ${data.title}:`, error);
      return false;
    }
  }

  private areFixturesLoaded(): boolean {
    const loaded = localStorage.getItem(this.FIXTURES_LOADED_KEY) === 'true';
    console.log(`🔍 [FIXTURES] Statut localStorage: ${loaded}`);
    return loaded;
  }

  private markFixturesAsLoaded(): void {
    localStorage.setItem(this.FIXTURES_LOADED_KEY, 'true');
    console.log('🏷️ [FIXTURES] Marqué comme chargé dans localStorage');
  }

  // Méthodes de debug
  getDebugInfo(): any {
    return {
      fixturesLoaded: this.areFixturesLoaded(),
      firestoreAvailable: !!this.firestore,
      localStorageKey: this.FIXTURES_LOADED_KEY
    };
  }

  forceReload(): void {
    console.log('🔄 [FIXTURES] Forcer le rechargement...');
    localStorage.removeItem(this.FIXTURES_LOADED_KEY);
    this.loadFixturesInBackground();
  }
}