
import {tap} from 'rxjs/operators';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';


import { Helpers } from '../utils/helpers';


@Injectable()
export class LangInterceptor implements HttpInterceptor {

  locale: string;

  constructor(@Inject(LOCALE_ID) locale: string) {
    this.locale = Helpers.parseLocale(locale);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let timezone = 'Europe/Berlin';
    if (typeof Intl === 'object' && typeof Intl.DateTimeFormat === 'function') {
      // get timezone string from Intl object
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return next.handle(req.clone({headers: req.headers.set('Accept-Language', this.locale).set('timezone', timezone)}))
      .pipe(
        tap((event: HttpEvent<any>) => {
          // do nothing
          //console.log(event);
        }, (err: any) => {
          // if the token has expired.
          if (err instanceof HttpErrorResponse) {
            console.log(err);
          }
        }));
  }

}
