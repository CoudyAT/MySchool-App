import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPage implements OnInit {
  @ViewChild('swiperEl', { static: true })
  swiperEl!: ElementRef<HTMLElement>;

  // 👉 Index slide actuel
  currentSlide = 0;

  // 👉 Autoriser uniquement mobile
  isMobile = false;

  onboardingData = [
    {
      title: 'Bienvenue dans MySchool',
      subtitle:
        "Votre plateforme en ligne de formation et d'apprentissage pluridisciplinaire",
      buttonText: 'Suivant',
      buttonColor: '#005ADD',
    },
    {
      title: 'Des programmes complets',
      subtitle:
        "Plusieurs profils d'apprentissage\nDes formations complètes accélérées",
      buttonText: 'Suivant',
      buttonColor: '#005ADD',
    },
    {
      title: 'Des experts formateurs',
      subtitle: 'Apprenez avec les meilleurs.',
      buttonText: 'Commencer !',
      buttonColor: '#0DB20D',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // ✅ Vérification device
    this.checkDevice();

    // ✅ Vérifier si onboarding déjà fait
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');

    if (onboardingCompleted === 'true') {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // 🔁 Quand on redimensionne l'écran
  @HostListener('window:resize')
  onResize() {
    this.checkDevice();
  }

  // 📱 Vérifie si mobile
  checkDevice() {
    this.isMobile = window.innerWidth <= 768;

    // 👉 Desktop = redirection login
    if (!this.isMobile) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // ▶ Slide suivant
  nextSlide() {
    // Dernière slide
    if (this.currentSlide === this.onboardingData.length - 1) {
      this.finishOnboarding();
      return;
    }

    const el = this.swiperEl?.nativeElement as any;
    if (el?.swiper) {
      el.swiper.slideNext();
    }
  }

  // 👂 Écoute changement slide
  ngAfterViewInit() {
    const el = this.swiperEl?.nativeElement as any;
    if (!el) return;

    el.addEventListener('swiperslidechange', (ev: any) => {
      const [swiper] = ev.detail;
      this.currentSlide = swiper.activeIndex;
    });
  }

  // ✅ Fin onboarding
  finishOnboarding() {
    localStorage.setItem('onboardingCompleted', 'true');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // ⏭ Skip
  skipOnboarding() {
    this.finishOnboarding();
  }
}
