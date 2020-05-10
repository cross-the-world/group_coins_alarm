import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { LangInterceptor } from './services/lang.interceptor';

import { ShareModule } from './utils/modules/share.module';



export function initialize() {
  return () => {}; //Promise.all([configService.init()]);
}



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    ShareModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
      multi: true,
      deps: []
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LangInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
