import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private darkModeKey = 'darkMode';

  constructor() {
    this.initializeDarkMode();
  }

  initializeDarkMode() {
    const savedMode = localStorage.getItem(this.darkModeKey);

    if (savedMode !== null) {
      // Utiliser le mode sauvegardé
      this.setDarkMode(savedMode === 'true');
    } else {
      // Par défaut : mode clair
      this.setDarkMode(false);
    }
  }

  toggleDarkMode(): boolean {
    const currentMode = this.isDarkMode();
    const newMode = !currentMode;
    this.setDarkMode(newMode);
    return newMode;
  }

  setDarkMode(isDark: boolean) {
    localStorage.setItem(this.darkModeKey, isDark.toString());

    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark', 'ion-palette-dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark', 'ion-palette-dark');
    }
  }

  isDarkMode(): boolean {
    return document.body.classList.contains('dark');
  }

  getDarkModeStatus(): boolean {
    const saved = localStorage.getItem(this.darkModeKey);
    return saved === 'true';
  }
}
