import { Routes } from '@angular/router';
import { SplashPage } from './features/home/pages/splash/splash.page';
import { OnboardingPage } from './features/home/pages/onboarding/onboarding.page';
import { CoursesPage } from './features/cours/pages/courses/courses.page';
import { MesCoursPage } from './features/cours/pages/mes-cours/mes-cours.page';
import { CoursDetailPage } from './features/cours/pages/cours-detail/cours-detail.page';
import { PaymentMethodPage } from './features/payments/payment-method/payment-method.page';
import { PaymentVerifyPage } from './features/payments/payment-verify/payment-verify.page';
import { CourseVideoPage } from './features/cours/pages/course-video/course-video.page';
import { SignupFlowComponent } from './features/auth/signup-flow/signup-flow.component';
import { SubscriptionPlansPage } from './features/auth/subscription-plans/subscription-plans.page';
import { BaseLayoutAdminComponent } from './Admin/base-layout-admin/base-layout-admin.component';
import { ListCoursPage } from './Admin/pages/cours/pages/list-cours/list-cours.page';
import { DetailCoursPage } from './Admin/pages/cours/pages/detail-cours/detail-cours.page';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfilePage } from './features/auth/profile/profile.page';
import { DetailPage } from './features/cours/pages/detail/detail.page';

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
  {
    path: 'payment-verify',
    component: PaymentVerifyPage,
  },
  {
    path: 'course-video/:id',
    component: CourseVideoPage,
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'profile',
    component: ProfilePage, // Remplacez par votre composant de profil
  },

  {
    path: 'detail',
    component: DetailPage,
  },

  {
    path: 'admin-login',
    component: BaseLayoutAdminComponent,
    children: [
      { path: 'list-cours', component: ListCoursPage },
      { path: 'cours/:id', component: DetailCoursPage },
    ],
  },
  {
    path: 'detail-cours',
    loadComponent: () =>
      import('./Admin/pages/cours/pages/detail-cours/detail-cours.page').then(
        (m) => m.DetailCoursPage
      ),
  },
  {
    path: 'instructor-profile/:id',
    loadComponent: () =>
      import(
        './features/instructor/instructor-profile/instructor-profile.page'
      ).then((m) => m.InstructorProfilePage),
  },
];
