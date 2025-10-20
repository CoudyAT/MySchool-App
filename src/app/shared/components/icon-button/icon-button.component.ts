import { FontSize } from './../../../theme/typography';
// icon-button.component.ts
import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent implements OnInit {
  @Input() icon: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() shape: 'circle' | 'square' | 'rounded' = 'circle';
  @Input() variant: 'solid' | 'light' | 'transparent' = 'solid';
  @Input() color: 'primary' | 'secondary' | 'warning' | 'danger' | 'dark' | 'light' = 'primary';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() tooltip: string = '';
  @Input() badge: string | number = '';
  @Input() animation: 'pulse' | 'rotate' | 'bounce' | 'none' = 'none';
  @Output() buttonClick = new EventEmitter<void>();

  rippleActive: boolean = false;
  rippleX: number = 0;
  rippleY: number = 0;
  
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit() {
    // Add group class to enable animations on children with group-hover
    this.renderer.addClass(this.el.nativeElement.firstChild, 'group');
  }

  onClick(event?: MouseEvent): void {
    if (!this.disabled && !this.isLoading) {
      // Ripple effect
      if (event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        this.rippleX = event.clientX - rect.left;
        this.rippleY = event.clientY - rect.top;
        this.rippleActive = true;
        
        // Reset ripple effect after animation
        setTimeout(() => {
          this.rippleActive = false;
        }, 800);
      }
      
      this.buttonClick.emit();
    }
  }

  get sizeClasses(): string {
    const sizeMap = {
      'xs': 'p-1 text-xs',
      'sm': 'p-2 text-sm',
      'md': 'p-3 text-base',
      'lg': 'p-4 text-lg',
      'xl': 'p-5 text-xl'
    };
    return sizeMap[this.size] || sizeMap['md'];
  }

  get iconSizeClasses(): string {
    const sizeMap = {
      'xs': 'text-sm',
      'sm': 'text-base',
      'md': 'text-lg',
      'lg': 'text-xl',
      'xl': 'text-2xl'
    };
    return sizeMap[this.fontSize] || sizeMap['md'];
  }

  get dimensionClasses(): string {
    const dimensionMap = {
      'xs': 'h-8 w-8 min-w-8',
      'sm': 'h-10 w-10 min-w-10',
      'md': 'h-12 w-12 min-w-12',
      'lg': 'h-14 w-14 min-w-14',
      'xl': 'h-16 w-16 min-w-16'
    };
    return dimensionMap[this.size] || dimensionMap['md'];
  }

  get shapeClasses(): string {
    const shapeMap = {
      'circle': 'rounded-full',
      'square': 'rounded-none',
      'rounded': 'rounded-lg'
    };
    return shapeMap[this.shape] || shapeMap['circle'];
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

  get disabledClasses(): string {
    return this.disabled || this.isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  }

  get animationClasses(): string {
    const animationMap = {
      'pulse': 'pulse-on-hover',
      'rotate': 'group-hover:rotate-45 transition-transform duration-300',
      'bounce': 'hover:animate-bounce',
      'none': ''
    };
    return animationMap[this.animation] || '';
  }

  get badgeClasses(): string {
    if (!this.badge) return '';
    
    const badgeColorMap = {
      'primary': 'bg-green-600 text-white',
      'secondary': 'bg-purple-600 text-white',
      'warning': 'bg-yellow-600 text-white',
      'danger': 'bg-red-600 text-white',
      'dark': 'bg-gray-800 text-white',
      'light': 'bg-gray-200 text-gray-900'
    };
    
    return badgeColorMap[this.color] || badgeColorMap['primary'];
  }
}