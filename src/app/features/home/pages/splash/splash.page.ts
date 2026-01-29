import {
  Component,
  OnInit,
  HostListener,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class SplashPage implements OnInit {
  isMobile = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkDevice();

    // ⏱ Splash seulement sur mobile
    if (this.isMobile) {
      setTimeout(() => {
        this.router.navigate(['/onboarding'], { replaceUrl: true });
      }, 3000);
    }
  }

  // 🔁 Resize écran
  @HostListener('window:resize')
  onResize() {
    this.checkDevice();
  }

  // 📱 Détection appareil
  checkDevice() {
    this.isMobile = window.innerWidth <= 768;

    // 👉 Desktop → Login direct
    if (!this.isMobile) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
}
