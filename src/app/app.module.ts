import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FFPositionModule} from 'ff-position';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FFPositionModule,
    BrowserModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
