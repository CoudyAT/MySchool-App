import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import {
  chevronBackOutline,
  languageOutline,
  playCircle,
  star,
  starHalf,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-course-video',
  templateUrl: './course-video.page.html',
  styleUrls: ['./course-video.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class CourseVideoPage implements OnInit {
  paymentInfo: any;

  course = {
    category: 'Mathématiques',
    title: 'Algorithme',
    duration: '25 min',
    chapters: 15,
    progress: 70,
    language: 'Français',
    instructor: 'René DIATTA',
    rating: 4.5,
    maxRating: 5.0,
    description: `Ce cours d'Algorithme en mathématiques a pour objectif d'initier les apprenants aux méthodes de raisonnement logique et aux techniques de résolution de problèmes.`,
    thumbnail: 'assets/course-thumbnail.jpg',
  };

  constructor(private router: Router, private location: Location) {
    addIcons({
      chevronBackOutline,
      languageOutline,
      star,
      starHalf,
    });

    // Récupérer les informations de paiement
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.paymentInfo = navigation.extras.state;
      console.log('Informations de paiement reçues:', this.paymentInfo);
    }
  }

  ngOnInit() {}

  goBack() {
    this.router.navigate(['/courses']);
  }

  startCourse() {
    console.log('Démarrer le cours');
    // Logique pour démarrer la vidéo
  }
}
