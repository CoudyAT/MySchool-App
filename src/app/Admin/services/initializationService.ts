import { Injectable } from '@angular/core';
import { Firestore, collection, setDoc, doc, getDocs } from '@angular/fire/firestore';
import { Course } from 'src/app/models/course.model';

@Injectable({
  providedIn: 'root',
})
export class InitializationService {
  //   private firestore = inject(Firestore);
  //   private readonly FIXTURES_LOADED_KEY = 'myschool_fixtures_v2';

  //   async loadFixturesInBackground(): Promise<void> {
  //     console.log('🔧 [FIXTURES] Démarrage du chargement...');

  //     // Vérifier Firebase
  //     if (!this.firestore) {
  //       console.error('[FIXTURES] Firestore non disponible');
  //       return;
  //     }

  //     // Vérifier si déjà chargé
  //     if (this.areFixturesLoaded()) {
  //       console.log('ℹ️ [FIXTURES] Déjà chargées (skipped)');
  //       return;
  //     }

  //     console.log('🔄 [FIXTURES] Chargement des données...');

  //     try {
  //       await this.createCoursesFixtures();
  //       this.markFixturesAsLoaded();
  //       console.log('✅ [FIXTURES] Chargement terminé avec succès');
  //     } catch (error) {
  //       console.error('❌ [FIXTURES] Erreur:', error);
  //     }
  //   }

  //   private async createCoursesFixtures(): Promise<void> {
  //     console.log('📚 [FIXTURES] Création des cours...');

  //     const courses = [
  //       {
  //         id: 'maths_algo_1',
  //         title: 'Algorithme',
  //         category: 'Maths au collège',
  //         description: 'Cours d\'algorithmique pour collégiens',
  //         level: 'DEBUTANT',
  //         type: 'En ligne',
  //         duration: 25,
  //         sessions: 25,
  //         exercises: 15,
  //         image: 'assets/images/algorithme1.jpg',
  //         isPublished: true,
  //         certificateAvailable: true,
  //         price: 0,
  //         rating: 4.5,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         chapters: []
  //       },
  //       {
  //         id: 'maths_algo_2',
  //         title: 'Algorithme Avancé',
  //         category: 'Maths au collège',
  //         description: 'Algorithmique niveau avancé',
  //         level: 'INTERMEDIAIRE',
  //         type: 'En ligne',
  //         duration: 30,
  //         sessions: 30,
  //         exercises: 8,
  //         image: 'assets/images/algorithme2.jpg',
  //         isPublished: true,
  //         certificateAvailable: true,
  //         price: 29.99,
  //         rating: 4.8,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         chapters: []
  //       },
  //       {
  //         id: 'pc_physique_1',
  //         title: 'Physique',
  //         category: 'PC au collège',
  //         description: 'Cours de physique fondamentale',
  //         level: 'DEBUTANT',
  //         type: 'VIDEO',
  //         duration: 59,
  //         sessions: 59,
  //         exercises: 10,
  //         image: 'assets/images/physique.jpg',
  //         isPublished: true,
  //         certificateAvailable: false,
  //         price: 0,
  //         rating: 4.3,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         chapters: []
  //       },
  //       {
  //         id: 'pc_chimie_1',
  //         title: 'Chimie',
  //         category: 'PC au collège',
  //         description: 'Introduction à la chimie',
  //         level: 'DEBUTANT',
  //         type: 'VIDEO',
  //         duration: 75,
  //         sessions: 75,
  //         exercises: 9,
  //         image: 'assets/images/chimie.jpg',
  //         isPublished: true,
  //         certificateAvailable: true,
  //         price: 19.99,
  //         rating: 4.6,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         chapters: []
  //       },
  //       {
  //         id: 'svt_organes_1',
  //         title: 'Les Organes',
  //         category: 'Sciences de la Vie et de la Terre',
  //         description: 'Étude des organes humains',
  //         level: 'DEBUTANT',
  //         type: 'En ligne',
  //         duration: 59,
  //         sessions: 59,
  //         exercises: 10,
  //         image: 'assets/images/organes.jpg',
  //         isPublished: true,
  //         certificateAvailable: false,
  //         price: 0,
  //         rating: 4.4,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         chapters: []
  //       },
  //       {
  //         id: 'svt_ecosysteme_1',
  //         title: 'L\'écosystème',
  //         category: 'Sciences de la Vie et de la Terre',
  //         description: 'Comprendre les écosystèmes',
  //         level: 'INTERMEDIAIRE',
  //         type: 'En ligne',
  //         duration: 75,
  //         sessions: 75,
  //         exercises: 9,
  //         image: 'assets/images/ecosysteme.jpg',
  //         isPublished: true,
  //         certificateAvailable: true,
  //         price: 24.99,
  //         rating: 4.7,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         chapters: []
  //       }
  //     ];

