# 📱 MySchool-App - Application Mobile d'Éducation

> **Version**: 2.0.0  
> **Date**: 29 novembre 2025  
> **Statut**: ✅ Production Ready

Application mobile cross-platform (iOS/Android) construite avec **Angular 20**, **Ionic 8** et **Capacitor 7** pour l'apprentissage en ligne.

---

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Développement
```bash
ionic serve
# ou
npm start
```

### Build
```bash
npm run build
```

### Build iOS
```bash
ionic cap sync ios
ionic cap open ios
```

---

## 📁 Structure du projet

```
MySchool-App/
├── src/
│   ├── app/
│   │   ├── core/                  # Services centraux
│   │   │   ├── services/
│   │   │   │   └── api.service.ts     # Service HTTP REST
│   │   │   └── interceptors/
│   │   │       └── error.interceptor.ts
│   │   ├── features/              # Modules fonctionnels
│   │   │   ├── auth/              # Authentification
│   │   │   ├── cours/             # Gestion des cours
│   │   │   ├── payments/          # Paiements
│   │   │   ├── instructor/        # Profils instructeurs
│   │   │   └── services/          # Services métier
│   │   │       ├── courseService.ts
│   │   │       ├── chapter.service.ts
│   │   │       ├── enrollmentService.ts
│   │   │       └── instructorService.ts
│   │   ├── Admin/                 # Module administration
│   │   │   ├── services/
│   │   │   │   ├── courseService.ts
│   │   │   │   └── initializationService.ts
│   │   │   └── pages/
│   │   ├── models/                # Interfaces TypeScript
│   │   │   ├── course.model.ts
│   │   │   ├── user.model.ts
│   │   │   ├── instructor.model.ts
│   │   │   └── payment.model.ts
│   │   └── shared/                # Composants partagés
│   ├── environments/              # Configuration
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── assets/                    # Images, icônes
├── ios/                           # Projet Capacitor iOS
└── package.json
```

---

## 🔧 Technologies

| Technologie | Version | Usage |
|-------------|---------|-------|
| Angular | 20.0.0 | Framework principal |
| Ionic | 8.0.0 | UI mobile |
| Capacitor | 7.4.4 | Runtime natif |
| TypeScript | 5.8.0 | Langage |
| RxJS | 7.8.0 | Programmation réactive |
| Firebase | 11.10.0 | Authentication |
| Swiper | Latest | Carrousels |

---

## 🌐 API REST

### Configuration
L'application utilise une API REST backend hébergée sur Firebase Cloud Functions :

**URL de base**: `https://us-central1-myschool-f862b.cloudfunctions.net/api`

### Endpoints principaux

#### Courses (Cours)
- `GET /courses/published` - Cours publiés
- `GET /courses/:id` - Détails d'un cours
- `GET /courses/category/:category` - Filtrer par catégorie
- `GET /courses/level/:level` - Filtrer par niveau
- `POST /courses` - Créer un cours (Admin)
- `PUT /courses/:id` - Modifier un cours (Admin)
- `DELETE /courses/:id` - Supprimer un cours (Admin)

#### Chapters (Chapitres)
- `GET /chapters/course/:courseId` - Chapitres d'un cours
- `GET /chapters/:id` - Détails d'un chapitre
- `POST /chapters` - Créer un chapitre (Admin)

#### Lessons (Leçons)
- `GET /lessons/chapter/:chapterId` - Leçons d'un chapitre
- `POST /lessons` - Créer une leçon (Admin)

#### Exercises (Exercices)
- `GET /exercises/chapter/:chapterId` - Exercices d'un chapitre
- `POST /exercises` - Créer un exercice (Admin)

#### Enrollments (Inscriptions)
- `GET /enrollments/student/:userId` - Inscriptions d'un utilisateur
- `POST /enrollments` - Créer une inscription
- `PUT /enrollments/:id` - Mettre à jour la progression

#### Instructors (Instructeurs)
- `GET /instructors` - Liste des instructeurs
- `GET /instructors/:id` - Détails d'un instructeur
- `GET /instructors/:id/courses` - Cours d'un instructeur

---

## 🔐 Authentification

L'application utilise **Firebase Authentication** pour la gestion des utilisateurs :

- 📱 **Signup avec OTP WhatsApp**
- 🔑 **Login sécurisé**
- 💾 **Session persistante** (localStorage)
- 👤 **Profil utilisateur**

### Flux d'authentification
1. L'utilisateur s'inscrit via OTP WhatsApp
2. Firebase Auth crée un compte
3. Les données utilisateur sont stockées via l'API REST
4. Le `currentUser` est sauvegardé dans localStorage

---

## 📊 Services principaux

### 1. CourseService
Gestion des cours (liste, détails, filtres)

```typescript
// Exemple d'utilisation
this.courseService.getCourses().subscribe(courses => {
  console.log('Cours disponibles:', courses);
});
```

### 2. ChapterService
Gestion des chapitres et leçons

```typescript
this.chapterService.getChaptersWithExercises(courseId).subscribe(chapters => {
  console.log('Chapitres du cours:', chapters);
});
```

### 3. EnrollmentService
Gestion des inscriptions et progression

```typescript
// Créer une inscription
await this.enrollmentService.createEnrollment({
  userId: user.uid,
  courseId: course.id,
  amount: course.price,
  paymentMethod: 'wave'
});

// Mettre à jour la progression
await this.enrollmentService.updateProgress(enrollmentId, 75);
```

### 4. InstructorService
Gestion des instructeurs

```typescript
this.instructorService.getInstructors().subscribe(instructors => {
  console.log('Instructeurs:', instructors);
});
```

---

