# 🚀 Guide de Migration - Firebase vers API REST

## 📋 Checklist de migration

### ✅ Étape 1: Configuration
- [x] Créer `ApiService` dans `src/app/core/services/`
- [x] Ajouter `apiUrl` dans `environment.ts`
- [x] Configurer `HttpClient` dans `main.ts`
- [x] Créer l'intercepteur d'erreurs HTTP

### ✅ Étape 2: Services refactorisés
- [x] CourseService
- [x] ChapterService
- [x] EnrollmentService
- [x] InstructorService

### ⏳ Étape 3: Services Admin (à faire)
- [ ] Admin CourseService
- [ ] InitializationService

### ⏳ Étape 4: Tests
- [ ] Tester tous les endpoints
- [ ] Vérifier les CORS
- [ ] Valider les flux utilisateurs

---

## 🔄 Comment migrer un service

### Avant (Firebase)
```typescript
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExampleService {
  private readonly firestore = inject(Firestore);

  getItems(): Observable<Item[]> {
    const itemsRef = collection(this.firestore, 'items');
    return collectionData(itemsRef, { idField: 'id' }) as Observable<Item[]>;
  }
}
```

### Après (API REST)
```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class ExampleService {
  private readonly api = inject(ApiService);

  getItems(): Observable<Item[]> {
    return this.api.get<Item[]>('/items');
  }
}
```

---

## 📝 Patterns de migration

### 1. GET simple
```typescript
// Avant
const docRef = doc(this.firestore, 'collection', id);
return docData(docRef, { idField: 'id' });

// Après
return this.api.get(`/collection/${id}`);
```

### 2. GET avec query
```typescript
// Avant
const ref = collection(this.firestore, 'items');
const q = query(ref, where('status', '==', 'active'));
return collectionData(q, { idField: 'id' });

// Après
return this.api.get('/items/status/active');
```

### 3. POST
```typescript
// Avant
const ref = collection(this.firestore, 'items');
const docRef = await addDoc(ref, data);
return docRef.id;

// Après
const response = await this.api.post('/items', data).toPromise();
return response?.id;
```

### 4. PUT
```typescript
// Avant
const docRef = doc(this.firestore, 'items', id);
await updateDoc(docRef, updates);

// Après
await this.api.put(`/items/${id}`, updates).toPromise();
```

### 5. DELETE
```typescript
// Avant
const docRef = doc(this.firestore, 'items', id);
await deleteDoc(docRef);

// Après
await this.api.delete(`/items/${id}`).toPromise();
```

---

## 🎯 Endpoints disponibles

### Courses
- `GET /courses` - Tous les cours
- `GET /courses/published` - Cours publiés
- `GET /courses/:id` - Un cours
- `GET /courses/category/:category` - Par catégorie
- `GET /courses/level/:level` - Par niveau
- `POST /courses` - Créer
- `PUT /courses/:id` - Modifier
- `DELETE /courses/:id` - Supprimer

### Chapters
- `GET /chapters` - Tous les chapitres
- `GET /chapters/:id` - Un chapitre
- `GET /chapters/course/:courseId` - Chapitres d'un cours
- `POST /chapters` - Créer
- `PUT /chapters/:id` - Modifier
- `DELETE /chapters/:id` - Supprimer

### Lessons
- `GET /lessons` - Toutes les leçons
- `GET /lessons/:id` - Une leçon
- `GET /lessons/chapter/:chapterId` - Leçons d'un chapitre
- `GET /lessons/type/:type` - Par type
- `POST /lessons` - Créer
- `PUT /lessons/:id` - Modifier
- `DELETE /lessons/:id` - Supprimer

### Exercises
- `GET /exercises` - Tous les exercices
- `GET /exercises/:id` - Un exercice
- `GET /exercises/chapter/:chapterId` - Exercices d'un chapitre
- `GET /exercises/type/:type` - Par type
- `GET /exercises/difficulty/:difficulty` - Par difficulté
- `POST /exercises` - Créer
- `PUT /exercises/:id` - Modifier
- `DELETE /exercises/:id` - Supprimer

### Enrollments
- `GET /enrollments` - Toutes les inscriptions
- `GET /enrollments/:id` - Une inscription
- `GET /enrollments/student/:studentId` - Par étudiant
- `GET /enrollments/course/:courseId` - Par cours
- `POST /enrollments` - Créer
- `PUT /enrollments/:id` - Modifier
- `DELETE /enrollments/:id` - Supprimer

### Instructors
- `GET /instructors` - Tous les instructeurs
- `GET /instructors/:id` - Un instructeur
- `GET /instructors/:id/courses` - Cours d'un instructeur
- `GET /instructors/:id/students` - Étudiants d'un instructeur
- `POST /instructors` - Créer
- `PUT /instructors/:id` - Modifier
- `DELETE /instructors/:id` - Supprimer

### Users
- `GET /users` - Tous les utilisateurs
- `GET /users/:id` - Un utilisateur
- `GET /users/email/:email` - Par email
- `GET /users/role/:role` - Par rôle
- `POST /users` - Créer
- `PUT /users/:id` - Modifier
- `DELETE /users/:id` - Supprimer

---

## ⚠️ Points d'attention

### 1. toPromise() est déprécié
```typescript
// ❌ Déprécié (mais fonctionne)
const data = await this.api.get('/items').toPromise();

// ✅ Recommandé (RxJS 7+)
import { firstValueFrom } from 'rxjs';
const data = await firstValueFrom(this.api.get('/items'));
```

### 2. Gestion des erreurs
```typescript
// ✅ Avec gestion d'erreur
this.api.get('/items').subscribe({
  next: (data) => console.log(data),
  error: (err) => console.error('Erreur:', err)
});
```

### 3. Optional chaining
```typescript
// ❌ Ancien style
if (!user || !user.uid) return;

// ✅ Moderne
if (!user?.uid) return;
```

### 4. Readonly pour les injectés
```typescript
// ✅ Marquer comme readonly
private readonly api = inject(ApiService);
```

---

## 🧪 Tests

### Tester un endpoint
```typescript
// Dans un composant ou service
ngOnInit() {
  this.api.get('/courses/published').subscribe({
    next: (courses) => {
      console.log('✅ API fonctionne:', courses);
    },
    error: (err) => {
      console.error('❌ Erreur API:', err);
    }
  });
}
```

### Vérifier l'URL
```typescript
console.log('API URL:', environment.apiUrl);
// Doit afficher: https://us-central1-myschool-f862b.cloudfunctions.net/api
```

### Curl test
```bash
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/courses/published
```

---

## 🐛 Debugging

### Erreur CORS
```
Access to XMLHttpRequest at '...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```
**Solution:** Vérifier la configuration CORS dans le backend

### Erreur 404
```
GET /api/courses 404 (Not Found)
```
**Solution:** Vérifier que l'API est déployée et accessible

### Erreur 500
```
GET /api/courses 500 (Internal Server Error)
```
**Solution:** Consulter les logs Firebase Functions:
```bash
firebase functions:log
```

---

## 📚 Ressources

- [Documentation API](https://us-central1-myschool-f862b.cloudfunctions.net/api-docs)
- [Guide d'intégration](./FRONTEND_INTEGRATION.md)
- [Résumé du refactoring](./REFACTORING_SUMMARY.md)

---

**Dernière mise à jour:** 29 novembre 2025