  //     let createdCount = 0;

  //     for (const course of courses) {
  //       const created = await this.createIfNotExists('courses', course.id, course);
  //       if (created) createdCount++;
  //     }

  //     console.log(`📊 [FIXTURES] ${createdCount}/${courses.length} cours créés`);
  //   }

  //   private async createIfNotExists(collectionName: string, docId: string, data: any): Promise<boolean> {
  //     try {
  //       const docRef = doc(this.firestore, collectionName, docId);
  //       const docSnap = await getDoc(docRef);

  //       if (!docSnap.exists()) {
  //         await setDoc(docRef, data);
  //         console.log(`✅ [FIXTURES] Créé: ${data.title}`);
  //         return true;
  //       } else {
  //         console.log(`ℹ️ [FIXTURES] Existe déjà: ${data.title}`);
  //         return false;
  //       }
  //     } catch (error) {
  //       console.error(`❌ [FIXTURES] Erreur avec ${data.title}:`, error);
  //       return false;
  //     }
  //   }

  //   private areFixturesLoaded(): boolean {
  //     const loaded = localStorage.getItem(this.FIXTURES_LOADED_KEY) === 'true';
  //     console.log(`🔍 [FIXTURES] Statut localStorage: ${loaded}`);
  //     return loaded;
  //   }

  //   private markFixturesAsLoaded(): void {
  //     localStorage.setItem(this.FIXTURES_LOADED_KEY, 'true');
  //     console.log('🏷️ [FIXTURES] Marqué comme chargé dans localStorage');
  //   }

  //   // Méthodes de debug
  //   getDebugInfo(): any {
  //     return {
  //       fixturesLoaded: this.areFixturesLoaded(),
  //       firestoreAvailable: !!this.firestore,
  //       localStorageKey: this.FIXTURES_LOADED_KEY
  //     };
  //   }

  //   forceReload(): void {
  //     console.log('🔄 [FIXTURES] Forcer le rechargement...');
  //     localStorage.removeItem(this.FIXTURES_LOADED_KEY);
  //     this.loadFixturesInBackground();
  //   }
  // }

  constructor(private firestore: Firestore) {}

  async seedExpertises() {
    const expertises: Record<string, any> = {
      angular: {
        id: 'angular',
        name: 'Angular',
        description:
          'Framework moderne utilisé dans les entreprises pour créer des applications web complexes.',
      },
      react: {
        id: 'react',
        name: 'React',
        description:
          'Bibliothèque JavaScript utilisée pour créer des interfaces rapides et dynamiques.',
      },
      node: {
        id: 'node',
        name: 'Node.js',
        description:
          'JavaScript côté serveur, idéal pour des APIs modernes et performantes.',
      },
      typescript: {
        id: 'typescript',
        name: 'TypeScript',
        description:
          'Surcouche de JavaScript avec typage fort. Standard pour les projets professionnels.',
      },
      ionic: {
        id: 'ionic',
        name: 'Ionic',
        description:
          'Framework mobile hybride pour créer des applications iOS et Android.',
      },
      firebase: {
        id: 'firebase',
        name: 'Firebase',
        description:
          'Plateforme Google pour apps temps réel avec authentification, base de données et hosting.',
      },
      aws: {
        id: 'aws',
        name: 'AWS',
        description: 'Leader mondial du cloud computing.',
      },
      kubernetes: {
        id: 'kubernetes',
        name: 'Kubernetes',
        description: 'Orchestration de conteneurs à grande échelle.',
      },
      python: {
        id: 'python',
        name: 'Python',
        description:
          'Langage simple et puissant, utilisé dans l’IA, data-science et automatisation.',
      },
      algorithmie: {
        id: 'algorithmie',
        name: 'Algorithmie',
        description:
          'Logique, raisonnement, résolution de problèmes mathématiques et informatiques.',
      },
    };

    const ref = collection(this.firestore, 'expertise');

    for (const key of Object.keys(expertises)) {
      await setDoc(doc(ref, key), expertises[key]);
    }

    console.log('Expertises ajoutées !');
  }

