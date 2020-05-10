import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { ROUTING } from './utils/enum/routing';


const routes: Routes = [
  { path: '', redirectTo: '/' + ROUTING.main, pathMatch: 'full' },
  { path: ROUTING.main, component: AppComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'}) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
