// button.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './button.component.html',
  styles: [`
    @keyframes rippleEffect {
      0% {
        transform: scale(0);
        opacity: 0.5;
      }
      100% {
        transform: scale(10);
        opacity: 0;
      }
    }
    
    .animate-ripple {
      animation: rippleEffect 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
    }
    
    .rounded-\\[inherit\\] {
      border-radius: inherit;
    }
  `]
})
export class ButtonComponent implements OnInit {
  @Input() text: string = 'Button';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() radius: 'none' | 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() variant: 'solid' | 'light' | 'transparent' = 'solid';
  @Input() color: 'primary' | 'secondary' | 'warning' | 'danger' | 'dark' | 'light' = 'primary';
  @Input() iconStart: string = '';
  @Input() fontWeight: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black' = 'medium';
  @Input() iconEnd: string = '';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() width: 'auto' | 'full' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'auto';
  @Output() buttonClick = new EventEmitter<void>();

  rippleActive: boolean = false;
  rippleX: number = 0;
  rippleY: number = 0;
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit() {
    // Ajouter la classe group pour activer les animations des enfants avec group-hover
    this.renderer.addClass(this.el.nativeElement.firstChild, 'group');
  }

  onClick(event?: MouseEvent): void {
    if (!this.disabled && !this.isLoading) {
      // Effet de ripple
      if (event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.rippleX = event.clientX - rect.left;
        this.rippleY = event.clientY - rect.top;
        this.rippleActive = true;
        
        // Réinitialiser l'effet de ripple après animation
        setTimeout(() => {
          this.rippleActive = false;
        }, 800);
      }
      
      this.buttonClick.emit();
    }
  }

  get sizeClasses(): string {
    const sizeMap = {
      'sm': 'px-3 py-1 text-sm',
      'md': 'px-4 py-2 text-base',
      'lg': 'px-5 py-2.5 text-lg',
      'xl': 'px-6 py-3 text-xl'
    };
    return sizeMap[this.size] || sizeMap['md'];
  }

  get fontWeightClasses(): string {
    const weightMap = {
      'thin': 'font-thin',
      'light': 'font-light',
      'normal': 'font-normal',
      'medium': 'font-medium',
      'semibold': 'font-semibold',
      'bold': 'font-bold',
      'extrabold': 'font-extrabold',
      'black': 'font-black'
    };
    return weightMap[this.fontWeight] || weightMap['medium'];
  }
  

  get iconSizeClasses(): string {
    const sizeMap = {
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl'
    };
    return sizeMap[this.size] || sizeMap['md'];
  }

  get radiusClasses(): string {
    const radiusMap = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-lg',
      'full': 'rounded-full'
    };
    return radiusMap[this.radius] || radiusMap['md'];
  }

  get widthClasses(): string {
    const widthMap = {
      'auto': 'w-auto',
      'full': 'w-full',
      'xs': 'w-24',
      'sm': 'w-32',
      'md': 'w-40',
      'lg': 'w-48',
      'xl': 'w-56',
      '2xl': 'w-64'
    };
    return widthMap[this.width] || widthMap['auto'];
  }

  get backgroundClasses(): string {
    if (this.variant === 'solid') {
      const bgMap = {
        'primary': 'bg-green-700 hover:bg-green-600 text-white transition-colors duration-200 shadow-lg hover:shadow-green-300/30',
        'secondary': 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-300/30',
        'warning': 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-yellow-300/30',
        'danger': 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-300/30',
        'dark': 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg hover:shadow-gray-300/30',
        'light': 'bg-gray-200 hover:bg-gray-300 text-gray-900 shadow-lg hover:shadow-gray-300/30'
      };
      return bgMap[this.color] || bgMap['primary'];
    }
    else if (this.variant === 'light') {
      const bgMap = {
        'primary': 'bg-transparent hover:bg-green-50 text-green-600 border border-green-600 border-solid shadow hover:shadow-green-200/50',
        'secondary': 'bg-transparent hover:bg-purple-50 text-purple-800 border border-purple-500 border-solid shadow hover:shadow-purple-200/50',
        'warning': 'bg-transparent hover:bg-yellow-50 text-yellow-600 border border-yellow-600 border-solid shadow hover:shadow-yellow-200/50',
        'danger': 'bg-transparent hover:bg-red-50 text-red-600 border border-red-600 border-solid shadow hover:shadow-red-200/50',
        'dark': 'bg-transparent hover:bg-gray-50 text-gray-800 border border-gray-800 border-solid shadow hover:shadow-gray-200/50',
        'light': 'bg-transparent hover:bg-gray-50 text-gray-600 border border-gray-400 border-solid shadow hover:shadow-gray-200/50'
      };
      return bgMap[this.color] || bgMap['primary'];
    }
    else {
      // Transparent
      const bgMap = {
        'primary': 'bg-transparent hover:text-green-700 text-green-600 hover:font-semibold font-medium transform hover:-translate-y-0.5',
        'secondary': 'bg-transparent hover:text-purple-600 text-purple-500 hover:font-semibold font-medium transform hover:-translate-y-0.5',
        'warning': 'bg-transparent hover:text-yellow-600 text-yellow-500 hover:font-semibold font-medium transform hover:-translate-y-0.5',
        'danger': 'bg-transparent hover:text-red-600 text-red-500 hover:font-semibold font-medium transform hover:-translate-y-0.5',
        'dark': 'bg-transparent hover:text-black text-gray-800 hover:font-semibold font-medium transform hover:-translate-y-0.5',
        'light': 'bg-transparent hover:text-gray-800 text-gray-400 hover:font-semibold font-medium transform hover:-translate-y-0.5'
      };
      return bgMap[this.color] || bgMap['primary'];
    }
  }

  get textClasses(): string {
    return '';
  }

  get disabledClasses(): string {
    return this.disabled || this.isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  }
}