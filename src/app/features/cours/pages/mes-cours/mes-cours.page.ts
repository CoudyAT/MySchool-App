import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

interface Course {
  id: number;
  category: string;
  title: string;
  sessions: number;
  exercises: number;
  image: string;
  available: boolean;
}
@Component({
  selector: 'app-mes-cours',
  templateUrl: './mes-cours.page.html',
  styleUrls: ['./mes-cours.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    // IonHeader,
    // IonTitle,
    // IonToolbar,
    CommonModule,
    FormsModule,
    IonSearchbar,
    IonButton,
    IonCard,
    IonIcon,
    IonCardContent,
  ],
})
export class MesCoursPage implements OnInit {
  courses: Course[] = [
    {
      id: 1,
      category: 'Maths au collège',
      title: 'Algorithme',
      sessions: 25,
      exercises: 15,
      image: 'assets/images/algorithme1.jpg',
      available: true,
    },
    {
      id: 2,
      category: 'Maths au collège',
      title: 'Algorithme',
      sessions: 30,
      exercises: 8,
      image: 'assets/images/algorithme2.jpg',
      available: true,
    },
    {
      id: 3,
      category: 'PC au collège',
      title: 'Physique',
      sessions: 59,
      exercises: 10,
      image: 'assets/images/physique.jpg',
      available: true,
    },
    {
      id: 4,
      category: 'PC au collège',
      title: 'Chimie',
      sessions: 75,
      exercises: 9,
      image: 'assets/images/chimie.jpg',
      available: true,
    },
    {
      id: 5,
      category: 'Sciences de la Vie et de la Terre',
      title: 'Les Organes',
      sessions: 59,
      exercises: 10,
      image: 'assets/images/organes.jpg',
      available: true,
    },
    {
      id: 6,
      category: 'Sciences de la Vie et de la Terre',
      title: "L'ecosystème",
      sessions: 75,
      exercises: 9,
      image: 'assets/images/ecosysteme.jpg',
      available: true,
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  searchCourse() {
    console.log('Rechercher un cours');
  }

  openFilters() {
    console.log('Ouvrir les filtres');
  }

  openCourse(course: Course) {
    console.log('Ouvrir le cours:', course);
    this.router.navigate(['/course-detail', course.id]);
  }
}
