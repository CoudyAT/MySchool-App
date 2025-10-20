/*
  Author: Dr_EPL
  dolnickenzanza@gmail.com
  @2025
*/

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Colors, ThemeMode, ColorKey } from 'src/app/theme/colors';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectTheme } from 'src/app/store/theme.selectors';

@Component({
  selector: 'ui-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  standalone: false
})

export class ViewComponent implements OnInit, OnDestroy {
  @Input() colorName?: ColorKey;
  @Input() lightColor?: ColorKey;
  @Input() darkColor?: ColorKey;
  @Input() customClass?: string;

  backgroundClass = '';
  private themeSub?: Subscription;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.themeSub = this.store.select(selectTheme).subscribe(theme => {
      
      this.updateBackgroundClass(theme.theme);
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  private updateBackgroundClass(theme: ThemeMode) {
    this.backgroundClass =
      theme === 'light'
        ? this.lightColor || (this.colorName ? Colors.light[this.colorName] : 'bg-transparent')
        : this.darkColor || (this.colorName ? Colors.dark[this.colorName] : 'bg-transparent');
  }
}
