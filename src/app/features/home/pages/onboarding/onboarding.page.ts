import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
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
  // autorise les web components comme <swiper-container>
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPage implements OnInit {
  @ViewChild('swiperEl', { static: true }) swiperEl!: ElementRef<HTMLElement>;

  currentSlide = 0;

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
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');

      if (onboardingCompleted === 'true') {
        // 👉 utilisateur déjà passé par l'onboarding
        this.router.navigate(['/login'], { replaceUrl: true });
      }
  }

  // appeler la méthode slideNext() du webcomponent
  nextSlide() {
    // 👉 si on est sur la dernière slide
    if (this.currentSlide === this.onboardingData.length - 1) {
      this.finishOnboarding();
      return;
    }

    const el = this.swiperEl?.nativeElement as any;
    if (el?.swiper) {
      el.swiper.slideNext();
    }
  }

  // écouter le changement de slide (dans ngAfterViewInit tu peux ajouter l'écoute si besoin)
  ngAfterViewInit() {
    const el = this.swiperEl?.nativeElement as any;
    if (!el) return;
    // met à jour currentSlide quand swiper change
    el.addEventListener('swiperslidechange', (ev: any) => {
      const [swiper] = ev.detail;
      this.currentSlide = swiper.activeIndex;
    });
  }

  finishOnboarding() {
    localStorage.setItem('onboardingCompleted', 'true');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  skipOnboarding() {
    this.finishOnboarding();
  }
}
