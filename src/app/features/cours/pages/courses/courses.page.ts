import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { signOut } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';

// Import Swiper
import { register } from 'swiper/element/bundle';

// Register Swiper
register();

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { BottomMenuComponent } from 'src/app/shared/components/bottom-menu/bottom-menu.component';

import { addIcons } from 'ionicons';
import {
  addOutline,
  logOutOutline,
  arrowForwardOutline,
  ribbonOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    BottomMenuComponent,
    IonIcon,
    IonButton,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CoursesPage implements OnInit, AfterViewInit {
  currentSlide = 0;

  // Configuration SIMPLIFIÉE et CORRECTE
  slideOpts = {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 400,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
    },
  };

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private auth: Auth
  ) {
    addIcons({ logOutOutline, addOutline, arrowForwardOutline, ribbonOutline });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // ✅ Initialisation MANUELLE du Swiper
    this.initializeSwiper();
  }

  initializeSwiper() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      // ✅ Assignation directe des options
      Object.assign(swiperEl, this.slideOpts);

      // ✅ Initialisation explicite
      swiperEl.initialize();

      console.log('✅ Swiper initialisé avec succès');
    } else {
      console.log('❌ Swiper container non trouvé');
    }
  }

  onSlideChange(event: any) {
    this.currentSlide = event.detail[0].activeIndex;
    console.log('Slide changé:', this.currentSlide);
  }

  onSwiperInit(swiper: any) {
    console.log('✅ Swiper prêt');
  }

  goToCoursesPage() {
    this.router.navigate(['/mes-cours']);
  }

  async logout() {
    try {
      await signOut(this.auth);
      const toast = await this.toastCtrl.create({
        message: 'Déconnexion  ✅',
        duration: 2000,
        color: 'success',
      });
      await toast.present();

      // Redirection après déconnexion
      this.router.navigate(['/signup'], { replaceUrl: true });
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      const toast = await this.toastCtrl.create({
        message: 'Erreur lors de la déconnexion ❌',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }
}
