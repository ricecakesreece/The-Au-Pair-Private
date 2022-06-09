import { Component, OnInit } from '@angular/core';
import { API } from '../../../../shared/api/api.service';
import { Child, Parent, User } from '../../../../shared/interfaces/interfaces';

@Component({
  selector: 'the-au-pair-parent-dashboard',
  templateUrl: 'parent-dashboard.html',
  styleUrls: ['parent-dashboard.scss'],
})
export class ParentDashboardComponent implements OnInit{

  children: any[] = [];
  parentID = "";

  parentDetails: Parent = {
    id: "",
    cildren: [],
    medID: "",
    auPair: "",
  }

  childDetails: Child = {
    id: "",
    fname: "",
    sname: "",
    allergies: "",
    diet: "",
    parent: "",
  }

  userDetails: User = {
    id: "",
    fname: "",
    sname: "",
    email: "",
    address: "",
    registered: false,
    type: 0,
    password: "",
    number: "",
  }

  constructor(private serv: API){}

  ngOnInit(): void
  {
    this.getParentDetails()
  }

  async getParentDetails()
  {
    await this.serv.getParent("4561237814867").subscribe(
      res=>{
        this.parentDetails.id = res.id;       
        this.parentID = res.id;
        this.parentDetails.cildren = res.cildren;
        this.parentDetails.medID = res.medID;
        this.parentDetails.auPair = res.auPair;
      },
      error=>{console.log("Error has occured with API: " + error);}
    )
    await this.serv.getUser("7542108615984").subscribe(
      res=>{
        this.userDetails.id = res.id;
        this.userDetails.fname = res.fname;
        this.userDetails.sname = res.sname;
        this.userDetails.email = res.email;
        this.userDetails.address = res.address;
        this.userDetails.registered = res.registered;
        this.userDetails.type = res.type;
        this.userDetails.password = res.password;
        this.userDetails.number = res.number;
      },
      error=>{console.log("Error has occured with API: " + error);}
    )

    this.getChildren()
  }

  async getChildren(){
    this.serv.getChildren("4561237814867").subscribe(
      res=>{
        let i = 0;
        res.forEach((element: string) => {
          this.children[i++] = element;
        });
        console.log(this.children);
        
      },
      error =>{console.log("Error has occured with API: " + error);}
    )
  }

}
