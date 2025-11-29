import { Injectable, inject } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { Course } from 'src/app/models/course.model';
import { firstValueFrom } from 'rxjs';

interface Expertise {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class InitializationService {
  private readonly api = inject(ApiService);
  private readonly FIXTURES_LOADED_KEY = 'myschool_fixtures_v3_api';

  async loadFixturesInBackground(): Promise<void> {
    console.log('🔧 [FIXTURES] Démarrage du chargement...');

    // Vérifier si déjà chargé
    if (this.areFixturesLoaded()) {
      console.log('ℹ️ [FIXTURES] Déjà chargées (skipped)');
      return;
    }

    console.log('🔄 [FIXTURES] Chargement des données via API...');

    try {
      await this.createCoursesFixtures();
      await this.seedExpertises();
      await this.seedInstructors();
      this.markFixturesAsLoaded();
      console.log('✅ [FIXTURES] Chargement terminé avec succès');
    } catch (error) {
      console.error('❌ [FIXTURES] Erreur:', error);
    }
  }

  private async createCoursesFixtures(): Promise<void> {
    console.log('📚 [FIXTURES] Création des cours via API...');

    const courses = [
      {
        id: 'maths_algo_1',
        title: 'Algorithme',
        category: 'Maths au collège',
        description: "Cours d'algorithmique pour collégiens",
        level: 'DEBUTANT' as const,
        type: 'En ligne' as const,
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
        chapters: [],
      },
      {
        id: 'maths_algo_2',
        title: 'Algorithme Avancé',
        category: 'Maths au collège',
        description: 'Algorithmique niveau avancé',
        level: 'INTERMEDIAIRE' as const,
        type: 'En ligne' as const,
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
        chapters: [],
      },
      {
        id: 'pc_physique_1',
        title: 'Physique',
        category: 'PC au collège',
        description: 'Cours de physique fondamentale',
        level: 'DEBUTANT' as const,
        type: 'VIDEO' as const,
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
        chapters: [],
      },
      {
        id: 'pc_chimie_1',
        title: 'Chimie',
        category: 'PC au collège',
        description: 'Introduction à la chimie',
        level: 'DEBUTANT' as const,
        type: 'VIDEO' as const,
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
        chapters: [],
      },
      {
        id: 'svt_organes_1',
        title: 'Les Organes',
        category: 'Sciences de la Vie et de la Terre',
        description: 'Étude des organes humains',
        level: 'DEBUTANT' as const,
        type: 'En ligne' as const,
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
        chapters: [],
      },
      {
        id: 'svt_ecosysteme_1',
        title: "L'écosystème",
        category: 'Sciences de la Vie et de la Terre',
        description: 'Comprendre les écosystèmes',
        level: 'INTERMEDIAIRE' as const,
        type: 'En ligne' as const,
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
        chapters: [],
      },
    ];

    let createdCount = 0;

    for (const course of courses) {
      try {
        await firstValueFrom(this.api.post('/courses', course));
        console.log(`✅ [FIXTURES] Créé: ${course.title}`);
        createdCount++;
      } catch (error: any) {
        if (error?.status === 409) {
          console.log(`ℹ️ [FIXTURES] Existe déjà: ${course.title}`);
        } else {
          console.error(`❌ [FIXTURES] Erreur avec ${course.title}:`, error);
        }
      }
    }

    console.log(`📊 [FIXTURES] ${createdCount}/${courses.length} cours créés`);
  }

