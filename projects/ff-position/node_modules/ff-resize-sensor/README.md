[![Build Status](https://travis-ci.org/frontendfreelancerdk/ff-resize-sensor.svg?branch=master)](https://travis-ci.org/frontendfreelancerdk/ff-resize-sensor)

# FFResizeSensor

FFResizeSensor is based on `ResizeSensor` from [CSS Element Queries](https://www.npmjs.com/package/css-element-queries) and just adjusts it for an angular project.

## Installing

### Npm
```
npm install ff-resize-sensor --save
```

### Include FFResizeSensorModule in AppModule imports.
`app.module.ts`
```typescript
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FFResizeSensorModule} from 'ff-resize-sensor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FFResizeSensorModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

## Usage
From view template as `(resize)` output

`app.component.ts`
```typescript
import {Component} from '@angular/core';

@Component({
  selector: 'ff-root',
  template: `<div class="myCss" ffResizeSensor (resize)="onResize($event)"></div>`
})
export class AppComponent {
  onResize(e) {
    console.log('Event from view template', e);
  }
}
```
From service with `subscribe` method
 
 `app.component.ts`
```typescript
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FFResizeSensorService} from 'ff-resize-sensor';

@Component({
  selector: 'ff-root',
  template: `<div class="myCss" #domElem></div>`
})
export class AppComponent implements AfterViewInit {
  @ViewChild('domElem') domElem: ElementRef;

  constructor(private service: FFResizeSensorService) {}
  ngAfterViewInit(): void {
    // Method gets some HTMLElemnt and callback
    // Callback will be called after HTMLElement resized
    this.service.subscribe(this.domElem.nativeElement, (event) => {
      console.log('Event from service', event);
    });
  }
}
```

## Api
`FFResizeSensorService`
```typescript
subscribe(HTMLElement, (FFResizeSensorEvent)=>void): void
```
`FFResizeSensorDirective`
```typescript
  public width: number;
  public height: number;
  public oldWidth: number;
  public oldHeight: number;
  @Output() readonly resize:EventEmitter<FFResizeSensorEvent>
```

## License

MIT [Frontend Freelancer](mailto:developer@frontend-freelancer.com)
