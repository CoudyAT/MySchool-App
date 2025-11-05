import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Course } from '../list-cours/list-cours.page';
import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-detail-cours',
  templateUrl: './detail-cours.page.html',
  styleUrls: ['./detail-cours.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
],
})
export class DetailCoursPage implements OnInit {
  constructor() {}
  course!: Course;

  ngOnInit(): void {
    // 🔹 Données simulées en attendant une API
    this.course = {
      id: 1,
      title: 'Développement Angular Avancé',
      category: 'Programmation Web',
      sessions: 8,
      exercises: 12,
      language: 'Français',
      instructor: 'Mamadou Ndiaye',
      rating: 4.7,
      maxRating: 5,
      image: 'https://angular.io/assets/images/logos/angular/angular.svg',
      certificateAvailable: true,
      description:
        'Approfondissez vos compétences Angular avec des cas pratiques, l’injection de dépendances avancée, les observables et la gestion d’état.',
      levels: [
        { icon: 'ri-book-2-line', completed: true },
        { icon: 'ri-terminal-line', completed: true },
        { icon: 'ri-code-s-slash-line', completed: false },
      ],
    };
  }
}
