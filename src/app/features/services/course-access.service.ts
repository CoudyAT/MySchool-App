import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Subscription } from 'src/app/models/subscription.model';
import { Course } from 'src/app/models/course.model';
import { User } from 'src/app/models/user.model';

export interface CourseAccessResult {
  hasAccess: boolean;
  reason: 'subscribed' | 'free' | 'no-subscription' | 'wrong-class' | 'matiere-not-included';
  subscription?: Subscription;
}

/**
 * Service pour vérifier si un utilisateur a accès à un cours
 * basé sur son abonnement actif.
 *
 * Règles :
 * - ELEMENTAIRE (type CLASSE) : Abonnement par classe → tous les cours de cette classe sont débloqués
 * - MOYEN/SECONDAIRE/UNIVERSITAIRE (type MATIERE) : Abonnement par matières → seuls les cours des 3 matières choisies
 * - Cours gratuits (price = 0) : toujours accessibles
 */
@Injectable({
  providedIn: 'root',
})
export class CourseAccessService {
  private readonly api = inject(ApiService);

  // Cache de l'abonnement actif pour éviter les appels répétés
  private cachedSubscription: Subscription | null = null;
  private cacheUserId: string | null = null;

  /**
   * Vérifier si un utilisateur a accès à un cours
   */
  checkCourseAccess(course: Course, user: User): Observable<CourseAccessResult> {
    // Cours gratuit → toujours accessible
    if (!course.price || course.price === 0) {
      return of({ hasAccess: true, reason: 'free' });
    }

    if (!user?.uid && !user?.id) {
      return of({ hasAccess: false, reason: 'no-subscription' });
    }

    const userId = user.uid || user.id!;
    return this.getActiveSubscription(userId).pipe(
      map((subscription) => {
        if (!subscription) {
          return { hasAccess: false, reason: 'no-subscription' as const };
        }

        // Vérifier selon le type d'abonnement
        const subType = subscription.type || (subscription as any).typeAbonnement;
        if (subType === 'CLASSE') {
          return this.checkClasseAccess(course, subscription, user);
        } else {
          return this.checkMatiereAccess(course, subscription);
        }
      })
    );
  }

  /**
   * Vérifier l'accès pour un abonnement CLASSE (ELEMENTAIRE)
   * → Tous les cours de la classe sont accessibles
   */
  private checkClasseAccess(course: Course, subscription: Subscription, user: User): CourseAccessResult {
    // Pour ELEMENTAIRE, si la classe du cours correspond à la classe de l'abonnement
    const classeAbonnement = subscription.classe || user.classe;
    const classeCours = course.classe;

    // Si le cours a une classe définie, elle doit correspondre
    if (classeCours && classeAbonnement && classeCours !== classeAbonnement) {
      console.log('❌ Cours classe', classeCours, '!= abonnement classe', classeAbonnement);
      return { hasAccess: false, reason: 'wrong-class', subscription };
    }

    // Si le cours est du même niveau scolaire, accès accordé
    const niveauCours = course.niveauScolaire;
    if (niveauCours && subscription.niveauScolaire && niveauCours !== subscription.niveauScolaire) {
      return { hasAccess: false, reason: 'wrong-class', subscription };
    }

    console.log('✅ Accès CLASSE autorisé pour:', course.title);
    return { hasAccess: true, reason: 'subscribed', subscription };
  }

  /**
   * Vérifier l'accès pour un abonnement MATIERE (MOYEN/SECONDAIRE/UNIVERSITAIRE)
   * → Seuls les cours des 3 matières choisies sont accessibles
   */
  private checkMatiereAccess(course: Course, subscription: Subscription): CourseAccessResult {
    // Récupérer la matière du cours (par ID ou par nom)
    const matiereIdCours = course.matiereId;
    const matiereNomCours = course.matiere || course.category;

    // Matières de l'abonnement (IDs et noms)
    const matieresIdAbonnement = subscription.matiereIds || [];
    const matieresNomsAbonnement = subscription.matieres?.map(m => m.nom) || [];

    // Vérifier aussi les noms stockés comme strings simples (format API)
    const matieresFlat: string[] = Array.isArray((subscription as any).matieres)
      ? (subscription as any).matieres.filter((m: any) => typeof m === 'string')
      : [];

    // Vérifier par ID
    if (matiereIdCours && matieresIdAbonnement.includes(matiereIdCours)) {
      return { hasAccess: true, reason: 'subscribed', subscription };
    }

    // Vérifier par nom de matière (catégorie du cours = nom matière)
    if (matiereNomCours) {
      const nomLower = matiereNomCours.toLowerCase();
      const matchByName = matieresNomsAbonnement.some(m => m.toLowerCase() === nomLower)
        || matieresFlat.some(m => m.toLowerCase() === nomLower);
      if (matchByName) {
        return { hasAccess: true, reason: 'subscribed', subscription };
      }
    }

    console.log('❌ Matière non incluse dans l\'abonnement pour:', course.title);
    return { hasAccess: false, reason: 'matiere-not-included', subscription };
  }

  /**
   * Récupérer l'abonnement actif de l'utilisateur (avec cache)
   */
  getActiveSubscription(userId: string): Observable<Subscription | null> {
    // Utiliser le cache si disponible pour le même utilisateur
    if (this.cacheUserId === userId && this.cachedSubscription) {
      return of(this.cachedSubscription);
    }

    return this.api
      .get<any>(`/subscriptions/user/${userId}`)
      .pipe(
        map((res) => {
          const subscriptions = res?.data ?? [];
          const now = new Date();

          // Trouver l'abonnement actif
          const active = subscriptions.find((sub: any) => {
            let endDate: Date;
            if (sub.endDate?._seconds) {
              endDate = new Date(sub.endDate._seconds * 1000);
            } else if (sub.dateFin?._seconds) {
              endDate = new Date(sub.dateFin._seconds * 1000);
            } else {
              endDate = new Date(sub.endDate || sub.dateFin);
            }
            const isActive = sub.status === 'ACTIVE' || sub.statut === 'ACTIVE';
            return isActive && endDate > now;
          }) || null;

          // Mettre en cache
          this.cacheUserId = userId;
          this.cachedSubscription = active;

          return active;
        }),
        catchError((err) => {
          console.error('Erreur vérification abonnement:', err);
          return of(null);
        })
      );
  }

  /**
   * Vérifier rapidement si l'utilisateur a un abonnement actif
   */
  hasActiveSubscription(userId: string): Observable<boolean> {
    return this.getActiveSubscription(userId).pipe(
      map(sub => !!sub)
    );
  }

  /**
   * Invalider le cache (à appeler après un nouveau paiement)
   */
  clearCache() {
    this.cachedSubscription = null;
    this.cacheUserId = null;
  }
}
