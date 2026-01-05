import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Notification, Token } from 'src/app/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly api = inject(ApiService);

  // Créer un token FCM

  registerToken(token: Token): Observable<Token> {
    return this.api.post<Token>('/push-notifications/register-token', token);
  }

  // Supprimer un token FCM
  deleteToken(token: string, userId: string): Observable<void> {
    return this.api.delete<void>(`/push-notifications/remove-token/`);
  }
  // Envoyer une notification test

  sendNotificationTest(userId: string): Observable<Notification> {
    return this.api.post<Notification>('/push-notifications/send-test', { userId });
  }

  // Récupérer les notifications d'un utilisateur
  getNotificationByUser(userId: string): Observable<Notification[]> {
    return this.api.get<Notification[]>(`/push-notifications/user/${userId}`);
  }

  // Marquer une notification comme lue
  patchNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.api.patch<Notification>(`/push-notifications/${notificationId}/read`, notificationId);
  }

  // Récupérer les tokens d'un utilisateur (debug)

  getTokenByUser(userId: string): Observable<Notification[]> {
    return this.api.get<Notification[]>(`/push-notification/tokens/${userId}`);
  }
}


