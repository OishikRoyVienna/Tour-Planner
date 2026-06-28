import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from './error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message: string;

      switch (error.status) {
        case 0:
          message = 'No connection to server. Is the backend running?';
          break;
        case 400:
          message = error.error?.message ?? 'Invalid request data.';
          break;
        case 401:
          message = error.error?.message ?? 'Invalid credentials.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = error.error?.message ?? 'Resource not found.';
          break;
        case 409:
          message = error.error?.message ?? 'Conflict: resource already exists.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        default:
          message = `Unexpected error (HTTP ${error.status}).`;
      }

      errorService.show(message, error.status);
      return throwError(() => new Error(message));
    })
  );
};
