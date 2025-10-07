import {
  Component,
  OnInit,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
import { BottomMenuComponent } from 'src/app/components/bottom-menu/bottom-menu.component';

import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
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

  constructor(private router: Router) {
    addIcons({ addOutline });
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
}
