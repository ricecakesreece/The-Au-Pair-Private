import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { API } from '../../../../shared/api/api.service';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { auPair, Parent } from '../../../../shared/interfaces/interfaces';

@Component({
  selector: 'the-au-pair-hire-requests',
  templateUrl: './hire-requests.component.html',
  styleUrls: ['./hire-requests.component.scss'],
})
export class HireRequestsComponent implements OnInit {
  auPairID = "";
  contracts : any;
  
  contractDetails : any = {
    id: "",
    parentID: "",
    auPairID: "",
    timestamp: "",
    parentName: "",
    parentSurname: "",
    parentEmployee: "",
    auPairEmployer: "",
  }
  ContractArray : any[] = [];

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

  parentDetails: Parent = {
    id: "",
    children: [],
    medID: "",
    auPair: "",
  }

  constructor(private serv: API, private modalCtrl : ModalController, public toastCtrl: ToastController, private store: Store, private router: Router) {}

  ngOnInit(): void 
  {
    this.auPairID = "9845621036712";
    this.getContracts();
  }

  async getContracts()
  {
    await this.serv.getAllContracts().subscribe(
      res=>{
        this.contracts = res;
        this.setContractArray()
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
  }

  setContractArray()
  {
    this.contracts.forEach((c: { id: any, parentID: any; auPairID: any; timestamp: any; parentName: any; parentSurname: any; parentEmployee: any;}) => {
      this.serv.getParent(c.parentID).subscribe(
        res=>{
          if(res.auPair === "")
          {
            this.serv.getAuPair(c.auPairID).subscribe(
              res=>{                
                if(res.employer === "")
                {
                  this.serv.getUser(c.parentID).subscribe(
                    res=>{
                      const contractDetails = {
                        id: c.id,
                        parentID: c.parentID,
                        auPairID: c.auPairID,
                        timestamp: c.timestamp,
                        parentName: res.fname,
                        parentSurname: res.sname,
                      }
                      if(c.auPairID == this.auPairID)
                      {
                        this.ContractArray.push(contractDetails);
                      }
                    },
                    error=>{console.log("Error has occured with API: " + error);}
                  )
                }
                },
                error=>{console.log("Error has occured with API: " + error);}
            )
          }
        },
        error=>{console.log("Error has occured with API: " + error);}
      )
    });
    console.log(this.ContractArray);
  }
  
  async errToast()
  {
    const toast = await this.toastCtrl.create({
      message: 'Request has been rejected.',
      duration: 1000,
      position: 'top',
      cssClass: 'toastPopUp'
    });
    await toast.present();
  }

  async sucToast()
  {
    const toast = await this.toastCtrl.create({
      message: 'Request has been accepted!',
      duration: 1000,
      position: 'top',
      color: 'primary',
      cssClass: 'toastPopUp'
    });
    await toast.present();
  }

  closeModal()
  {
    this.modalCtrl.dismiss();
  }

  acceptRequest(cID : string, parentID : string)
  {
    this.sucToast();    

    this.getAuPairDetails();
    this.getParentDetails(parentID);

    this.currentAuPair.employer = parentID;
    this.parentDetails.auPair = this.auPairID;

    this.updateAuPair();
    this.updateParent();

    this.serv.removeContract(cID).subscribe(
      res=>{
        this.router.navigate(['/au-pair-dashboard']);
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
  }

  rejectRequest(cID : string)
  {
    this.serv.removeContract(cID).subscribe(
      res=>{
        location.reload();
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
  }

  async getAuPairDetails()
  {
    await this.serv.getAuPair(this.auPairID)
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

  async getParentDetails(parentID : string)
  {
    await this.serv.getParent(parentID)
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

  updateAuPair(){
    this.serv.editAuPair(this.currentAuPair).toPromise()
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

  updateParent(){
    this.serv.editParent(this.parentDetails).toPromise()
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
}
  
