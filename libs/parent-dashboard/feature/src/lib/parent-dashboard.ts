import { Component, OnInit } from '@angular/core';
import { API } from '../../../../shared/api/api.service';
import { auPair, Child, Parent, User } from '../../../../shared/interfaces/interfaces';
import { AuPairRatingModalComponent } from './au-pair-rating-modal/au-pair-rating-modal.component';
import { ModalController, ToastController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Handler } from 'leaflet';

@Component({
  selector: 'the-au-pair-parent-dashboard',
  templateUrl: 'parent-dashboard.html',
  styleUrls: ['parent-dashboard.scss'],
})
export class ParentDashboardComponent implements OnInit{

  children: Child[] = [];
  parentID = "";

  handlerMessage!: boolean;

  parentDetails: Parent = {
    id: "",
    children: [],
    medID: "",
    auPair: "",
  }

  userDetails: User = {
    id: '',
    fname: '',
    sname: '',
    email: '',
    address: '',
    registered: false,
    type: 0,
    password: '',
    number: '',
    salt: '',
    latitude: 0,
    longitude: 0,
    suburb: "",
    gender: "",
    birth: "",
  }

  auPairDetails: User = {
    id: "",
    fname: "",
    sname: "",
    email: "",
    address: "",
    registered: false,
    type: 0,
    password: "",
    number: "",
    salt: "",
    latitude: 0,
    longitude: 0,
    suburb: "",
    gender: "",
    birth: "",
  }

  currentAuPair: auPair = {
    id: "",
    rating: 0,
    onShift: false,
    employer: "",
    costIncurred: 0,
    distTraveled: 0,
    payRate: 0,
    bio: "",
    experience: "",
    currentLong: 0.0,
    currentLat: 0.0
  }

  constructor(private serv: API, private modalCtrl : ModalController, private store: Store, public toastCtrl: ToastController, public router: Router, private alertController: AlertController){}

  async openModal(actId : string) {
    const modal = await this.modalCtrl.create({
      component: AuPairRatingModalComponent,
      componentProps :{
        activityId : actId
      }
    });
    await modal.present();
  }

  async ngOnInit()
  {
    this.parentID = this.store.snapshot().user.id;

    await this.serv.getUser(this.parentID).toPromise()
    .then( 
      res=>{
        this.userDetails.id = res.id;
        this.userDetails.fname = res.fname;
        this.userDetails.sname = res.sname;
        this.userDetails.email = res.email;
        this.userDetails.address = res.address;
        this.userDetails.number = res.number;
        this.userDetails.salt = res.salt;
        this.userDetails.latitude = res.latitude;
        this.userDetails.longitude = res.longitude;
        this.userDetails.suburb = res.suburb;
        this.userDetails.gender = res.gender;
        this.userDetails.birth = res.birth;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
    
    await this.serv.getParent(this.parentID)
    .toPromise()
      .then( 
        res=>{
          this.parentDetails.id = res.id;      
          this.parentID = res.id;
          this.parentDetails.children = res.children;
          this.parentDetails.medID = res.medID;
          this.parentDetails.auPair = res.auPair;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )

    if(this.parentDetails.auPair != "")
    {
      await this.serv.getUser(this.parentDetails.auPair)
      .toPromise()
      .then(
        res => {
          this.auPairDetails.id = res.id;
          this.auPairDetails.fname = res.fname;
          this.auPairDetails.sname = res.sname;
          this.auPairDetails.email = res.email;
          this.auPairDetails.address = res.address;
          this.auPairDetails.number = res.number;
        },
        error => { 
          console.log("Error has occured with API: " + error);
        }
      )
    }

    this.getChildren();
  }

  async getChildren(){
    this.serv.getChildren(this.parentID).subscribe(
      res=>{
        let i = 0;
        res.forEach((element: Child) => {
          this.children[i++] = element;
        });
      },
      error =>{console.log("Error has occured with API: " + error);}
    )
  }

  async openToast(message: string)
  {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 1500,
      position: 'top',
      cssClass: 'toastPopUp'
    });
    await toast.present();
  }

  async checkHasChildren(){
    if (this.parentDetails.children.length >= 1){
      this.router.navigate(['/add-activity']);
    }
    else
    {
      this.openToast('You have no children to assign activities to');
    }
  }

  async checkHasChildrenSchedule(){
    if (this.parentDetails.children.length >= 1){
      this.router.navigate(['/schedule']);
    }
    else
    {
      this.openToast("You have no childrens' schedules to view");
    }
  }

  async checkHasChildrenExplore(){
    if (this.parentDetails.children.length < 1){
      this.openToast('You need to have children added to your profile in order to hire an Au Pair');
    }
    else if(this.parentDetails.auPair != "")
    {
      this.openToast('You already have an Au Pair employed');
    }
    else
    {
      this.router.navigate(['/explore']);
    }
  }

  async checkHasEmployer(){
    if (this.parentDetails.auPair !== ""){
      this.router.navigate(['/au-pair-cost']);
    }
    else
    {
      this.openToast('You do not have an Au Pair Employed');
    }
  }

  async checkHasEmployerTrack(){
    if (this.parentDetails.auPair !== ""){
      this.router.navigate(['/track-au-pair']);
    }
    else
    {
      this.openToast('You do not have an Au Pair Employed');
    }
  }

  async terminateAuPair()
  {
    await this.getAuPairDetails();
    await this.getParentDetails();

    this.currentAuPair.employer = "";
    this.parentDetails.auPair = "";

    await this.updateAuPair();
    await this.updateParent();

    location.reload();
  }

  async getAuPairDetails()
  {
    await this.serv.getAuPair(this.parentDetails.auPair)
    .toPromise()
      .then(
      res=>{
        this.currentAuPair.id = res.id;
        this.currentAuPair.rating = res.rating;
        this.currentAuPair.onShift = res.onShift;
        this.currentAuPair.employer = res.employer;
        this.currentAuPair.costIncurred = res.costIncurred;
        this.currentAuPair.distTraveled = res.distTraveled;
        this.currentAuPair.payRate = res.payRate;
        this.currentAuPair.bio = res.bio;
        this.currentAuPair.experience = res.experience;
        this.currentAuPair.currentLong = res.currentLong;
        this.currentAuPair.currentLat = res.currentLat;
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
  }

  async getParentDetails()
  {
    await this.serv.getParent(this.parentID)
    .toPromise()
      .then( 
        res=>{
          this.parentDetails.id = res.id;      
          this.parentDetails.children = res.children;
          this.parentDetails.medID = res.medID;
          this.parentDetails.auPair = res.auPair;
      },
      error => {
        console.log("Error has occured with API: " + error);
      }
    )
  }

  async updateAuPair(){
    await this.serv.editAuPair(this.currentAuPair).toPromise()
    .then(
      res=>{
        console.log("The response is:" + res);
        return res;
      },
      error=>{
        console.log("Error has occured with API: " + error);
        return error;
      }
    );
  }

  async updateParent(){
    await this.serv.editParent(this.parentDetails).toPromise()
    .then(
      res=>{
        console.log("The response is:" + res);
        return res;
      },
      error=>{
        console.log("Error has occured with API: " + error);
        return error;
      }
    );
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Terminate Contract?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: () => { this.terminateAuPair(); }
        }
      ]
    });

    await alert.present();
  }
}
