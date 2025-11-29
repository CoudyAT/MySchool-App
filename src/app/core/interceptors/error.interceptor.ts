import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;

          // Messages spécifiques selon le code d'erreur
          switch (error.status) {
            case 0:
              errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
              break;
            case 400:
              errorMessage = 'Requête invalide. Vérifiez les données envoyées.';
              break;
            case 401:
              errorMessage = 'Non autorisé. Veuillez vous connecter.';
              break;
            case 403:
              errorMessage = 'Accès interdit. Vous n\'avez pas les permissions nécessaires.';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée.';
              break;
            case 500:
              errorMessage = 'Erreur serveur interne. Réessayez plus tard.';
              break;
            case 503:
              errorMessage = 'Service temporairement indisponible.';
              break;
          }
        }

        console.error('❌ Erreur HTTP:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
