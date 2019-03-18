import {
  ApplicationRef,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  Inject,
  Injectable,
  Injector,
  OnDestroy,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import {DOCUMENT} from '@angular/common';

import {from, fromEvent} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {FFOverlayService} from 'ff-overlay';

export type xAxis = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type yAxis = 'start' | 'center' | 'end' | 'before' | 'after';

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

  private _calculateStyle(el, target, x: xAxis, y: yAxis) {
    this._getWindowSize();
    const elRect = el.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
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
        newRect.width = this.windowSize.width - targetRect.right;
      } else if (x === 'left') {
        newRect.width = targetRect.left;
        newRect.justifyContent = 'flex-end';
      }
      if (y === 'start') {
        newRect.top = targetRect.top;
        newRect.height = this.windowSize.height - targetRect.top;
      } else if (y === 'end') {
        newRect.height = (targetRect.top + targetRect.height) < 0 ? 0 : (targetRect.top + targetRect.height);
        newRect.alignItems = 'flex-end';
      } else if (y === 'center') {
        newRect.top = (targetRect.top + targetRect.height / 2) - elRect.height / 2;
        newRect.height = 'auto';
      }
    } else if (x === 'top' || x === 'bottom') {
      if (x === 'top') {
        newRect.alignItems = 'flex-end';
        if (y === 'start' || y === 'end') {
          newRect.height = targetRect.top < 0 ? 0 : targetRect.top;
        } else if (y === 'center') {
          newRect.height = targetRect.top;
        }
      } else if (x === 'bottom') {
        newRect.top = targetRect.bottom;
        newRect.height = this.windowSize.height - targetRect.bottom;
      }
      if (y === 'start') {
        newRect.left = targetRect.left;
        newRect.width = this.windowSize.width - targetRect.left;
      } else if (y === 'end') {
        newRect.width = targetRect.right;
        newRect.justifyContent = 'flex-end';
      } else if (y === 'center') {
        newRect.width = 'auto';
        newRect.left = (targetRect.left + targetRect.width / 2) - elRect.width / 2;
      }
    }
    return newRect;
  }

  init(el, target, x: xAxis = 'right', y: yAxis = 'start') {
    const wrapper = this.createWrapper();
    this.renderer.appendChild(this.overlayService.getOverlay(), wrapper);
    this.renderer.appendChild(wrapper, el);
    this.setStyle(wrapper, this._calculateStyle(el, target, x, y));
    this._subscriptions[0].subscribe(() => {
      this.setStyle(wrapper, this._calculateStyle(el, target, x, y));
    });


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
    this.renderer.setStyle(wrapper, 'pointer-events', 'auto');

    this.renderer.setStyle(wrapper, 'overflow', 'auto');
    this.renderer.setStyle(wrapper, 'scrollbar-width', 'none');
    this.renderer.setStyle(wrapper, '-ms-overflow-style', 'none');
    (document.styleSheets[0] as any).insertRule('.ff-position-wrapper::-webkit-scrollbar { width: 0; }', 0);

    return wrapper;
  }
}
