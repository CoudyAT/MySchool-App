import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import {
  Subscription,
  CreateSubscriptionDTO,
  CreatePaymentResponse,
  NiveauScolaire,
  TypeAbonnement
} from 'src/app/models/subscription.model';
import { Matiere } from 'src/app/models/course.model';

@Injectable({
  providedIn: 'root',
})
export class AbonnementService {
  private readonly api = inject(ApiService);

  // Prix fixe de l'abonnement
  readonly PRIX_ABONNEMENT = 5000;
  readonly DEVISE = 'XOF';

  // Configuration des niveaux
  readonly CLASSES_PAR_NIVEAU: Record<NiveauScolaire, string[]> = {
    ELEMENTAIRE: ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    MOYEN: ['6ème', '5ème', '4ème', '3ème'],
    SECONDAIRE: ['Seconde', 'Première', 'Terminale'],
    UNIVERSITAIRE: ['Licence1', 'Licence2', 'Licence3', 'Master1', 'Master2']
  };

  /**
   * Obtenir les abonnements d'un utilisateur
   */
  getUserAbonnements(userId: string): Observable<Subscription[]> {
    return this.api
      .get<any>(`/abonnements/user/${userId}`)
      .pipe(map((res) => res?.data ?? []));
  }

  /**
   * Obtenir l'abonnement actif d'un utilisateur
   */
  getActiveAbonnement(userId: string): Observable<Subscription | null> {
    return this.api
      .get<any>(`/abonnements/user/${userId}/active`)
      .pipe(
        map((res) => {
          const abonnements = res?.data ?? [];
          return abonnements.find((a: Subscription) => a.statut === 'ACTIVE') || null;
        })
      );
  }

  /**
   * Créer un nouvel abonnement
   */
  creerAbonnement(data: CreateSubscriptionDTO): Observable<CreatePaymentResponse> {
    // Validation des données
    this.validerAbonnement(data);

    // Construire le payload pour l'API
    const payload = {
      userId: data.userId,
      classe: data.classe,
      niveauScolaire: data.niveauScolaire,
      typeAbonnement: data.typeAbonnement,
      ...(data.matieres && data.matieres.length > 0 && { matieres: data.matieres })
    };

    return this.api.post<CreatePaymentResponse>('/subscriptions/create-payment', payload);
  }

  /**
   * Obtenir les matières disponibles selon le niveau et la classe de l'utilisateur
   */
  getMatieresDisponibles(niveauScolaire: NiveauScolaire, classe?: string): Observable<Matiere[]> {
    // Si une classe est spécifiée, appeler l'API par classe (plus précis)
    if (classe) {
      return this.api
        .get<any>(`/matieres/classe/${encodeURIComponent(classe)}`)
        .pipe(
          map((res) => res?.data ?? []),
          // Fallback: si erreur, essayer par niveau
          catchError(() => {
            console.warn('Fallback: chargement par niveau', niveauScolaire);
            return this.api
              .get<any>(`/matieres/niveau/${niveauScolaire}`)
              .pipe(map((res) => res?.data ?? []));
          })
        );
    }

    // Sinon, appeler l'API par niveau
    return this.api
      .get<any>(`/matieres/niveau/${niveauScolaire}`)
      .pipe(map((res) => res?.data ?? []));
  }

  /**
   * Valider les données d'un abonnement
   */
  private validerAbonnement(data: CreateSubscriptionDTO): void {
    if (!data.userId) {
      throw new Error('UserId requis');
    }

    if (!data.niveauScolaire) {
      throw new Error('Niveau scolaire requis');
    }

    if (!data.classe) {
      throw new Error('La classe est requise');
    }

    if (!data.typeAbonnement) {
      throw new Error('Le type d\'abonnement est requis');
    }

    // Valider la classe selon le niveau
    const classesValides = this.CLASSES_PAR_NIVEAU[data.niveauScolaire];
    if (!classesValides.includes(data.classe)) {
      throw new Error(`Classe ${data.classe} invalide pour le niveau ${data.niveauScolaire}`);
    }

    // Validation pour abonnement MATIERE (3 matières requises)
    if (data.typeAbonnement === 'MATIERE') {
      if (!data.matieres || data.matieres.length !== 3) {
        throw new Error('Exactement 3 matières obligatoires pour un abonnement MATIERE');
      }
    }
  }

  /**
   * Déterminer le type d'abonnement selon le niveau
   */
  determinerTypeAbonnement(niveau: NiveauScolaire): TypeAbonnement {
    return niveau === 'ELEMENTAIRE' ? 'CLASSE' : 'MATIERE';
  }

  /**
   * Calculer la date de fin (1 an après le début)
   */
  private calculerDateFin(): Date {
    const dateFin = new Date();
    dateFin.setFullYear(dateFin.getFullYear() + 1);
    return dateFin;
  }

  /**
   * Vérifier si un utilisateur a un abonnement actif
   */
  hasActiveAbonnement(userId: string): Observable<boolean> {
    return this.getActiveAbonnement(userId).pipe(
      map(abonnement => !!abonnement)
    );
  }

  /**
   * Obtenir les classes disponibles pour un niveau
   */
  getClassesDisponibles(niveau: NiveauScolaire): string[] {
    return this.CLASSES_PAR_NIVEAU[niveau] || [];
  }

  /**
   * Vérifier si des matières peuvent être sélectionnées pour un niveau
   */
  peutChoisirMatieres(niveau: NiveauScolaire): boolean {
    return niveau !== 'ELEMENTAIRE';
  }

  /**
   * Obtenir le nombre de matières requises pour un niveau
   */
  getNombreMatieresRequises(niveau: NiveauScolaire): number {
    return niveau === 'ELEMENTAIRE' ? 0 : 3;
  }

  /**
   * Annuler un abonnement
   */
  annulerAbonnement(abonnementId: string): Observable<void> {
    return this.api.delete<void>(`/abonnements/${abonnementId}`);
  }

  /**
   * Renouveler un abonnement
   */
  renouvelerAbonnement(abonnementId: string): Observable<Subscription> {
    return this.api.post<Subscription>(`/abonnements/${abonnementId}/renouveler`, {});
  }
}
