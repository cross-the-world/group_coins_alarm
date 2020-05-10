import 'hammerjs';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

console.log('Dev-Version: ' + environment.appConfig.devVersion);

if (environment.production) {
  console.log('App-Version: ' + environment.appConfig.version);
  enableProdMode();
  // Note: disable any console.log in prod. mode
  window.console.log = function () { };
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
