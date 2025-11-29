import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { InitializationService } from './Admin/services/initializationService';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private readonly fixturesService = inject(InitializationService);

  constructor() {
    // Les fixtures peuvent être activées ici si nécessaire
  }
}
