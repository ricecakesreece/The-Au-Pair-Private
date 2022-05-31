import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { API } from '../../../../shared/api/api.service';

@Component({
  selector: 'the-au-pair-au-pair-schedule',
  templateUrl: './au-pair-schedule.component.html',
  styleUrls: ['./au-pair-schedule.component.scss'],
})
export class AuPairScheduleComponent implements OnInit {
  days = [
    "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
  ]

  curDay =  this.getCurDay(this.days);
  activities: any;

  constructor(private serv: API) {}

  ngOnInit(): void {
      this.getActivities();
  }

  getCurDay(days : string[]) : number {
    const pipe = new DatePipe('en-US');
    const dateStr = pipe.transform(Date.now(),'EEEE');
    return days.findIndex(x => x === dateStr);
  }

  async getActivities()
  {
    this.serv.getSchedule().subscribe(
      res=>{
          this.activities = res;
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
  }
}
