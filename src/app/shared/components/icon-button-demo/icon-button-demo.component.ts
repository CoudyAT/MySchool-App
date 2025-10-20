// icon-button-demo.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-icon-button-demo',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, IconButtonComponent, ButtonComponent],
  templateUrl: './icon-button-demo.component.html',
  styles: [`
    .demo-section {
      margin-bottom: 2rem;
    }
    
    .demo-title {
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1rem;
      align-items: center;
    }
    
    .demo-option-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .config-panel {
      background-color: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 2rem;
    }
    
    .preview-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      background-color: #f8fafc;
      border-radius: 0.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .control-item {
      margin-bottom: 1rem;
    }
    
    .control-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .controls-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class IconButtonDemoComponent {
  // Icons collection for demo
  icons: string[] = [
    'heart', 'star', 'person', 'home', 'settings', 'add', 
    'trash', 'cart', 'search', 'notifications', 'menu', 'close'
  ];
  
  // Configuration options
  colors: Array<'primary' | 'secondary' | 'warning' | 'danger' | 'dark' | 'light'> = [
    'primary', 'secondary', 'warning', 'danger', 'dark', 'light'
  ];
  
  sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl'> = [
    'xs', 'sm', 'md', 'lg', 'xl'
  ];
  
  shapes: Array<'circle' | 'square' | 'rounded'> = [
    'circle', 'square', 'rounded'
  ];
  
  variants: Array<'solid' | 'light' | 'transparent'> = [
    'solid', 'light', 'transparent'
  ];
  
  animations: Array<'pulse' | 'rotate' | 'bounce' | 'none'> = [
    'none', 'pulse', 'rotate', 'bounce'
  ];
  
  // Demo state
  selectedIcon: string = 'heart';
  selectedColor: 'primary' | 'secondary' | 'warning' | 'danger' | 'dark' | 'light' = 'primary';
  selectedSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  selectedShape: 'circle' | 'square' | 'rounded' = 'circle';
  selectedVariant: 'solid' | 'light' | 'transparent' = 'solid';
  selectedAnimation: 'pulse' | 'rotate' | 'bounce' | 'none' = 'none';
  hasBadge: boolean = false;
  badgeValue: string = '1';
  hasTooltip: boolean = false;
  tooltipValue: string = 'Icon Button';
  isLoading: boolean = false;
  isDisabled: boolean = false;
  
  // Generate code snippet for the current configuration
  get codeSnippet(): string {
    let code = `<app-icon-button\n`;
    code += `  icon="${this.selectedIcon}"\n`;
    code += `  color="${this.selectedColor}"\n`;
    code += `  size="${this.selectedSize}"\n`;
    code += `  shape="${this.selectedShape}"\n`;
    code += `  variant="${this.selectedVariant}"\n`;
    
    if (this.selectedAnimation !== 'none') {
      code += `  animation="${this.selectedAnimation}"\n`;
    }
    
    if (this.hasBadge) {
      code += `  badge="${this.badgeValue}"\n`;
    }
    
    if (this.hasTooltip) {
      code += `  tooltip="${this.tooltipValue}"\n`;
    }
    
    if (this.isLoading) {
      code += `  [isLoading]="true"\n`;
    }
    
    if (this.isDisabled) {
      code += `  [disabled]="true"\n`;
    }
    
    code += `  (buttonClick)="onButtonClick()"\n`;
    code += `></app-icon-button>`;
    
    return code;
  }
  
  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }
  
  toggleDisabled(): void {
    this.isDisabled = !this.isDisabled;
  }
  
  toggleBadge(): void {
    this.hasBadge = !this.hasBadge;
  }
  
  toggleTooltip(): void {
    this.hasTooltip = !this.hasTooltip;
  }
  
  onDemoButtonClick(): void {
    alert('Button clicked!');
  }
  
  copyCodeToClipboard(): void {
    navigator.clipboard.writeText(this.codeSnippet).then(() => {
      alert('Code copied to clipboard!');
    });
  }
}