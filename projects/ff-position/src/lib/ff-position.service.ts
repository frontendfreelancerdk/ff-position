import {
  Inject,
  Injectable,
  OnDestroy,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {from, fromEvent} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {FFOverlayService} from 'ff-overlay';
import {xAxis, yAxis} from './ff-position.types';

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
  private _margin = 8;
  private _document: Document;
  private renderer: Renderer2;
  private _windowSize = {
    height: 0,
    width: 0
  };

  private _subscriptions = [];

  private get windowSize() {
    return this._windowSize;
  }

  private set windowSize(size) {
    this._windowSize = size;
  }

  constructor(private overlayService: FFOverlayService, rendererFactory: RendererFactory2,
              @Inject(DOCUMENT) document?: any) {
    this._document = document as Document;
    this.renderer = rendererFactory.createRenderer(null, null);

    this._subscriptions.push(
      from(['resize', 'orientationchange', 'scroll']).pipe(
        mergeMap((event) => fromEvent(window, event))
      )
    );
    this._subscriptions[0].subscribe((e) => {
      if (e.type !== 'scroll') {
        this._getWindowSize();
      }

    });
  }

  private _calculateStyle(elRect, targetRect, x: xAxis, y: yAxis) {
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
        newRect.width = this.windowSize.width - targetRect.right - this._margin;
      } else if (x === 'left') {
        newRect.width = targetRect.left - this._margin;
        newRect.left = this._margin;
        newRect.justifyContent = 'flex-end';
      }
      if (y === 'start') {
        newRect.top = targetRect.top;
        newRect.height = this.windowSize.height - targetRect.top - this._margin;
      } else if (y === 'end') {
        newRect.height = (targetRect.top + targetRect.height) < 0 ? 0 : (targetRect.top + targetRect.height - this._margin);
        newRect.alignItems = 'flex-end';
        newRect.top = this._margin;
      } else if (y === 'center') {
        newRect.top = (targetRect.top + targetRect.height / 2) - elRect.height / 2;
        newRect.height = 'auto';
      }
    } else if (x === 'top' || x === 'bottom') {
      if (x === 'top') {
        newRect.alignItems = 'flex-end';
        newRect.top = this._margin;
        if (y === 'start' || y === 'end') {
          newRect.height = targetRect.top < 0 ? 0 : targetRect.top - this._margin;
        } else if (y === 'center') {
          newRect.height = targetRect.top - this._margin;
        }
      } else if (x === 'bottom') {
        newRect.top = targetRect.bottom;
        newRect.height = this.windowSize.height - targetRect.bottom - this._margin;
      }
      if (y === 'start') {
        newRect.left = targetRect.left;
        newRect.width = this.windowSize.width - targetRect.left - this._margin;
      } else if (y === 'end') {
        newRect.width = targetRect.right - this._margin;
        newRect.left = this._margin;
        newRect.justifyContent = 'flex-end';
      } else if (y === 'center') {
        newRect.width = 'auto';
        newRect.left = (targetRect.left + targetRect.width / 2) - elRect.width / 2;
      }
    }
    return newRect;
  }

  private _calculatePosition(el, target, x: xAxis, y: yAxis, previous = []) {
    this._getWindowSize();
    const elRect = el.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const wrapperRect = this._calculateStyle(elRect, targetRect, x, y);
    // TODO remove this shit and make clever method for get new axis;
    if (wrapperRect.width < elRect.width && x === 'right' && previous.indexOf('right') === -1) {
      previous.push('right');
      return this._calculatePosition(el, target, 'left', y, previous);
    } else if (wrapperRect.width < elRect.width && x === 'left' && previous.indexOf('left') === -1) {
      previous.push('left');
      return this._calculatePosition(el, target, 'right', y, previous);
    } else if (wrapperRect.height < elRect.height && x === 'top' && previous.indexOf('top') === -1) {
      previous.push('top');
      return this._calculatePosition(el, target, 'bottom', y, previous);
    } else if (wrapperRect.height < elRect.height && x === 'bottom' && previous.indexOf('bottom') === -1) {
      previous.push('bottom');
      return this._calculatePosition(el, target, 'top', y, previous);
    }
    return wrapperRect;
  }

  init(el, target, x: xAxis = 'right', y: yAxis = 'start') {
    const wrapper = this.createWrapper();
    this.renderer.appendChild(this.overlayService.getOverlay(), wrapper);
    this.renderer.appendChild(wrapper, el);
    this._subscriptions[0].subscribe(() => {
      this.setStyle(wrapper, this._calculatePosition(el, target, x, y));
    });
    this.setStyle(wrapper, this._calculatePosition(el, target, x, y));
    return wrapper;
  }

  destroy(wrapper) {
    if (wrapper) {
      this.renderer.removeChild(this.overlayService.getOverlay(), wrapper);
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
    this._subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  private createWrapper() {
    const wrapper = this.renderer.createElement('div');
    this.renderer.addClass(wrapper, 'ff-position-wrapper');
    this.renderer.setStyle(wrapper, 'position', 'absolute');
    this.renderer.setStyle(wrapper, 'left', '0');
    this.renderer.setStyle(wrapper, 'top', '0');
    this.renderer.setStyle(wrapper, 'display', 'flex');
    this.renderer.setStyle(wrapper, 'pointer-events', 'none');
    this.renderer.setStyle(wrapper, 'overflow', 'auto');
    this.renderer.setStyle(wrapper, 'scrollbar-width', 'none');
    this.renderer.setStyle(wrapper, '-ms-overflow-style', 'none');
    (document.styleSheets[0] as any).insertRule('.ff-position-wrapper::-webkit-scrollbar { width: 0; }', 0);
    return wrapper;
  }
}
