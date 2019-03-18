import {TestBed} from '@angular/core/testing';

import {FFPositionService} from './ff-position.service';
import {FFOverlayModule} from 'ff-overlay';

describe('FfShowPositionService', () => {
  beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [FFOverlayModule]
      });
    }
  );

  it('should be created', () => {
    const service: FFPositionService = TestBed.get(FFPositionService);
    expect(service).toBeTruthy();
  });
});
