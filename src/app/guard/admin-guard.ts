import { inject } from '@angular/core';
import { CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { map, of } from 'rxjs';

export const adminGuard: CanActivateChildFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);

  try {
    const currentUserStr = localStorage.getItem('currentUser');

    if (!currentUserStr) {
      return router.createUrlTree(['/login-admin']);
    }

    const currentUser = JSON.parse(currentUserStr);

    const isAdmin = currentUser?.role?.libelle === 'admin';

    if (isAdmin) {
      return true;
    }

    return router.createUrlTree(['/login-admin']);
  } catch (err) {
    console.error('Erreur lecture currentUser', err);
    return router.createUrlTree(['/login-admin']);
  }
};