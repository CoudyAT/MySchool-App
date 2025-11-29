# 🔄 Refactoring Frontend - Migration vers API REST

## 📝 Résumé des modifications

Ce refactoring migre l'application MySchool d'une architecture utilisant directement Firebase/Firestore vers une architecture REST API.

---

## ✅ Fichiers créés

### 1. **Service API de base**
📁 `src/app/core/services/api.service.ts`
- Service centralisé pour tous les appels HTTP
- Méthodes: `get()`, `post()`, `put()`, `delete()`
- Gestion automatique des headers

### 2. **Intercepteur d'erreurs**
📁 `src/app/core/interceptors/error.interceptor.ts`
- Gestion globale des erreurs HTTP
- Messages d'erreur personnalisés par code de statut
- Logging des erreurs dans la console

### 3. **Nouveaux modèles TypeScript**
- 📁 `src/app/models/user.model.ts` - Interface User complète
- 📁 `src/app/models/lesson.model.ts` - Interface Lesson
- 📁 `src/app/models/exercise.model.ts` - Interface Exercise

---

## 🔧 Fichiers modifiés

### 1. **Configuration Environment**
📁 `src/environments/environment.ts`
```typescript
// Ajout de l'URL de l'API REST
apiUrl: 'https://us-central1-myschool-f862b.cloudfunctions.net/api'
```

### 2. **Main Bootstrap**
📁 `src/main.ts`
- Ajout de `provideHttpClient()`
- Enregistrement de l'intercepteur d'erreurs
- Configuration HTTP_INTERCEPTORS

### 3. **Services refactorisés**

#### CourseService
📁 `src/app/features/services/courseService.ts`
**Avant:** Firebase Firestore direct
**Après:** Appels REST API

**Nouvelles méthodes:**
- `getAllCourses()` - Tous les cours
- `createCourse()` - Créer un cours
- `updateCourse()` - Modifier un cours
- `deleteCourse()` - Supprimer un cours
- `getCourseStudents()` - Étudiants d'un cours

#### ChapterService
📁 `src/app/features/services/chapter.service.ts`
**Avant:** Requêtes Firestore complexes avec `forkJoin`
**Après:** Endpoints REST simples

**Nouvelles méthodes:**
- `getChapterById()` - Un chapitre par ID
- `getLessonsByChapter()` - Leçons d'un chapitre
- `createChapter()` - Créer un chapitre
- `updateChapter()` - Modifier un chapitre
- `deleteChapter()` - Supprimer un chapitre

#### EnrollmentService
📁 `src/app/features/services/enrollmentService.ts`
**Avant:** `addDoc`, `getDocs`, `updateDoc` Firestore
**Après:** API REST `/enrollments`

**Modifications:**
- Conservation de la logique localStorage pour `currentUser`
- Appels API asynchrones avec `.toPromise()`
- Gestion des détails de cours via endpoint séparé

#### InstructorService
📁 `src/app/features/services/instructorService.ts`
**Avant:** Requêtes Firestore avec navigation manuelle
**Après:** Endpoints REST `/instructors`

**Nouvelles méthodes:**
- `getInstructorStudents()` - Étudiants d'un instructeur
- `createInstructor()` - Créer un instructeur
- `updateInstructor()` - Modifier un instructeur
- `deleteInstructor()` - Supprimer un instructeur

---

## 🗺️ Mapping des endpoints utilisés

### Courses
- `GET /courses/published` → Cours publiés
- `GET /courses` → Tous les cours
- `GET /courses/:id` → Un cours
- `GET /courses/category/:category` → Par catégorie
- `GET /courses/level/:level` → Par niveau
- `POST /courses` → Créer
- `PUT /courses/:id` → Modifier
- `DELETE /courses/:id` → Supprimer
- `GET /courses/:id/students` → Étudiants inscrits

### Chapters
- `GET /chapters/course/:courseId` → Chapitres d'un cours
- `GET /chapters/:id` → Un chapitre
- `POST /chapters` → Créer
- `PUT /chapters/:id` → Modifier
- `DELETE /chapters/:id` → Supprimer

### Lessons
- `GET /lessons/chapter/:chapterId` → Leçons d'un chapitre

