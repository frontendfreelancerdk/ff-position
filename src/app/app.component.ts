import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {FFPositionService, xAxis, yAxis} from '../../projects/ff-position/src/lib/ff-position.service';
import {el} from '@angular/platform-browser/testing/src/browser_util';

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
  @ViewChild('tooltip') tooltip;
  title = 'ff-position-app';


  constructor(private service: FFPositionService) {

  }

  ngAfterViewInit(): void {
    this.service.init(this.dropMenu.nativeElement, this.trigger1.nativeElement, 'right', 'center');
    // this.service.init(this.tooltip.nativeElement, this.trigger1.nativeElement, 'left', 'center');

    // this.forTest();
    // this.lightTest();
  }

  lightTest() {
    let i = 0;
    setInterval(() => {
        this.service.init(this.dropMenu.nativeElement, this.trigger1.nativeElement, i % 2 ? 'left' : 'right', 'center');
        i++;
      }, 5000
    );
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
        console.log(`x: ${x[i]}, y: ${y[j]}`);
        j++;
      } else {
        j = 0;
        i++;
      }
    }, 5000);
  }
}
