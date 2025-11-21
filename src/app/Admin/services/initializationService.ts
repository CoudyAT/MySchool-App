import { Injectable } from '@angular/core';
import { Firestore, collection, setDoc, doc, getDocs, updateDoc } from '@angular/fire/firestore';
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

  // ---------------------------------------------------------
  // 3) CREATE COURSE FIXTURES (Chapitres et Exercices)
  // ---------------------------------------------------------
  async createCourseFixtures() {
    try {
      const courseId = 'svt_organes_1';

      // 1. Créer les chapitres
      const chapters = [
        {
          id: 'chapter_1_maths_algo_2',
          courseId: courseId,
          title: 'Introduction aux Algorithmes',
          order: 1,
          description: 'Découverte des concepts fondamentaux des algorithmes',
          duration: '2h 30min',
          exercisesIds: ['exo_1_chapter_1', 'exo_2_chapter_1'],
        },
        {
          id: 'chapter_2_maths_algo_2',
          courseId: courseId,
          title: 'Algorithmes Avancés',
          order: 2,
          description: 'Approfondissement des techniques algorithmiques',
          duration: '3h 15min',
          exercisesIds: ['exo_1_chapter_2', 'exo_2_chapter_2'],
        },
        {
          id: 'chapter_3_maths_algo_2',
          courseId: courseId,
          title: 'Applications Pratiques',
          order: 3,
          description: 'Mise en pratique des algorithmes sur des cas concrets',
          duration: '4h 00min',
          exercisesIds: ['exo_1_chapter_3', 'exo_2_chapter_3'],
        },
      ];

      // 2. Créer les exercices
      const exercises = [
        // Exercices pour le chapitre 1
        {
          id: 'exo_1_chapter_1',
          chapterId: 'chapter_1_maths_algo_2',
          courseId: courseId,
          title: "Exercice d'introduction aux algorithmes",
          type: 'qcm',
          difficulty: 'facile',
          duration: '15min',
          questions: [
            {
              id: 'q1',
              question: "Qu'est-ce qu'un algorithme ?",
              type: 'multiple_choice',
              options: [
                'Un langage de programmation',
                "Une suite d'instructions pour résoudre un problème",
                'Un type de donnée',
                'Une fonction mathématique',
              ],
              correctAnswer: 1,
            },
            {
              id: 'q2',
              question: 'Quelle est la complexité de la recherche linéaire ?',
              type: 'multiple_choice',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'exo_2_chapter_1',
          chapterId: 'chapter_1_maths_algo_2',
          courseId: courseId,
          title: 'Exercice sur les boucles',
          type: 'code',
          difficulty: 'moyen',
          duration: '25min',
          instructions:
            "Écrivez un algorithme qui calcule la factorielle d'un nombre",
          templateCode: `function factorielle(n) {
  // Votre code ici
}`,
          testCases: [
            { input: 5, expected: 120 },
            { input: 0, expected: 1 },
            { input: 7, expected: 5040 },
          ],
        },

        // Exercices pour le chapitre 2
        {
          id: 'exo_1_chapter_2',
          chapterId: 'chapter_2_maths_algo_2',
          courseId: courseId,
          title: 'Exercice sur les tris',
          type: 'qcm',
          difficulty: 'moyen',
          duration: '20min',
          questions: [
            {
              id: 'q1',
              question:
                'Quel algorithme de tri a une complexité O(n log n) dans le pire cas ?',
              type: 'multiple_choice',
              options: [
                'Tri à bulles',
                'Tri rapide',
                'Tri par insertion',
                'Tri par sélection',
              ],
              correctAnswer: 1,
            },
          ],
        },
        {
          id: 'exo_2_chapter_2',
          chapterId: 'chapter_2_maths_algo_2',
          courseId: courseId,
          title: 'Implémentation du tri rapide',
          type: 'code',
          difficulty: 'difficile',
          duration: '35min',
          instructions: "Implémentez l'algorithme de tri rapide (QuickSort)",
          templateCode: `function quickSort(arr) {
  // Votre code ici
}`,
          testCases: [
            { input: [3, 1, 4, 2], expected: [1, 2, 3, 4] },
            { input: [5, 2, 8, 1, 9], expected: [1, 2, 5, 8, 9] },
          ],
        },

        // Exercices pour le chapitre 3
        {
          id: 'exo_1_chapter_3',
          chapterId: 'chapter_3_maths_algo_2',
          courseId: courseId,
          title: 'Problème du plus court chemin',
          type: 'qcm',
          difficulty: 'difficile',
          duration: '30min',
          questions: [
            {
              id: 'q1',
              question:
                'Quel algorithme utilise-t-on pour trouver le plus court chemin dans un graphe pondéré ?',
              type: 'multiple_choice',
              options: ['BFS', 'DFS', 'Dijkstra', 'Tri topologique'],
              correctAnswer: 2,
            },
          ],
        },
        {
          id: 'exo_2_chapter_3',
          chapterId: 'chapter_3_maths_algo_2',
          courseId: courseId,
          title: 'Implémentation de Dijkstra',
          type: 'code',
          difficulty: 'avancé',
          duration: '45min',
          instructions:
            "Implémentez l'algorithme de Dijkstra pour trouver le plus court chemin",
          templateCode: `function dijkstra(graph, start) {
  // Votre code ici
}`,
          testCases: [
            {
              input: {
                graph: { A: { B: 1, C: 4 }, B: { C: 2 }, C: {} },
                start: 'A',
              },
              expected: { A: 0, B: 1, C: 3 },
            },
          ],
        },
      ];

      // 3. Sauvegarder les chapitres dans Firestore
      for (const chapter of chapters) {
        const chapterRef = doc(
          collection(this.firestore, 'chapters'),
          chapter.id
        );
        await setDoc(chapterRef, chapter);
        console.log(`✅ Chapitre créé: ${chapter.title}`);
      }

      // 4. Sauvegarder les exercices dans Firestore
      for (const exercise of exercises) {
        const exerciseRef = doc(
          collection(this.firestore, 'exercises'),
          exercise.id
        );
        await setDoc(exerciseRef, exercise);
        console.log(`✅ Exercice créé: ${exercise.title}`);
      }

      // 5. Mettre à jour le cours avec les références aux chapitres
      const courseRef = doc(collection(this.firestore, 'courses'), courseId);
      await updateDoc(courseRef, {
        chaptersIds: chapters.map((ch) => ch.id),
        updatedAt: new Date(),
      });

      console.log('🎉 Toutes les fixtures ont été créées avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la création des fixtures:', error);
    }
  }

  async createLessonsFixtures() {
    try {
      const courseId = 'maths_algo_2';
      const chapterId = 'chapter_1_maths_algo_2';

      const lessons = [
        {
          id: 'lesson_1_chapter_2',
          title: 'Introduction aux Algorithmes',
          type: 'video',
          duration: '3:25',
          order: 1,
        },
        {
          id: 'lesson_2_chapter_2',
          title: 'Les Structures Conditionnelles',
          type: 'video',
          duration: '4:25',
          order: 2,
        },
        {
          id: 'lesson_3_chapter_3',
          title: 'Boucles et Répétitions',
          type: 'video',
          duration: '5:00',
          order: 3,
        },
      ];

      const lessonsIds: string[] = [];

      for (const lesson of lessons) {
        const lessonRef = doc(collection(this.firestore, 'lessons'), lesson.id);

        await setDoc(lessonRef, {
          ...lesson,
          courseId,
          chapterId,
        });

        lessonsIds.push(lesson.id);
      }

      // 🔥 Mise à jour du chapitre
      const chapterRef = doc(this.firestore, 'chapters', chapterId);

      await updateDoc(chapterRef, {
        lessonsIds,
      });

      console.log('Fixtures leçons créées !');
    } catch (error) {
      console.error('Erreur fixtures leçons :', error);
    }
  }
}