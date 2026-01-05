import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class FcmService {

  constructor(
    private messaging: Messaging,
    private notificationService: NotificationService
  ) { }

  async initFCM(userId: string) {
    try {
      // Permission navigateur
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      // Génération token FCM
      const token = await getToken(this.messaging, {
        vapidKey: environment.firebase.vapidKey
      });

      if (token) {
        this.notificationService.registerToken({
          token,
          userId,
          platform: 'web'
        }).subscribe();
      }

    } catch (error) {
      console.error('Erreur FCM', error);
    }
  }

  listenMessages() {
    onMessage(this.messaging, payload => {
      console.log('Notification reçue (foreground)', payload);
    });
  }
}