  async seedExpertises(): Promise<void> {
    console.log('🎓 [FIXTURES] Création des expertises via API...');

    const expertises: Expertise[] = [
      {
        id: 'angular',
        name: 'Angular',
        description:
          'Framework moderne utilisé dans les entreprises pour créer des applications web complexes.',
      },
      {
        id: 'react',
        name: 'React',
        description:
          'Bibliothèque JavaScript utilisée pour créer des interfaces rapides et dynamiques.',
      },
      {
        id: 'node',
        name: 'Node.js',
        description:
          'JavaScript côté serveur, idéal pour des APIs modernes et performantes.',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        description:
          'Surcouche de JavaScript avec typage fort. Standard pour les projets professionnels.',
      },
      {
        id: 'ionic',
        name: 'Ionic',
        description:
          'Framework mobile hybride pour créer des applications iOS et Android.',
      },
      {
        id: 'firebase',
        name: 'Firebase',
        description:
          'Plateforme Google pour apps temps réel avec authentification, base de données et hosting.',
      },
      {
        id: 'aws',
        name: 'AWS',
        description: 'Leader mondial du cloud computing.',
      },
      {
        id: 'kubernetes',
        name: 'Kubernetes',
        description: 'Orchestration de conteneurs à grande échelle.',
      },
      {
        id: 'python',
        name: 'Python',
        description:
          "Langage simple et puissant, utilisé dans l'IA, data-science et automatisation.",
      },
      {
        id: 'algorithmie',
        name: 'Algorithmie',
        description:
          'Logique, raisonnement, résolution de problèmes mathématiques et informatiques.',
      },
    ];

    let createdCount = 0;

    for (const expertise of expertises) {
      try {
        await firstValueFrom(this.api.post('/expertise', expertise));
        console.log(`✅ [FIXTURES] Expertise créée: ${expertise.name}`);
        createdCount++;
      } catch (error: any) {
        if (error?.status === 409) {
          console.log(`ℹ️ [FIXTURES] Expertise existe déjà: ${expertise.name}`);
        } else {
          console.error(`❌ [FIXTURES] Erreur avec ${expertise.name}:`, error);
        }
      }
    }

    console.log(`📊 [FIXTURES] ${createdCount}/${expertises.length} expertises créées`);
  }

  async seedInstructors(): Promise<void> {
    console.log('👨‍🏫 [FIXTURES] Création des instructeurs via API...');

    // Récupérer tous les cours existants via l'API
    const courses = await firstValueFrom(this.api.get<Course[]>('/courses'));
    console.log('📚 Cours détectés :', courses.length);

    // Sélection de cours par catégorie
    const algoCourses = courses.filter((c) => c.category === 'Maths au collège');
    const webCourses = courses.filter(
      (c) => c.category === 'Sciences de la Vie et de la Terre'
    );

    const instructors = [
      {
        id: 'kaye',
        name: 'KAYE',
        title: 'Expert Web & Mobile',
        image: 'assets/profs/kaye.jpg',
        backgroundColor: '#0066ff',
        rating: 4.8,
        expertiseIds: ['angular', 'react', 'ionic', 'typescript'],
        coursesIds: webCourses.slice(0, 2).map((c) => c.id),
        bio: "Développeur depuis 10 ans, passionné par la création d'applications modernes.",
      },
      {
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
      {
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
      {
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
      {
        id: 'sow',
        name: 'SOW',
        title: 'Développeur Full-Stack',
        image: 'assets/profs/sow.jpg',
        backgroundColor: '#22aaaa',
        rating: 4.8,
        expertiseIds: ['react', 'firebase'],
        coursesIds: webCourses.slice(0, 3).map((c) => c.id),
        bio: "Développeur full-stack passionné par l'enseignement.",
      },
    ];

    let createdCount = 0;

    for (const instructor of instructors) {
      try {
        await firstValueFrom(this.api.post('/instructors', instructor));
        console.log(`✅ [FIXTURES] Instructeur créé: ${instructor.name}`);
        createdCount++;
      } catch (error: any) {
        if (error?.status === 409) {
          console.log(`ℹ️ [FIXTURES] Instructeur existe déjà: ${instructor.name}`);
        } else {
          console.error(`❌ [FIXTURES] Erreur avec ${instructor.name}:`, error);
        }
      }
    }

    console.log(`📊 [FIXTURES] ${createdCount}/${instructors.length} instructeurs créés`);
  }

  async createCourseFixtures(): Promise<void> {
    console.log('📖 [FIXTURES] Création des chapitres et exercices via API...');

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
          templateCode: `function factorielle(n) {\n  // Votre code ici\n}`,
          testCases: [
            { input: 5, expected: 120 },
            { input: 0, expected: 1 },
            { input: 7, expected: 5040 },
          ],
        },
      ];

      // 3. Sauvegarder les chapitres via l'API
      for (const chapter of chapters) {
        try {
          await firstValueFrom(this.api.post('/chapters', chapter));
          console.log(`✅ [FIXTURES] Chapitre créé: ${chapter.title}`);
        } catch (error: any) {
          if (error?.status === 409) {
            console.log(`ℹ️ [FIXTURES] Chapitre existe déjà: ${chapter.title}`);
          } else {
            console.error(`❌ [FIXTURES] Erreur chapitre:`, error);
          }
        }
      }

      // 4. Sauvegarder les exercices via l'API
      for (const exercise of exercises) {
        try {
          await firstValueFrom(this.api.post('/exercises', exercise));
          console.log(`✅ [FIXTURES] Exercice créé: ${exercise.title}`);
        } catch (error: any) {
          if (error?.status === 409) {
            console.log(`ℹ️ [FIXTURES] Exercice existe déjà: ${exercise.title}`);
          } else {
            console.error(`❌ [FIXTURES] Erreur exercice:`, error);
          }
        }
      }

      // 5. Mettre à jour le cours avec les références aux chapitres
      try {
        await firstValueFrom(
          this.api.put(`/courses/${courseId}`, {
            chaptersIds: chapters.map((ch) => ch.id),
            updatedAt: new Date(),
          })
        );
        console.log('✅ [FIXTURES] Cours mis à jour avec les chapitres');
      } catch (error) {
        console.error('❌ [FIXTURES] Erreur mise à jour cours:', error);
      }

      console.log('🎉 [FIXTURES] Chapitres et exercices créés avec succès !');
    } catch (error) {
      console.error('❌ [FIXTURES] Erreur lors de la création des fixtures:', error);
    }
  }

