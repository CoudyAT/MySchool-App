import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Observable, from, map, switchMap, forkJoin, catchError } from 'rxjs';
import { Chapter, Exercise, Lesson } from 'src/app/models/course.model';



@Injectable({
  providedIn: 'root',
})
export class ChapterService {
  constructor(private firestore: Firestore) {}

  // NOUVELLE MÉTHODE: Récupérer tous les chapitres avec leurs exercices transformés en leçons
  //   getChaptersWithExercises(courseId: string): Observable<Chapter[]> {
  //     return from(getDoc(doc(this.firestore, 'courses', courseId))).pipe(
  //       switchMap((courseDoc) => {
  //         if (!courseDoc.exists()) {
  //           throw new Error('Cours non trouvé');
  //         }

  //         const courseData = courseDoc.data();
  //         console.log('course', courseData);

  //         const chaptersIds = courseData['chaptersIds'] || [];

  //         console.log('📋 IDs des chapitres trouvés:', chaptersIds);

  //         if (chaptersIds.length === 0) {
  //           console.log('ℹ️ Aucun chapitre trouvé pour ce cours');
  //           return from(Promise.resolve([]));
  //         }

  //         // 2. Récupérer chaque chapitre par son ID
  //         const chapterObservables: Observable<
  //           (Chapter & { lessons: Lesson[] }) | null
  //         >[] = chaptersIds.map((chapterId: string) =>
  //           from(getDoc(doc(this.firestore, 'chapters', chapterId))).pipe(
  //             switchMap((chapterDoc) => {
  //               if (!chapterDoc.exists()) {
  //                 console.warn(`❌ Chapitre ${chapterId} non trouvé`);
  //                 return from(Promise.resolve(null));
  //               }

  //               const chapter = {
  //                 id: chapterDoc.id,
  //                 ...chapterDoc.data(),
  //               } as Chapter;

  //               console.log(`✅ Chapitre chargé: ${chapter.title}`);

  //               // 3. Récupérer les exercices du chapitre
  //               return this.getExercisesByChapter(chapter.id).pipe(
  //                 map((exercises) => ({
  //                   ...chapter,
  //                  // lessons: this.transformExercisesToLessons(exercises),
  //                 }))
  //               );
  //             })
  //           )
  //         );

  //         return forkJoin(chapterObservables).pipe(
  //           map((chapters: ((Chapter & { lessons: Lesson[] }) | null)[]) => {
  //             // Version simplifiée sans type complexe
  //             const validChapters: (Chapter & { lessons: Lesson[] })[] = [];
  //             chapters.forEach((chapter) => {
  //               if (chapter !== null) {
  //                 validChapters.push(chapter);
  //               }
  //             });
  //             console.log(`🎯 ${validChapters.length} chapitres valides chargés`);
  //             return validChapters;
  //           })
  //         );
  //       })
  //     );
  //   }

  getChaptersWithExercises(courseId: string): Observable<Chapter[]> {
    return from(getDoc(doc(this.firestore, 'courses', courseId))).pipe(
      switchMap((courseDoc) => {
        if (!courseDoc.exists()) throw new Error('Cours non trouvé');

        const courseData = courseDoc.data();
        const chaptersIds: string[] = courseData['chaptersIds'] || [];

        if (chaptersIds.length === 0) return from(Promise.resolve([]));

        const chapterRequests = chaptersIds.map((chapterId) =>
          from(getDoc(doc(this.firestore, 'chapters', chapterId))).pipe(
            switchMap((chapterDoc) => {
              if (!chapterDoc.exists()) return from(Promise.resolve(null));

              const chapter = {
                id: chapterDoc.id,
                ...chapterDoc.data(),
              } as Chapter;

              const lessonsIds: string[] = chapter['lessonsIds'] || [];
              const exercisesIds: string[] = chapter['exercisesIds'] || [];

              // 🔥 1. Charger LESSONS
              const lessonsReq = lessonsIds.length
                ? forkJoin(
                    lessonsIds.map((id) =>
                      from(getDoc(doc(this.firestore, 'lessons', id))).pipe(
                        map((l) => ({ id: l.id, ...l.data() } as Lesson))
                      )
                    )
                  )
                : from(Promise.resolve([]));

              // 🔥 2. Charger EXERCISES
              const exercisesReq = exercisesIds.length
                ? forkJoin(
                    exercisesIds.map((id) =>
                      from(getDoc(doc(this.firestore, 'exercises', id))).pipe(
                        map((e) => ({ id: e.id, ...e.data() } as Exercise))
                      )
                    )
                  )
                : from(Promise.resolve([]));

              // 🔥 3. Combiner les deux
              return forkJoin([lessonsReq, exercisesReq]).pipe(
                map(([lessons, exercises]) => ({
                  ...chapter,
                  lessons,
                  exercises,
                }))
              );
            })
          )
        );

        return forkJoin(chapterRequests).pipe(
          map((chapters) => chapters.filter((c) => c !== null) as Chapter[])
        );
      })
    );
  }

