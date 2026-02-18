import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/core/services/api.service';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { switchMap, filter, map } from 'rxjs/operators';

export interface AppUser {
  niveauScolaire: string;
  classe: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {}

  getCurrentUser(): Observable<AppUser> {
    return authState(this.auth).pipe(
      filter((user): user is any => !!user), // attend que l'utilisateur existe
      switchMap(
        (user) =>
          docData(
            doc(this.firestore, `users/${user.uid}`),
          ) as Observable<AppUser>,
      ),
    );
  }

  /**
   * CRUD de base
   */

  // Créer un nouvel utilisateur
  createUser(user: User): Observable<User> {
    return this.api.post<User>('/users', user);
  }

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<{ success: boolean; data: User[]; count: number }> {
    return this.api.get<{ success: boolean; data: User[]; count: number }>(
      '/users',
    );
  }

  // Récupérer un utilisateur par ID
  getUserById(userId: string): Observable<User> {
    return this.api.get<User>(`/users/${userId}`);
  }

  // Mettre à jour un utilisateur
  updateUser(userId: string, user: Partial<User>): Observable<User> {
    return this.api.put<User>(`/users/${userId}`, user);
  }

  // Supprimer un utilisateur
  deleteUser(userId: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}`);
  }

  /**
   * Recherches spécifiques
   */

  // Récupérer un utilisateur par email
  getUserByEmail(email: string): Observable<User> {
    return this.api.get<User>(`/users/email/${email}`);
  }

  // Récupérer un utilisateur par téléphone
  getUserByPhone(phone: string): Observable<User> {
    return this.api.get<User>(`/users/phone/${phone}`);
  }

  // Récupérer les utilisateurs par rôle
  getUsersByRole(
    role: 'student' | 'instructor' | 'admin' | 'influenceur',
  ): Observable<User[]> {
    return this.api
      .get<{
        success: boolean;
        data: User[];
        count: number;
      }>(`/users/role/${role}`)
      .pipe(
        map((res) => res.data), // <-- on renvoie directement "data"
      );
  }
  // Récupérer les utilisateurs par statut
  getUsersByStatus(
    status: 'active' | 'inactive' | 'suspended',
  ): Observable<User[]> {
    return this.api.get<User[]>(`/users/status/${status}`);
  }

  /**
   * Mises à jour partielles
   */

  // Mettre à jour l'image de profil
  updateProfileImage(
    userId: string,
    profileImageBase64: string,
  ): Observable<User> {
    return this.api.patch<User>(`/users/${userId}/profile-image`, {
      profileImageBase64,
    });
  }

  // Mettre à jour le statut d'un utilisateur
  updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended',
  ): Observable<User> {
    return this.api.patch<User>(`/users/${userId}/status`, { status });
  }

  /**
   * Méthodes utilitaires
   */

  // Vérifier si un utilisateur existe par email
  async userExistsByEmail(email: string): Promise<boolean> {
    try {
      await this.getUserByEmail(email).toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Vérifier si un utilisateur existe par téléphone
  async userExistsByPhone(phone: string): Promise<boolean> {
    try {
      await this.getUserByPhone(phone).toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }
}