### Exercises
- `GET /exercises/chapter/:chapterId` → Exercices d'un chapitre

### Enrollments
- `GET /enrollments/student/:studentId` → Inscriptions d'un étudiant
- `GET /enrollments/:id` → Une inscription
- `POST /enrollments` → Créer inscription
- `PUT /enrollments/:id` → Modifier progression

### Instructors
- `GET /instructors` → Tous les instructeurs
- `GET /instructors/:id` → Un instructeur
- `GET /instructors/:id/courses` → Cours d'un instructeur
- `GET /instructors/:id/students` → Étudiants d'un instructeur
- `POST /instructors` → Créer
- `PUT /instructors/:id` → Modifier
- `DELETE /instructors/:id` → Supprimer

### Users
- `PUT /users/:id` → Modifier utilisateur (pour Premium)

---

## ⚠️ Points d'attention

### 1. **Authentification**
- L'authentification Firebase Auth est **conservée** pour le signup/login
- La gestion des utilisateurs passe progressivement par l'API REST
- Le `localStorage` continue de stocker `currentUser`

### 2. **Migration progressive**
- Les composants utilisant les anciens services fonctionneront sans modification
- Les méthodes conservent les mêmes signatures (Observable)
- Compatibilité ascendante maintenue

### 3. **Gestion d'erreurs**
- Toutes les erreurs HTTP sont interceptées
- Messages utilisateur plus explicites
- Logs détaillés dans la console

### 4. **Environnement**
- **Development:** URL API Cloud Functions
- **Production:** À configurer dans `environment.prod.ts`

---

## 🚀 Prochaines étapes recommandées

### Immédiat
1. ✅ Tester tous les services avec l'API déployée
2. ✅ Vérifier les CORS sur Cloud Functions
3. ✅ Valider les endpoints avec Postman/Swagger

### Court terme
1. Migrer les composants Admin vers la nouvelle API
2. Ajouter un système de cache (localStorage/IndexedDB)
3. Implémenter le retry automatique pour les requêtes échouées
4. Ajouter un loader global pendant les appels API

### Moyen terme
1. Implémenter l'authentification JWT avec l'API
2. Ajouter des guards pour protéger les routes
3. Mettre en place un système de pagination
4. Optimiser les requêtes (lazy loading, infinite scroll)

### Long terme
1. Migration complète de Firebase Auth vers API custom
2. Implémentation PWA avec offline-first
3. Synchronisation bidirectionnelle
4. Analytics et monitoring

---

## 📊 Comparaison avant/après

### Avant (Firebase direct)
```typescript
// Exemple: Récupérer les cours
const coursesRef = collection(this.firestore, 'courses');
const q = query(coursesRef, where('isPublished', '==', true));
return collectionData(q, { idField: 'id' }) as Observable<Course[]>;
```

### Après (API REST)
```typescript
// Même résultat, plus simple
return this.api.get<Course[]>('/courses/published');
```

**Avantages:**
- ✅ Code plus simple et lisible
- ✅ Moins de dépendances Firebase dans le frontend
- ✅ Testabilité améliorée (mock des API facile)
- ✅ Flexibilité backend (changement de BDD transparent)
- ✅ Sécurité renforcée (logique métier côté serveur)

---

## 🐛 Debugging

### Vérifier que l'API fonctionne
```bash
# Test endpoint courses
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/courses/published
```

### Vérifier les logs
```typescript
// Dans la console du navigateur
console.log('API URL:', environment.apiUrl);
```

### Tester un endpoint
```typescript
// Dans un composant
this.api.get('/courses').subscribe({
  next: (data) => console.log('✅ API OK:', data),
  error: (err) => console.error('❌ API Error:', err)
});
```

---

## 📞 Support

En cas de problème:
1. Vérifier que l'API backend est déployée
2. Vérifier les CORS (ports 4200-4205 autorisés)
3. Consulter les logs Firebase Functions: `firebase functions:log`
4. Vérifier la console du navigateur pour les erreurs HTTP

---

**Date de refactoring:** 29 novembre 2025  
**Version:** 1.0.0  
**Status:** ✅ Complété
