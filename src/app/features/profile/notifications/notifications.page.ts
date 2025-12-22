import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle
} from '@ionic/angular/standalone';
import { NotificationService } from '../../services/notification.service';
import { Notification } from 'src/app/models/notification.model';
import { Auth } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, chevronBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle
  ]
})
export class NotificationsPage implements OnInit {
  currentUser: any = null;
  userId: string = '';
  notification!: Notification;
  private auth = inject(Auth);


  notifications = [
    {
      title: 'Profil mis à jour',
      message: 'Vos informations personnelles ont été modifiées avec succès.',
      icon: '👌',
      date: 'Aujourd\'hui',
      read: false,
    },
    {
      title: 'Nouvelle mise à jour',
      message: 'Une nouvelle version de l’application est disponible.',
      icon: '🙂',
      date: 'Hier',
      read: false,
    },
    {
      title: 'Message important',
      message: 'Veuillez vérifier vos paramètres de sécurité.',
      icon: '🎯',
      date: 'Il y a 3 jours',
      read: true,
    }
  ];

  constructor(private router: Router, private notificationService: NotificationService) {
    addIcons({ chevronBackOutline, checkmarkDoneOutline });

  }

  ngOnInit() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUser = user;
      this.userId = user.id;  //
      console.log('User ID depuis localStorage:', this.userId);
      this.loadNotification();
      return;
    }

    // Si pas dans localStorage, fallback sur Firebase Auth
    const authUser = this.auth.currentUser;
    if (authUser) {
      this.userId = authUser.uid;
      this.loadNotification();
    } else {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          this.userId = user.uid;
          this.loadNotification();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  markAsRead(notif: any) {
    notif.read = true;
  }

  async loadUserData() {
    try {
      const localUser = JSON.parse(
        localStorage.getItem('currentUser') || 'null'
      );
      if (localUser && localUser.uid) {
        // Charger depuis localStorage
        this.currentUser = localUser;

      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }
  loadNotification() {
    if (!this.userId) return;

    this.notificationService.getNotificationByUser(this.userId).subscribe({
      next: (response: any) => {
        this.notification = response.data;
        console.log(this.notification)
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
      }
    });
  }
}
