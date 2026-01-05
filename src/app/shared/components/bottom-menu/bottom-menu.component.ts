import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonFooter, IonToolbar, IonIcon } from '@ionic/angular/standalone';

// Import des icônes
import { addIcons } from 'ionicons';
import {
  bookOutline,
  chatbubblesOutline,
  trophyOutline,
  homeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, IonFooter, IonToolbar, IonIcon],
})
export class BottomMenuComponent {
  @Input() activePage: string | undefined // Changez la valeur par défaut

  constructor(private router: Router) {
    // Ajout des icônes au composant
    addIcons({ homeOutline, bookOutline, chatbubblesOutline, trophyOutline });
  }

  navigateTo(page: string) {
    if (page !== this.activePage) {
      // Mappage des routes
      const routes: { [key: string]: string } = {
        home: '/courses', // Accueil → CoursesPage
        courses: '/mes-cours', // Cours → MesCoursPage
        message: '/message', // Messages → Page messages
        achievements: '/achievements', // Réussites → Page réussites
      };

      const route = routes[page];
      if (route) {
        this.router.navigate([route]);
      }
    }
  }
}