  async createLessonsFixtures(): Promise<void> {
    console.log('📝 [FIXTURES] Création des leçons via API...');

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
          courseId,
          chapterId,
          isCompleted: false,
        },
        {
          id: 'lesson_2_chapter_2',
          title: 'Les Structures Conditionnelles',
          type: 'video',
          duration: '4:25',
          order: 2,
          courseId,
          chapterId,
          isCompleted: false,
        },
        {
          id: 'lesson_3_chapter_3',
          title: 'Boucles et Répétitions',
          type: 'video',
          duration: '5:00',
          order: 3,
          courseId,
          chapterId,
          isCompleted: false,
        },
      ];

      const lessonsIds: string[] = [];

      for (const lesson of lessons) {
        try {
          await firstValueFrom(this.api.post('/lessons', lesson));
          lessonsIds.push(lesson.id);
          console.log(`✅ [FIXTURES] Leçon créée: ${lesson.title}`);
        } catch (error: any) {
          if (error?.status === 409) {
            console.log(`ℹ️ [FIXTURES] Leçon existe déjà: ${lesson.title}`);
            lessonsIds.push(lesson.id);
          } else {
            console.error(`❌ [FIXTURES] Erreur leçon:`, error);
          }
        }
      }

      // Mise à jour du chapitre avec les leçons
      try {
        await firstValueFrom(
          this.api.put(`/chapters/${chapterId}`, {
            lessonsIds,
          })
        );
        console.log('✅ [FIXTURES] Chapitre mis à jour avec les leçons');
      } catch (error) {
        console.error('❌ [FIXTURES] Erreur mise à jour chapitre:', error);
      }

      console.log('🎉 [FIXTURES] Leçons créées avec succès !');
    } catch (error) {
      console.error('❌ [FIXTURES] Erreur création leçons:', error);
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
      apiAvailable: !!this.api,
      localStorageKey: this.FIXTURES_LOADED_KEY,
    };
  }

  forceReload(): void {
    console.log('🔄 [FIXTURES] Forcer le rechargement...');
    localStorage.removeItem(this.FIXTURES_LOADED_KEY);
    this.loadFixturesInBackground();
  }
}
