import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {FFPositionService} from '../../projects/ff-position/src/lib/ff-position.service';

@Component({
  selector: 'ff-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  @ViewChild('trigger1') trigger1;
  @ViewChild('trigger2') trigger2;
  @ViewChild('trigger3') trigger3;
  @ViewChild('dropMenu') dropMenu;
  @ViewChild('tooltip') tooltip;
  title = 'ff-position-app';

  constructor(private service: FFPositionService) {

  }

  ngAfterViewInit(): void {
    // this.service.init(this.dropMenu.nativeElement, this.trigger1.nativeElement, 'left', 'center', true);
    this.service.init(this.tooltip.nativeElement, this.trigger1.nativeElement, 'top', 'center', true);
  }
}
