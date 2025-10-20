// button-demo.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ButtonComponent],
  templateUrl: './button-demo.component.html',
})
export class ButtonDemoComponent {
  buttonText: string = 'Cliquez-moi';
  size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
  variant: 'solid' | 'light' | 'transparent' = 'solid';
  color: 'primary' | 'secondary' | 'warning' | 'danger' | 'dark' | 'light' = 'primary';
  width: 'auto' | 'full' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'auto';
  iconStart: string = '';
  iconEnd: string = '';
  isLoading: boolean = false;
  disabled: boolean = false;

  showAlert() {
    alert('Le bouton a été cliqué !');
  }

  get generatedCode(): string {
    let code = `<app-button\n`;
    code += `  text="${this.buttonText}"\n`;
    code += `  size="${this.size}"\n`;
    code += `  radius="${this.radius}"\n`;
    code += `  variant="${this.variant}"\n`;
    code += `  color="${this.color}"\n`;
    code += `  width="${this.width}"\n`;
    
    if (this.iconStart) {
      code += `  iconStart="${this.iconStart}"\n`;
    }
    
    if (this.iconEnd) {
      code += `  iconEnd="${this.iconEnd}"\n`;
    }
    
    if (this.isLoading) {
      code += `  [isLoading]="true"\n`;
    }
    
    if (this.disabled) {
      code += `  [disabled]="true"\n`;
    }
    
    code += `  (buttonClick)="onButtonClick()">\n`;
    code += `</app-button>`;
    
    return code;
  }
}