  // Transformer les exercices en leçons pour l'affichage
  private transformExercisesToLessons(exercises: Exercise[]): Lesson[] {
    return exercises.map(
      (exercise, index) =>
        ({
          id: exercise.id,
          title: exercise.title,
          type: 'exercise', // Tous sont des exercices pour l'instant
          duration: exercise.duration,
          isCompleted: false, // Par défaut
          order: index + 1,
          passed: false, // Par défaut
          score: 'À compléter',
          instructions: exercise.instructions,
          templateCode: exercise.templateCode,
          testCases: exercise.testCases,
          questions: exercise.questions,
        } as Lesson)
    );
  }

  // Récupérer tous les chapitres d'un cours
  getChaptersByCourse(courseId: string): Observable<Chapter[]> {
    const chaptersRef = collection(this.firestore, 'chapters');
    const q = query(
      chaptersRef,
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Chapter)
        )
      )
    );
  }

  // Récupérer un chapitre avec ses exercices
  getChapterWithExercises(
    chapterId: string
  ): Observable<{ chapter: Chapter; exercises: Exercise[] }> {
    return from(getDoc(doc(this.firestore, 'chapters', chapterId))).pipe(
      switchMap((chapterDoc) => {
        if (!chapterDoc.exists()) {
          throw new Error('Chapitre non trouvé');
        }

        const chapter = {
          id: chapterDoc.id,
          ...chapterDoc.data(),
        } as Chapter;

        // Récupérer les exercices du chapitre
        const exercisesRef = collection(this.firestore, 'exercises');
        const q = query(
          exercisesRef,
          where('chapterId', '==', chapterId),
          orderBy('title', 'asc')
        );

        return from(getDocs(q)).pipe(
          map((exercisesSnapshot) => ({
            chapter,
            exercises: exercisesSnapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as Exercise)
            ),
          }))
        );
      })
    );
  }

  // Récupérer tous les exercices d'un chapitre
  getExercisesByChapter(chapterId: string): Observable<Exercise[]> {
    console.log(`🔍 Début getExercisesByChapter, chapterId: ${chapterId}`);

    const exercisesRef = collection(this.firestore, 'exercises');
    console.log('exo', exercisesRef);

    const q = query(
      exercisesRef,
      where('chapterId', '==', chapterId)
      // orderBy('title', 'asc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        console.log(`📄 Snapshot reçu, size: ${snapshot.size}`);

        const exercises = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(`📝 Exercice ${doc.id}:`, data);
          return {
            id: doc.id,
            ...data,
          } as Exercise;
        });

        console.log(
          `📚 ${exercises.length} exercices trouvés pour le chapitre ${chapterId}`
        );
        return exercises;
      }),
      catchError((error) => {
        console.error(
          `💥 Erreur getExercisesByChapter pour ${chapterId}:`,
          error
        );
        return from(Promise.resolve([]));
      })
    );
  }
}
export { Lesson };

