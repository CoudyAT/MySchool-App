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
import { PaymentCallbackPage } from './features/payments/payment-callback/payment-callback.page';
import { EditProfilePage } from './features/auth/edit-profile/edit-profile.page';
import { SecurityPage } from './features/auth/security/security.page';
import { PdfListPage } from './features/pdf/pdf-list/pdf-list.page';
import { ForgotPasswordPage } from './features/auth/forgot-password/forgot-password.page';
import { AuthGuard } from './shared/components/auth.guard';

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
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'courses',
    component: CoursesPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'mes-cours',
    component: MesCoursPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'course-detail/:id',
    component: CoursDetailPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'subscription-plans',
    component: SubscriptionPlansPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment-method',
    component: PaymentMethodPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment-verify',
    component: PaymentVerifyPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment-callback',
    component: PaymentCallbackPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'course-video/:id',
    component: CourseVideoPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-profile',
    component: EditProfilePage,
    canActivate: [AuthGuard],
  },
  {
    path: 'security',
    component: SecurityPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'pdf-list',
    component: PdfListPage,
    canActivate: [AuthGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPage,
    canActivate: [AuthGuard],
  },
];
