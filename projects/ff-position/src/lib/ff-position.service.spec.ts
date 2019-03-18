import {TestBed} from '@angular/core/testing';

import {FFPositionService} from './ff-position.service';
import {FFPositionComponent} from './ff-position.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

describe('FfShowPositionService', () => {
  beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [FFPositionComponent]
      });
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [FFPositionComponent]
      }
    });
    }
  );

  it('should be created', () => {
    const service: FFPositionService = TestBed.get(FFPositionService);
    expect(service).toBeTruthy();
  });
});
