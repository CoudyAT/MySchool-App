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
import { HelpCenterPage } from './features/profile/help-center/help-center.page';
import { TermsPage } from './features/profile/terms/terms.page';
import { NotificationsPage } from './features/profile/notifications/notifications.page';
import { MessagePage } from './features/chat/message/message.page';
import { FaqPage } from './Admin/pages/faq/faq.page';
import { UsersPage } from './Admin/pages/users/users.page';
import { DashboardPage } from './Admin/pages/dashboard/dashboard.page';
import { UserDetailsPage } from './Admin/pages/user-details/user-details.page';
import { InstructorsPage } from './Admin/pages/instructors/instructors.page';
import { EditCoursPage } from './Admin/pages/cours/pages/edit-cours/edit-cours.page';
import { UserEditPage } from './Admin/pages/user-edit/user-edit.page';
import { EnrollmentsPage } from './Admin/pages/enrollments/enrollments.page';
import { SecurityPage } from './features/auth/security/security.page';
import { ForgotPasswordPage } from './features/auth/forgot-password/forgot-password.page';
import { PaymentOptionComponent } from './features/payments/payment-option/payment-option.component';
import { VideoDetailPage } from './features/cours/pages/video-detail/video-detail.page';
import { VideoPlayerPage } from './features/cours/pages/video-player/video-player.page';
import { PdfListPage } from './features/pdf/pdf-list/pdf-list.page';
import { MatieresPage } from './Admin/pages/matieres/matieres.page';
import { adminGuard } from './guard/admin-guard';
import { ReferralsPage } from './Admin/pages/referrals/referrals.page';
import { UpdatePasswordPage } from './Admin/pages/update-password/update-password.page';

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
    path: 'message',
    component: MessagePage,
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
    path: 'payment-option',
    component: PaymentOptionComponent,
  },
  {
    path: 'payment-callback',
    component: PaymentCallbackPage,
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
    component: ProfilePage,
  },

  {
    path: 'detail',
    component: DetailPage,
  },

  {
    path: 'edit-profile',
    component: EditProfilePage,
  },
  {
    path: 'help-center',
    component: HelpCenterPage,
  },
  {
    path: 'terms',
    component: TermsPage,
  },
  {
    path: 'notifications',
    component: NotificationsPage,
  },

  {
    path: 'security',
    component: SecurityPage,
  },

  {
    path: 'pdf-list',
    component: PdfListPage,
  },

  {
    path: 'forgot-password',
    component: ForgotPasswordPage,
  },

  {
    path: 'admin-login',
    canActivateChild: [adminGuard],
    component: BaseLayoutAdminComponent,
    children: [
      { path: 'list-cours', component: ListCoursPage },
      { path: 'cours/:id', component: DetailCoursPage },
      { path: 'faq', component: FaqPage },
      { path: 'users', component: UsersPage },
      { path: '', component: DashboardPage },
      {
        path: 'user-details/:id',
        component: UserDetailsPage,
      },
      {
        path: 'user-edit/:id',
        component: UserEditPage,
      },
      {
        path: 'instructors',
        component: InstructorsPage,
      },
      {
        path: 'edit-cours/:id',
        component: EditCoursPage,
      },
      {
        path: 'enrollments',
        component: EnrollmentsPage,
      },
      {
        path: 'matieres',
        component: MatieresPage,
      },
      {
        path: 'referrals',
        component: ReferralsPage
      },
      {
        path: 'update-password',
        component: UpdatePasswordPage,
      },

    ],
  },
  {
    path: 'detail-cours',
    loadComponent: () =>
      import('./Admin/pages/cours/pages/detail-cours/detail-cours.page').then(
        (m) => m.DetailCoursPage,
      ),
  },
  {
    path: 'instructor-profile/:id',
    loadComponent: () =>
      import('./features/instructor/instructor-profile/instructor-profile.page').then(
        (m) => m.InstructorProfilePage,
      ),
  },
  {
    path: 'instructor-details',
    loadComponent: () =>
      import('./Admin/pages/instructor-details/instructor-details.page').then(
        (m) => m.InstructorDetailsPage,
      ),
  },
  {
    path: 'abonnement',
    loadComponent: () =>
      import('./features/abonnement/abonnement.page').then(
        (m) => m.AbonnementPage,
      ),
  },
  {
    path: 'login-admin',
    loadComponent: () =>
      import('./features/auth/login-admin/login-admin.page').then(
        (m) => m.LoginAdminPage,
      ),
  },
  {
    path: 'premium-course-selection',
    loadComponent: () =>
      import('./features/component/premium-course-selection/premium-course-selection.page').then(
        (m) => m.PremiumCourseSelectionPage,
      ),
  },
  {
    path: 'video-page',
    loadComponent: () =>
      import('./features/cours/pages/video-page/video-page.page').then(
        (m) => m.VideoPagePage,
      ),
  },

  {
    path: 'video-detail/:id',
    component: VideoDetailPage,
  },

  {
    path: 'video-player/:id',
    component: VideoPlayerPage,
  },
  {
    path: 'conditions',
    loadComponent: () => import('./features/auth/pages/conditions/conditions.page').then(m => m.ConditionsPage)
  },


];