## 🎨 Fonctionnalités

### Pour les étudiants
- ✅ Parcourir les cours disponibles
- ✅ Filtrer par catégorie/niveau
- ✅ Voir les détails d'un cours (chapitres, leçons, exercices)
- ✅ S'inscrire à un cours
- ✅ Suivre sa progression
- ✅ Accéder au contenu des cours
- ✅ Voir le profil des instructeurs
- ✅ Abonnement Premium

### Pour les instructeurs
- ✅ Profil public avec bio et expertise
- ✅ Liste des cours enseignés
- ✅ Statistiques (étudiants, notation)

### Pour les administrateurs
- ✅ Créer/modifier/supprimer des cours
- ✅ Gérer les chapitres et leçons
- ✅ Initialiser la base avec des fixtures
- ✅ Gérer les instructeurs

---

## 💳 Méthodes de paiement

L'application supporte plusieurs méthodes de paiement :

- 💙 **Wave** (Mobile Money)
- 🧡 **Orange Money**
- 💛 **Yas Mixx**
- 💳 **Carte bancaire**

### Plans d'abonnement
- **Individuel**: 1800 FCFA/an
- **Entreprise**: 99000 FCFA/an

---

## 🗄️ Modèles de données

### Course
```typescript
interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  type: 'VIDEO' | 'En ligne' | 'Hybride';
  level: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  duration: number;
  sessions: number;
  price: number;
  rating?: number;
  image?: string;
  isPublished: boolean;
  certificateAvailable: boolean;
  chaptersIds?: string[];
}
```

### Chapter
```typescript
interface Chapter {
  id?: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  duration?: number;
}
```

### Enrollment
```typescript
interface Enrollment {
  id?: string;
  userId: string;
  courseId: string;
  courseTitle?: string;
  courseImage?: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  amount: number;
  paymentMethod: string;
  chaptersCompleted?: string[];
  enrolledAt: any;
}
```

---

## 🧪 Tests

### Vérifier l'API
```bash
curl https://us-central1-myschool-f862b.cloudfunctions.net/api/courses/published
```

### Tester l'application
```bash
# Mode développement
ionic serve

# Build de production
npm run build

# Ouvrir dans iOS
ionic cap open ios
```

---

## 🐛 Debugging

### Problèmes courants

#### Erreur CORS
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Vérifier que le backend autorise les ports 4200-4205

#### Cours ne s'affichent pas
```typescript
// Vérifier dans la console
console.log('API URL:', environment.apiUrl);
```

#### Erreur d'inscription
Vérifier que :
1. L'utilisateur est connecté (Firebase Auth)
2. Le `currentUser` est dans localStorage
3. L'API `/enrollments` est accessible

---

## 📝 Variables d'environnement

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://us-central1-myschool-f862b.cloudfunctions.net/api',
  firebase: {
    apiKey: 'AIzaSyAMx6oWTAIsrMqSgcgrn2ykFZpBjW5YlPw',
    authDomain: 'myschool-f862b.firebaseapp.com',
    projectId: 'myschool-f862b',
    storageBucket: 'myschool-f862b.appspot.com',
    messagingSenderId: '198850585669',
    appId: '1:198850585669:web:e392c229bf5eb284652f2c',
    measurementId: 'G-8HZVZFYE0J',
  }
};
```

### Production (`environment.prod.ts`)
Mêmes valeurs, avec `production: true`

---

## 🚀 Déploiement

### iOS
```bash
# Synchroniser les fichiers
ionic cap sync ios

# Ouvrir dans Xcode
ionic cap open ios

# Compiler et déployer depuis Xcode
```

### Android (à venir)
```bash
ionic cap add android
ionic cap sync android
ionic cap open android
```

---

## 📊 Statistiques du projet

| Métrique | Valeur |
|----------|--------|
| Services totaux | 9 |
| Services API REST | 9 (100%) |
| Endpoints API | 40+ |
| Composants | 25+ |
| Routes | 15 |
| Bundle size | 2.09 MB |
| Erreurs de compilation | 0 ✅ |

---

## 🔄 Architecture API REST

Le projet a été **entièrement migré** de Firebase direct vers une architecture API REST :

### Avantages
- ✅ **Code plus simple** et lisible
- ✅ **Sécurité renforcée** (logique côté serveur)
- ✅ **Flexibilité** (changement de BDD transparent)
- ✅ **Testabilité** améliorée
- ✅ **Performance** optimisée

### Services migrés
1. ✅ CourseService (Features)
2. ✅ ChapterService
3. ✅ EnrollmentService
4. ✅ InstructorService
5. ✅ CourseService (Admin)
6. ✅ InitializationService (Fixtures)

---

## 🎯 Prochaines étapes

### Court terme
- [ ] Ajouter des tests unitaires
- [ ] Implémenter la pagination
- [ ] Ajouter un système de cache
- [ ] Améliorer le offline mode

### Moyen terme
- [ ] Support Android
- [ ] Notifications push
- [ ] Mode sombre
- [ ] Analytics

### Long terme
- [ ] Application web (PWA)
- [ ] Mode hors-ligne complet
- [ ] Synchronisation multi-appareils

---

## 👥 Contributeurs

- **CoudyAT** - Développeur principal
- **GitHub Copilot** - Assistant de développement

---

## 📞 Support

En cas de problème :
1. Vérifier les logs dans la console du navigateur
2. Vérifier que l'API backend est accessible
3. Consulter la documentation Firebase
4. Ouvrir une issue sur GitHub

---

## 📄 Licence

Propriétaire - MySchool © 2025

---

**Dernière mise à jour**: 29 novembre 2025  
**Version**: 2.0.0
