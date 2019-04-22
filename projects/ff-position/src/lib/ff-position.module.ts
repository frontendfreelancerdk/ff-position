import {NgModule} from '@angular/core';
import {FFOverlayModule} from 'ff-overlay';
import {FFResizeSensorModule} from 'ff-resize-sensor';

@NgModule({
  imports: [FFOverlayModule,
  FFResizeSensorModule],
})
export class FFPositionModule {
}
