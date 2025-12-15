import { Component, OnInit } from '@angular/core';
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

  constructor(private router: Router) { }
  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/profile']);
  }

  markAsRead(notif: any) {
    notif.read = true;
  }
}
