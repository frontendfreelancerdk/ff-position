import {
  Injectable,
  OnDestroy,
  Renderer2,
  RendererFactory2
} from '@angular/core';

import {from, fromEvent} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {FFOverlayService} from 'ff-overlay';
import {xAxis, yAxis} from './ff-position.types';
import {FFResizeSensorService} from 'ff-resize-sensor';

export interface Direction {
  x: xAxis;
  y: yAxis;
}

export interface BoundingRect {
  top: number | string;
  left: number | string;
  height: number | string;
  width: number | string;
  justifyContent: string;
  alignItems: string;
}

@Injectable({
  providedIn: 'root'
})
export class FFPositionService implements OnDestroy {
  // TODO make margin for all directions
  private _margin = 0;
  get margin(): number {
    return this._margin;
  }

  set margin(val: number) {
    this._margin = val;
  }

  private _document: Document;
  private renderer: Renderer2;
  private _windowSize = {
    height: 0,
    width: 0
  };

  private _subscription;

  private get windowSize() {
    return this._windowSize;
  }

  private set windowSize(size) {
    this._windowSize = size;
  }

  constructor(private overlayService: FFOverlayService,
              private resizeService: FFResizeSensorService,
              rendererFactory: RendererFactory2) {
    this._document = document as Document;
    this.renderer = rendererFactory.createRenderer(null, null);

    this._subscription =
      from(['resize', 'orientationchange', 'scroll']).pipe(
        mergeMap((event) => fromEvent(window, event)));
    this._subscription.subscribe((e) => {
      if (e.type !== 'scroll') {
        this._getWindowSize();
      }
    });
  }

  private _calculateStyle(elRect, targetRect, x: xAxis, y: yAxis, scroll) {
    const newRect: BoundingRect = {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    };

    if (x === 'right' || x === 'left') {
      if (x === 'right') {
        newRect.left = targetRect.right;
        newRect.width = this._windowSize.width - targetRect.right - this.margin;
      } else if (x === 'left') {
        newRect.width = targetRect.left - this.margin;
        newRect.left = this.margin;
        newRect.justifyContent = 'flex-end';
      }
      if (y === 'start') {
        newRect.top = targetRect.top;
        newRect.height = this.windowSize.height - targetRect.top - (scroll ? this.margin : 0);
      } else if (y === 'end') {
        newRect.height = (targetRect.top + targetRect.height) < 0 ? 0 : (targetRect.top + targetRect.height - this.margin);
        newRect.alignItems = (newRect.height <= elRect.height && scroll) ? 'flex-start' : 'flex-end';
        newRect.top = this.margin;
      } else if (y === 'center') {
        newRect.top = (targetRect.top + targetRect.height / 2) - elRect.height / 2;
        // TODO fix that:
        newRect.height = 'auto';
      }
    } else if (x === 'top' || x === 'bottom') {
      if (x === 'top') {
        newRect.top = scroll ? this.margin : 0;
        newRect.height = targetRect.top < 0 ? 0 : targetRect.top - (scroll ? this.margin : 0);
        newRect.alignItems = scroll && newRect.height < elRect.height ? 'flex-start' : 'flex-end';
      } else if (x === 'bottom') {
        newRect.top = targetRect.bottom;
        newRect.height = this.windowSize.height - targetRect.bottom - this.margin;
      }
      if (y === 'start') {
        newRect.left = targetRect.left;
        newRect.width = this.windowSize.width - targetRect.left - this.margin;
      } else if (y === 'end') {
        newRect.width = targetRect.right - this.margin;
        newRect.left = this.margin;
        newRect.justifyContent = 'flex-end';
      } else if (y === 'center') {
        newRect.left = (targetRect.left + targetRect.width / 2) - elRect.width / 2;
        // TODO fix that:
        newRect.width = 'auto';
      }
    }
    return newRect;
  }

  private _calculatePosition(el, target, x: xAxis, y: yAxis, scroll, previous = []) {
    this._getWindowSize();
    const elRect = el.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const wrapperRect = this._calculateStyle(elRect, targetRect, x, y, scroll);
    // TODO remove this shit and make clever method for get new axis;
    if (wrapperRect.width < elRect.width && x === 'right' && previous.indexOf('right') === -1) {
      previous.push('right');
      return this._calculatePosition(el, target, 'left', y, scroll, previous);
    } else if (wrapperRect.width < elRect.width && x === 'left' && previous.indexOf('left') === -1) {
      previous.push('left');
      return this._calculatePosition(el, target, 'right', y, scroll, previous);
    //  TODO else if x===right or left and array has x and left , but wrapper with less then element wiht - use another method
    } else if (wrapperRect.height < elRect.height && x === 'top' && previous.indexOf('top') === -1) {
      previous.push('top');
      return this._calculatePosition(el, target, 'bottom', y, scroll, previous);
    } else if (wrapperRect.height < elRect.height && x === 'bottom' && previous.indexOf('bottom') === -1) {
      previous.push('bottom');
      return this._calculatePosition(el, target, 'top', y, scroll, previous);
    }
    return wrapperRect;
  }

  init(el, target, x: xAxis = 'right', y: yAxis = 'start', scroll = false) {
    const wrapper = this.createWrapper(scroll);
    this.overlayService.appendChild(wrapper);
    this.renderer.appendChild(wrapper, el);
    this.resizeService.subscribe(el, (e) => {
      this.setStyle(wrapper, this._calculatePosition(el, target, x, y, scroll));
    });
    this._subscription.subscribe(() => {
      this.setStyle(wrapper, this._calculatePosition(el, target, x, y, scroll));
    });
    this.setStyle(wrapper, this._calculatePosition(el, target, x, y, scroll));
    return wrapper;
  }

  destroy(wrapper) {
    if (wrapper) {
      this.overlayService.removeChild(wrapper);
    }
  }

  private setStyle(el, styles) {
    this.renderer.setStyle(el, 'top', styles.top + (styles.top !== 'auto' ? 'px' : ''));
    this.renderer.setStyle(el, 'left', styles.left + (styles.left !== 'auto' ? 'px' : ''));
    this.renderer.setStyle(el, 'height', styles.height + (styles.height !== 'auto' ? 'px' : ''));
    this.renderer.setStyle(el, 'width', styles.width + (styles.width !== 'auto' ? 'px' : ''));
    this.renderer.setStyle(el, 'alignItems', styles.alignItems);
    this.renderer.setStyle(el, 'justifyContent', styles.justifyContent);
  }

  private _getWindowSize() {
    const size = {
      height: this._document.documentElement.clientHeight,
      width: this._document.documentElement.clientWidth
    };
    this.windowSize = size;
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private createWrapper(scroll) {
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'ff-position-wrapper');
    this.renderer.setStyle(wrapper, 'position', 'absolute');
    this.renderer.setStyle(wrapper, 'left', '0');
    this.renderer.setStyle(wrapper, 'top', '0');
    this.renderer.setStyle(wrapper, 'display', 'flex');
    this.renderer.setStyle(wrapper, 'pointer-events', 'none');
    this.renderer.setStyle(wrapper, 'overflow', scroll ? 'auto' : 'hidden');
    /*    this.renderer.setStyle(wrapper, 'overflow', scroll ? 'auto' : 'hidden');
      this.renderer.setStyle(wrapper, 'scrollbar-width', 'none');
       this.renderer.setStyle(wrapper, '-ms-overflow-style', 'none');
       (document.styleSheets[0] as any).insertRule('.ff-position-wrapper::-webkit-scrollbar { width: 0; }', 0);*/
    return wrapper;
  }
}
