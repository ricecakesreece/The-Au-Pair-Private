import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { API } from '../../../../shared/api/api.service'
import { ModalController } from '@ionic/angular';
import { ExtraCostsModalComponent } from './extra-costs-modal/extra-costs-modal.component';
import { EditRateModalComponent } from './edit-rate-modal/edit-rate-modal.component';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'the-au-pair-au-pair-cost',
  templateUrl: './au-pair-cost.component.html',
  styleUrls: ['./au-pair-cost.component.scss'],
  providers: [API]
})
export class AuPairCostComponent implements OnInit {

  costList : any [] = [];
  type = -1;
  parentID = "";
  aupairID = "";
  days = [
    "Mon","Tue","Wed","Thu","Fri","Sat","Sun"
  ];

  months = [
    "January","February","March","April","May","June","July","August","September","October","November","December"
  ];

  dayHoursWorked = [
    0, 0, 0, 0, 0, 0 ,0
  ];

  auPairName = "";
  employerName = "";
  hourlyRate = 0;
  totalHours = 0;
  totalRemuneration = 0;

  travelCost = 0;
  activityCost = 0;
  otherCost = 180;
  totalCost = 0;

  otherDeg = 0;
  activityDeg = 0;

  dateRange = "";

  pieSplit = "";

  constructor(private api:API, private store: Store, private modalCtrl : ModalController, private alertController : AlertController) { }

  async openExtraCostsModal() {
    const modal = await this.modalCtrl.create({
      component: ExtraCostsModalComponent
    });

    modal.onDidDismiss().then((data) => {
      this.api.getCurrentMonthCostsForJob(this.aupairID, this.parentID).subscribe(
        data => { 
          this.costList = data;
        },
        error => {
          console.log("Error has occured with API: " + error);
        }
      )
    });

    await modal.present();
  }

  async openEditRateModal() {
    const modal = await this.modalCtrl.create({
      component: EditRateModalComponent
    });

    modal.onDidDismiss().then((data) => {
      this.api.getAuPair(this.aupairID).toPromise()
      .then(
      data => {
        this.hourlyRate = data.payRate;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
    });

    await modal.present();
  }

  async ngOnInit() {
    
    this.type = this.store.snapshot().user.type;
    
    if(this.store.snapshot().user.type === 2) 
    {
      this.aupairID = this.store.snapshot().user.id;
    }
    else if (this.store.snapshot().user.type === 1) 
    {
      this.parentID = this.store.snapshot().user.id;
      await this.api.getParent(this.parentID)
      .toPromise()
      .then(
        data => {
          this.aupairID = data.auPair;
        }
      )
      .catch(
        error => {
          console.log("Error has occured with API: " + error);
        }
      )
    }

    this.api.getUser(this.aupairID).subscribe( 
      data => { 
        this.auPairName = data.fname
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )

    this.api.getMonthMinutes(this.aupairID, this.getStartDateOfWeek(0)).subscribe( 
      data => {
        this.totalHours = Number((data/60).toFixed(2));
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )

    await this.api.getAuPair(this.aupairID).toPromise()
    .then(
      data => {
        this.parentID = data.employer;
        this.hourlyRate = data.payRate;
        this.travelCost = data.distTraveled;
        this.activityCost = data.costIncurred;
        this.otherCost = 0;
        this.totalCost = this.travelCost + this.activityCost + this.otherCost;
        this.totalCost = Number(this.totalCost.toFixed(3));
        this.totalRemuneration = (this.hourlyRate * this.totalHours) + this.totalCost;
        this.totalRemuneration = Number(this.totalRemuneration.toFixed(3));

        this.calculatePie(this.otherCost, this.activityCost, this.totalCost);
        this.populateDaysCost();
        this.dateRange = this.dateRangeToString(7);
        this.pieSplit = "conic-gradient(var(--ion-color-primary)" + this.otherDeg + "deg, var(--ion-color-secondary) 0 " + this.activityDeg + "deg, var(--ion-color-champagne) 0)";
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )

    if(this.store.snapshot().user.type === 2) 
    {
      this.api.getUser(this.parentID).subscribe( 
        data => { 
          this.employerName = data.fname
        },
        error => {
          console.log("Error has occured with API: " + error);
        }
      )
    }

    this.api.getCurrentMonthCostsForJob(this.aupairID, this.parentID).subscribe(
      data => { 
        this.costList = data;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
  }

  calculatePie(other:number, act:number, total:number) {
    this.otherDeg = (360/total)*other;
    this.activityDeg = this.otherDeg + (360/total)*act;
  }

  populateDaysCost() {
    for (let i = 0; i < 7; i++) {
      
      const weekDay = this.getStartDateOfWeek(i);
      this.api.getDateMinutes(this.aupairID, weekDay).subscribe( 
        data => {
          this.dayHoursWorked[i] = data/60;
        },
        error => {
          console.log("Error has occured with API: " + error);
        }
      )
    }
  }

  deleteCost(id: string) {
    this.api.removeUserCost(id).subscribe(
      data => { 
        console.log(data);
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )

    location.reload();
  }

  getStartDateOfWeek(dow : number) {
    const now = new Date();
    const day = now.getDay();
    now.setMonth(now.getMonth()+1);
    
    const diff =  new Date(now.setDate(now.getDate() - day + dow + (day == 0 ? 6:1)));

    const strDate = ('0' + diff.getDate()).slice(-2) + "/" + ('0' + diff.getMonth()).slice(-2) +
    "/" + diff.getFullYear();

    return strDate;
  }

  dateRangeToString(range : number) {
    const now = new Date();
    const day = now.getDay();
    
    const diff =  new Date(now.setDate(now.getDate() - day + (day == 0 ? 6:1)));
    const next = new Date(diff);

    next.setDate(next.getDate() + range);
    const strDate = ('0' + diff.getDate()).slice(-2) + " " + (this.months[diff.getMonth()]) +
    " - " + ('0' + (next.getDate())).slice(-2) + " " + (this.months[next.getMonth()])

    return strDate;
  }

  async presentAlert(id : string) {
    const alert = await this.alertController.create({
      header: 'Remove Cost?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: () => { this.deleteCost(id); }
        }
      ]
    });

    await alert.present();
  }
}
