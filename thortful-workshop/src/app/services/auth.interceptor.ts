import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const baseUrl = this.authService.getBaseUrl();

    // Only intercept requests to Elastic Path API
    if (!req.url.includes(baseUrl)) {
      return next.handle(req);
    }

    return from(this.authService.ensureValidToken()).pipe(
      switchMap(() => {
        // Clone request and add auth headers
        const authReq = this.addAuthHeaders(req);

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !this.isRefreshing) {
              // Token expired, try to refresh
              this.isRefreshing = true;

              return from(this.authService.generateImplicitToken()).pipe(
                switchMap(() => {
                  this.isRefreshing = false;
                  // Retry the request with new token
                  const retryReq = this.addAuthHeaders(req);
                  return next.handle(retryReq);
                }),
                catchError((refreshError) => {
                  this.isRefreshing = false;
                  this.authService.clearTokens();
                  return throwError(() => refreshError);
                })
              );
            }

            return throwError(() => error);
          })
        );
      })
    );
  }

  private addAuthHeaders(req: HttpRequest<any>): HttpRequest<any> {
    const tokens = this.authService.tokens$;
    let headers = req.headers;

    // Note: The actual token attachment is handled by the SDK interceptor
    // This interceptor is mainly for handling token refresh on 401 errors
    // But we can add additional headers here if needed

    return req.clone({ headers });
  }
}
