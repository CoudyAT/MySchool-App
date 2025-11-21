import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { InitializationService } from './Admin/services/initializationService';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private fixturesService = inject(InitializationService);

  constructor() {
    // this.fixturesService.createCourseFixtures();
   // this.fixturesService.seedExpertises();
  //  this.fixturesService.seedInstructors();
    //  this.fixturesService.loadFixturesInBackground();
   // this.fixturesService.createLessonsFixtures();
  }
}
