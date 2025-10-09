import { Routes } from '@angular/router';
import { SplashPage } from './pages/splash/splash.page';
import { OnboardingPage } from './pages/onboarding/onboarding.page';
import { SignupFlowComponent } from './pages/signup-flow/signup-flow.component';
import { CoursesPage } from './pages/courses/courses.page';
import { MesCoursPage } from './pages/mes-cours/mes-cours.page';
import { CoursDetailPage } from './pages/cours-detail/cours-detail.page';
import { SubscriptionPlansPage } from './pages/subscription-plans/subscription-plans.page';
import { PaymentMethodPage } from './pages/payment-method/payment-method.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    component: SplashPage,
  },
  {
    path: 'onboarding',
    component: OnboardingPage,
  },
  {
    path: 'signup',
    component: SignupFlowComponent,
  },
  {
    path: 'courses',
    component: CoursesPage,
  },
  {
    path: 'mes-cours',
    component: MesCoursPage,
  },
  {
    path: 'course-detail/:id',
    component: CoursDetailPage,
  },
  {
    path: 'subscription-plans',
    component: SubscriptionPlansPage,
  },
  {
    path: 'payment-method',
    component: PaymentMethodPage,
  },
];
