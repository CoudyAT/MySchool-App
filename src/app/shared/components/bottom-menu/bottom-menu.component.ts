import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonFooter, IonToolbar, IonIcon } from '@ionic/angular/standalone';

// Import des icônes
import { addIcons } from 'ionicons';
import { bookOutline, chatbubblesOutline, trophyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // Important pour [class.active]
    IonFooter,
    IonToolbar,
    IonIcon,
  ],
})
export class BottomMenuComponent {
  @Input() activePage: string = 'courses';

  constructor(private router: Router) {
    // Ajout des icônes au composant
    addIcons({
      bookOutline,
      chatbubblesOutline,
      trophyOutline,
    });
  }

  navigateTo(page: string) {
    if (page !== this.activePage) {
      this.router.navigate([`/${page}`]);
    }
  }
}