  // ---------------------------------------------------------
  // 2) INSERT INSTRUCTORS (6 PROFs)
  // Et on leur attribue les cours existants
  // ---------------------------------------------------------
  async seedInstructors() {
    // 🔍 Récupère tous les cours existants
    const coursesSnap = await getDocs(collection(this.firestore, 'courses'));
    const courses: Course[] = coursesSnap.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Course;
    });

    console.log('Cours détectés :', courses);

    // Sélection de cours par catégorie
    const algoCourses = courses.filter(
      (c) => c.category === 'Maths au collège'
    );
    const webCourses = courses.filter(
      (c) => c.category === 'Sciences de la Vie et de la Terre'
    );

    const instructors: Record<string, any> = {
      kaye: {
        id: 'kaye',
        name: 'KAYE',
        title: 'Expert Web & Mobile',
        image: 'assets/profs/kaye.jpg',
        backgroundColor: '#0066ff',
        rating: 4.8,
        expertiseIds: ['angular', 'react', 'ionic', 'typescript'],
        coursesIds: webCourses.slice(0, 2).map((c) => c.id),
        bio: 'Développeur depuis 10 ans, passionné par la création d’applications modernes.',
      },

      ndiaye: {
        id: 'ndiaye',
        name: 'NDIAYE',
        title: 'Expert Data & IA',
        image: 'assets/profs/ndiaye.jpg',
        backgroundColor: '#5a5a5a',
        rating: 4.7,
        expertiseIds: ['python', 'algorithmie'],
        coursesIds: algoCourses.map((c) => c.id),
        bio: 'Spécialiste Machine Learning, Deep Learning et Data Science.',
      },

      diop: {
        id: 'diop',
        name: 'DIOP',
        title: 'Professeur Mathématiques',
        image: 'assets/profs/diop.jpg',
        backgroundColor: '#ff9933',
        rating: 4.6,
        expertiseIds: ['algorithmie'],
        coursesIds: algoCourses.map((c) => c.id),
        bio: 'Professeur de mathématiques depuis 15 ans, spécialisé dans la logique et les algorithmes.',
      },

      fall: {
        id: 'fall',
        name: 'FALL',
        title: 'Ingénieur Logiciel',
        image: 'assets/profs/fall.jpg',
        backgroundColor: '#4444ff',
        rating: 4.7,
        expertiseIds: ['node', 'typescript'],
        coursesIds: webCourses.map((c) => c.id),
        bio: 'Développeur backend spécialisé Node.js et architectures API.',
      },

      sow: {
        id: 'sow',
        name: 'SOW',
        title: 'Développeur Full-Stack',
        image: 'assets/profs/sow.jpg',
        backgroundColor: '#22aaaa',
        rating: 4.8,
        expertiseIds: ['react', 'firebase'],
        coursesIds: webCourses.slice(0, 3).map((c) => c.id),
        bio: 'Développeur full-stack passionné par l’enseignement.',
      },
    };

    const ref = collection(this.firestore, 'instructors');

    for (const key of Object.keys(instructors)) {
      await setDoc(doc(ref, key), instructors[key]);
    }

    console.log('Professeurs insérés avec succès !');
  }
}