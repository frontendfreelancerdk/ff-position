[![Build Status](https://travis-ci.org/frontendfreelancerdk/ff-overlay.svg?branch=master)](https://travis-ci.org/frontendfreelancerdk/ff-overlay)

# ff-overlay

## Installing 

### Npm 
```
npm install ff-overlay --save
```

### Include FFOverlayModule in AppModule imports.
`app.module.ts`
```typescript
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FFOverlayModule} from 'ff-overlay';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FFOverlayModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

## Usage

From view template
`app.component.ts`
```typescript
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FFOverlayService} from 'ff-overlay';

@Component({
  selector: 'ff-root',
  styleUrls: ['./app.component.scss'],
  template: `
    <div #myModal>some modal</div>`
})
export class AppComponent implements AfterViewInit{
  @ViewChild('myModal') elem: ElementRef<any>;

  constructor(private service: FFOverlayService) {
  }

  ngAfterViewInit(): void {
    this.service.appendChild(this.elem.nativeElement);
  }
}
```
From component
`app.component.ts`
```typescript
import {ApplicationRef, Component, ComponentFactoryResolver, EmbeddedViewRef, Injector} from '@angular/core';
import {FFOverlayService} from 'ff-overlay';
import {ChildComponent} from './child/child.component';

@Component({
  selector: 'ff-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector,
              private service: FFOverlayService) {
    // Creating componentRef
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(ChildComponent)
      .create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    // Getting HTML element (view)
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    // Append html element to ff-overlay
    this.service.appendChild(domElem);
  }
}
```
`app.module.ts`
```typescript
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FFOverlayModule} from 'ff-overlay';
import {ChildComponent} from './child/child.component';

@NgModule({
  declarations: [
    AppComponent,
    ChildComponent
  ],
  imports: [
    BrowserModule,
    FFOverlayModule
  ],
  bootstrap: [AppComponent],
  
  // !IMPORTANT! Remember! You have to put your component to entry components in your module.
  entryComponents: [ChildComponent]
})
export class AppModule {
}
```

## License

MIT � [Frontend Freelancer](mailto:developer@frontend-freelancer.com)
