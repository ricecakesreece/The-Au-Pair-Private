/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { API } from '../../../../shared/api/api.service';
import { ScheduleModalComponent } from './schedule-modal/schedule-modal.component';

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
  auPairChildren: string[] = [];
  activities: any;
  children : any;

  constructor(private serv: API, private modalCtrl : ModalController) {}

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ScheduleModalComponent,
    });
     
    await modal.present();
  }

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
    this.serv.getChildren("7542108615984").subscribe(
      res => {
        this.children = res;
        this.children.forEach((element: { id: string; }) => {
          this.auPairChildren.push(element.id);
        });
        this.serv.getAuPairSchedule(this.auPairChildren).subscribe(
          res=>{
            console.log(res);
            this.activities = res;
          }
        );
      },
      error => { console.log("Error has occured with API: " + error); }
    );
  }
}
