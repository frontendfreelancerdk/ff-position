import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {FFPositionService, xAxis, yAxis} from '../../projects/ff-position/src/lib/ff-position.service';

@Component({
  selector: 'ff-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('trigger1') trigger1;
  @ViewChild('trigger2') trigger2;
  @ViewChild('trigger3') trigger3;
  @ViewChild('dropMenu') dropMenu;
  @ViewChild('dropMenu2') dropMenu2;
  @ViewChild('tooltip') tooltip;
  title = 'ff-position-app';
  xAxis: xAxis[] = ['right', 'left', 'top', 'bottom'];
  yAxis: yAxis[] = ['start', 'end', 'center'];
  i = 0;
  j = 0;
  x: xAxis = this.xAxis[this.i];
  y: yAxis = this.yAxis[this.i];
  _t: any;
  _d: any;
  _d2: any;


  constructor(private service: FFPositionService) {

  }

  ngAfterViewInit(): void {

  }

  menuToggle() {
    if (this._d) {
      this._d = this.service.destroy(this._d);
    } else {
      this._d = this.service.init(this.dropMenu.nativeElement, this.trigger1.nativeElement, this.x, this.y);
    }
  }

  menu2Toggle() {
    if (this._d2) {
      this._d2 = this.service.destroy(this._d2);
    } else {
      this._d2 = this.service.init(this.dropMenu2.nativeElement, this.trigger3.nativeElement, this.x, this.y);
    }
  }

  tooltipOpen() {
    if (this._t) {
      return;
    }
    this._t = this.service.init(this.tooltip.nativeElement, this.trigger2.nativeElement, 'top', 'center');
  }

  tooltipClose() {
    this._t = this.service.destroy(this._t);
  }

  forTest() {
    let i, j = i = 0;
    const x: xAxis[] = ['right', 'left', 'top', 'bottom'],
      y: yAxis[] = ['start', 'end', 'center'];
    let id = setInterval(() => {
      if (i >= x.length) {
        clearInterval(id);
        id = null;
        this.forTest();
      }


      if (j < y.length) {
        this.service.init(this.tooltip.nativeElement, this.trigger1.nativeElement, x[i], y[j]);
        j++;
      } else {
        j = 0;
        i++;
      }
    }, 5000);
  }

  toggleX() {
    this.i++;
    if (this.i >= this.xAxis.length) {
      this.i = 0;
    }
    this.x = this.xAxis[this.i];
  }

  toggleY() {
    this.j++;
    if (this.j >= this.xAxis.length) {
      this.j = 0;
    }
    this.y = this.yAxis[this.j];
  }
}
