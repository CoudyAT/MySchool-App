import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './components/view/view.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [ViewComponent],
    exports: [ViewComponent],
    imports: [
      CommonModule,
      IonicModule
    ],
    
  })
export class SharedModule {}
