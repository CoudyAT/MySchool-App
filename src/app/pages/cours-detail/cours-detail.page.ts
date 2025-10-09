import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSearchbar,
  IonButtons,
} from '@ionic/angular/standalone';
import { arrowBackOutline, checkmarkCircle, chevronBackOutline, flagOutline, helpCircleOutline, languageOutline, star, starHalf, starOutline, timeOutline, trophyOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-cours-detail',
  templateUrl: './cours-detail.page.html',
  styleUrls: ['./cours-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonToolbar,
    RouterModule,
    IonCard,
    IonCardContent,
  ],
})
export class CoursDetailPage implements OnInit {
  course = {
    id: 1,
    title: 'Algorithme',
    category: 'Maths au collège',
    sessions: 25,
    exercises: 15,
    language: 'Français',
    instructor: 'René DIATTA',
    rating: 4.5,
    maxRating: 5.0,
    image: 'assets/images/algorithme1.jpg',
    certificateAvailable: true,
    description:
      "Ce cours d'Algorithme en mathématiques a pour objectif d'initier les apprenants aux méthodes de raisonnement logique et aux techniques de résolution de problèmes. À travers des exercices pratiques et progressifs, vous développerez votre capacité à analyser des situations complexes et à concevoir des solutions algorithmiques efficaces.",
    levels: [
      { icon: 'flag-outline', completed: true },
      { icon: 'time-outline', completed: false },
      { icon: 'help-circle-outline', completed: false },
      { icon: 'help-circle-outline', completed: false },
      { icon: 'trophy-outline', completed: false },
    ],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    // Enregistrer toutes les icônes nécessaires
    addIcons({
      star,
      'star-half': starHalf,
      'star-outline': starOutline,
      'checkmark-circle': checkmarkCircle,
      'language-outline': languageOutline,
      'flag-outline': flagOutline,
      'time-outline': timeOutline,
      'help-circle-outline': helpCircleOutline,
      'trophy-outline': trophyOutline,
      'chevron-back-outline': chevronBackOutline,
      'arrow-back-outline': arrowBackOutline,
    });
  }

  ngOnInit() {
    // Récupérer l'ID du cours depuis les paramètres de route
    const courseId = this.route.snapshot.paramMap.get('id');
    console.log('Course ID:', courseId);
    // Ici vous pouvez charger les détails du cours depuis un service
  }

  goBack() {
    this.location.back();
  }

  enrollNow() {
    console.log("S'inscrire au cours:", this.course.title);
    this.router.navigate(['/subscription-plans']);
  }


}
