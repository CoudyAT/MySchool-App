import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ToastMessage } from './toast.model';
import { ToastService } from './toast.service';


@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
 toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getToastClasses(type: string): string {
    switch(type) {
      case 'success':
        return 'bg-white border-l-4 border-l-green-500 text-green-500';
      case 'warning':
        return 'bg-white border-l-4 border-l-amber-500 text-amber-500';
      case 'error':
        return 'bg-white border-l-4 border-l-red-600 text-red-500';
      default:
        return '';
    }
  }

  getIconClasses(type: string): string {
    switch(type) {
      case 'success':
        return 'bg-green-500/20';
      case 'warning':
        return 'bg-amber-500/20';
      case 'error':
        return 'bg-red-500/20';
      default:
        return '';
    }
  }

  getTextClasses(type: string): string {
    switch(type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return '';
    }
  }

  getCloseButtonClasses(): string {
        return 'bg-red-100/80 text-red-300 hover:bg-red-200 hover:text-red-300';
  }

  removeToast(id: string) {
    this.toastService.removeToast(id);
  }

  trackByFn(index: number, item: ToastMessage): string {
    return item.id;
  }
}