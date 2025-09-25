import { Routes } from '@angular/router';
import { SplashPage } from './pages/splash/splash.page';
import { OnboardingPage } from './pages/onboarding/onboarding.page';

export const routes: Routes = [
  // {
  //   path: 'home',
  //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  // },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full',
  // },
  // {
  //   path: 'splash',
  //   loadComponent: () => import('./pages/splash/splash.page').then( m => m.SplashPage)
  // },
  // {
  //   path: 'onboarding',
  //   loadComponent: () => import('./pages/onboarding/onboarding.page').then( m => m.OnboardingPage)
  // },
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashPage },
  { path: 'onboarding', component: OnboardingPage },
];
