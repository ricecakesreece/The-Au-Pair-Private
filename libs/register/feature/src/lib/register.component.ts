import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { User, auPair, Parent, Email } from '../../../../shared/interfaces/interfaces';
import { API } from '../../../../shared/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'the-au-pair-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public parentRegisterDetailsForm: FormGroup;
  public submitAttempt: boolean;
  public notSamePasswords: boolean;
  public locationError: boolean;
  public bioError: boolean;
  public experienceError: boolean;
  public registering: boolean;
  public formValid = false;
  public emailSent = false;
  public parentChosen;

  sub = this.route.queryParamMap.subscribe(
    params => {
      this.parentChosen = params.get('parentPressed') === 'true' || params.get('parentPressed') == null  ?  true : false;
    }
  );

  public maleChosen: boolean;
  long = 0;
  lat = 0;
  foundSuburb =  "";

  userDetails: User ={
    id: '',
    fname: '',
    sname: '',
    email: '',
    address: '',
    registered: false,
    type: 3,
    password: '',
    number: '',
    salt: '',
    latitude: 0.0,
    longitude: 0.0,
    suburb: "",
    gender: "",
    fcmToken : "",
    birth: "",
    warnings: 0,
    banned: "",
  }

  emailRequest: Email ={
    to: '',
    subject: '',
    body: '',
  }

  parentDetails: Parent ={
    id: '',
    children: [],
    medID: '',
    auPair: '',
    rating: []
  }

  aupairDetails: auPair ={
    id: '',
    rating: [],
    onShift: false,
    employer: '',
    costIncurred: 0,
    distTraveled: 0,
    payRate: 100,
    bio: '',
    experience: '',
    currentLong: 0.0,
    currentLat : 0.0,
    alreadyOutOfBounds: false,
    terminateDate: "",
  }

  constructor(private route : ActivatedRoute, public router: Router, public formBuilder: FormBuilder, public toastCtrl: ToastController, private http: HttpClient, private serv: API) 
  {
    this.parentRegisterDetailsForm = formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z ,\'-]+$'), Validators.required])],
      surname : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z ,\'-]+$'), Validators.required])],
      email : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'), Validators.required])],
      phone : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^(\\+27|0)[6-8][0-9]{8}$'), Validators.required])],
      id : ['', Validators.compose([Validators.maxLength(13), Validators.pattern('(((\\d{2}((0[13578]|1[02])(0[1-9]|[12]\\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\\d|30)|02(0[1-9]|1\\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\\d{4})( |-)(\\d{3})|(\\d{7}))'), Validators.required])],
      medAid : ['', Validators.compose([Validators.maxLength(200)])],
      location : ['', Validators.compose([Validators.required])],
      bio : ['', Validators.compose([Validators.maxLength(1000)])],
      experience : ['', Validators.compose([Validators.maxLength(1000)])],
      pass : ['', Validators.compose([Validators.maxLength(20), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'), Validators.required])],
      confPass : ['', Validators.compose([Validators.maxLength(30), Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'), Validators.required])],
    });
    this.parentChosen = true;

    this.parentRegisterDetailsForm.valueChanges.subscribe(() => {
      this.formValid = this.parentRegisterDetailsForm.valid;

      if(!this.parentChosen)
      {
        if(this.parentRegisterDetailsForm.value.experience === '')
        {
          this.formValid = false;
        }

        if(this.parentRegisterDetailsForm.value.bio === '')
        {
          this.formValid = false;
        }
      }

      if(!this.parentRegisterDetailsForm.controls['location'].valid)
      {
        this.formValid = false;
      }
      else
      {
          if (this.locationError)
          {
            this.formValid = false;
          }
      }

      if(this.parentRegisterDetailsForm.value.pass != this.parentRegisterDetailsForm.value.confPass)
      {
        this.formValid = false;
      }

    });

    this.submitAttempt = false;
    this.notSamePasswords = false;
    this.locationError = false;
    this.bioError = false;
    this.experienceError = false;
    this.maleChosen = true;
    this.registering = false;
  }

  async registerUser() 
  {
    //setting registering flag to true to disable button
    this.registering = true;
    this.locationError = false;
    this.submitAttempt = true;
    this.notSamePasswords = false;
    this.bioError = false;
    this.experienceError = false;
    let formError = false;

    if(!this.parentChosen)
    {
      if(this.parentRegisterDetailsForm.value.experience === '')
      {
        this.experienceError = true;
        formError = true;
      }

      if(this.parentRegisterDetailsForm.value.bio === '')
      {
        this.bioError = true;
        formError = true;
      }
    }

    if(!this.parentRegisterDetailsForm.controls['location'].valid)
    {
      formError = true;
    }
    else
    {
        await this.verifyLocation(this.parentRegisterDetailsForm.value.location);

        if (this.locationError)
        {
          this.openToast("Please select a valid location from the suggested below.");
          formError = true;
        }
    }

    if(this.parentRegisterDetailsForm.value.pass != this.parentRegisterDetailsForm.value.confPass)
    {
      this.notSamePasswords = true;
    }

    if(!formError && this.parentRegisterDetailsForm.controls['name'].valid && this.parentRegisterDetailsForm.controls['surname'].valid && this.parentRegisterDetailsForm.controls['email'].valid && this.parentRegisterDetailsForm.controls['phone'].valid && this.parentRegisterDetailsForm.controls['id'].valid && this.parentRegisterDetailsForm.controls['medAid'].valid && this.parentRegisterDetailsForm.controls['location'].valid && this.parentRegisterDetailsForm.controls['bio'].valid && this.parentRegisterDetailsForm.controls['experience'].valid && this.parentRegisterDetailsForm.controls['pass'].valid && this.parentRegisterDetailsForm.controls['confPass'].valid)
    {
      let application = "";
      this.userDetails.id = this.parentRegisterDetailsForm.value.id;
      this.userDetails.birth = this.convertIDtoDate(this.parentRegisterDetailsForm.value.id);
      this.userDetails.fname = this.parentRegisterDetailsForm.value.name;
      this.userDetails.sname = this.parentRegisterDetailsForm.value.surname;
      this.userDetails.email = (this.parentRegisterDetailsForm.value.email).toLowerCase();
      this.userDetails.address = this.parentRegisterDetailsForm.value.location;
      this.userDetails.longitude = this.long;
      this.userDetails.latitude = this.lat;
      this.userDetails.suburb = this.foundSuburb;

      if(this.maleChosen) {
        this.userDetails.gender = "male";
      }
      else {
        this.userDetails.gender = "female";
      }
      
      this.userDetails.number = this.parentRegisterDetailsForm.value.phone;
      this.userDetails.password = this.parentRegisterDetailsForm.value.pass;

      if(this.parentChosen)
      {
        this.userDetails.type = 1;
        this.userDetails.registered = true;
      }
      else
      {
        this.userDetails.type = 2;
        this.userDetails.registered = false;
      }

      await this.serv.register(this.userDetails)
      .toPromise()
      .then(
        res => {
          application = res;
        },
        error => {
          console.log(error);
        }
      )

      if(application == "pending")
      {
        if(this.parentChosen)
        {
          this.openToast("Registration successfull");
          this.parentDetails.id = this.userDetails.id;
          this.parentDetails.medID = this.parentRegisterDetailsForm.value.medAid;

          if(this.maleChosen) {
            this.userDetails.gender = "male";
          }
          else {
            this.userDetails.gender = "female";
          }
          
          this.userDetails.number = this.parentRegisterDetailsForm.value.phone;
          this.userDetails.password = this.parentRegisterDetailsForm.value.pass;

          if(this.parentChosen)
          {
            this.userDetails.type = 1;
            this.userDetails.registered = true;
          }
          else
          {
            this.userDetails.type = 2;
            this.userDetails.registered = false;
          }

          await this.serv.addParent(this.parentDetails)
          .toPromise()
          .then(
            async res => {
              await this.sendParentEmail();
              this.router.navigate(['/login-page']);
              console.log("The response is:" + res);
            },
            error => {
              console.log("Error has occured with API: " + error);
            }
          )
        }
        else
        {
          this.openToast("Registration succesfull pending approval");
          this.aupairDetails.id = this.userDetails.id;
          this.aupairDetails.bio = this.parentRegisterDetailsForm.value.bio;
          this.aupairDetails.experience = this.parentRegisterDetailsForm.value.experience;

          this.serv.addAuPair(this.aupairDetails)
          .toPromise()
          .then(
            async res => {
              await this.sendAuPairEmail();
              await this.sendAdminEmail();
              this.router.navigate(['/login-page']);
              console.log("The response is:" + res);
            },
            error => {
              console.log("Error has occured with API: " + error);
            }
          )
        }
      }
      else if(application.substring(0,7) == "Banned ")
      {
        this.openToast("Email or ID has been banned : " + application);
      }
      else if (application == "ID"){
        this.openToast("ID already in use!");
      }
      else
      {
        this.openToast("Account already exists with email : " + application);
      }
    }
    this.registering = false;
  }
 
  async openToast(message: string)
  {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'primary',
      cssClass: 'toastPopUp'
    });
    await toast.present();
  }

  async verifyLocation(loc : string)
  {    
    this.locationError = true;

    const locationParam = loc.replace(' ', '+');
    const params = locationParam + '&limit=4&format=json&polygon_geojson=1&addressdetails=1';
    
    //Make the API call
    await this.http.get('https://nominatim.openstreetmap.org/search?q='+params)
    .toPromise()
    .then(data=>{ // Success
      //Populate potential Locations Array
      const json_data = JSON.stringify(data);
      const res = JSON.parse(json_data);

      //Jump out if no results returned
      if(json_data === "{}")
      {
        return;
      }
  
      //Add returned data to the array
      const len = res.length;
      for (let j = 0; j < len && j<4; j++) 
      { 
        if(loc == res[j].display_name) {
          this.locationError = false;
          
          this.long = res[j].lon;
          this.lat = res[j].lat;

          if(res[j].address.suburb != undefined && res[j].address.suburb != null) {
            this.foundSuburb =  res[j].address.suburb;
          }
          else if(res[j].address.town != undefined && res[j].address.town != null) {
            this.foundSuburb =  res[j].address.town;
          }
          else {
            this.foundSuburb = res[j].address.city;
          }

          break;
        }
      }
    })
    .catch(error=>{ // Failure
      console.log(error);
    });
  }

  convertIDtoDate(id: string) : string {
    const year = id.substring(0, 2);
    const month = id.substring(2, 4);
    const day = id.substring(4, 6);
    
    const thisYear = new Date().getFullYear().toString().substring(2, 4);

    if(year >= thisYear)
    {
      return month + "/" + day + "/19" + year;
    }
    else 
    {
      return month + "/" + day + "/20" + year;
    }
  }

  async sendParentEmail(){
    this.emailRequest.to = this.userDetails.email;
    this.emailRequest.subject = "Welcome to The Au Pair!";
    this.emailRequest.body = "Thank you for registering with The Au Pair. We hope you find the perfect" + 
                                " au pair for your child. Please take some time to add all the necessary" +
                                " details of your children to ensure a great experience! \n\n" + "Regards, \n" + "The Au Pair Team";
    await this.serv.sendEmail(this.emailRequest).toPromise().then(
      res => {
        console.log("Email sent " + res );
        this.emailSent = true;
      },
      error => {
        console.log("Email not sent, Error has occured with API: " + error);
      });
  }

  async sendAuPairEmail(){
    this.emailRequest.to = this.userDetails.email;
    this.emailRequest.subject = "Welcome to The Au Pair!";
    this.emailRequest.body = "Thank you for registering with The Au Pair.\n\n" +
                              "Please note that your account as an Au Pair is being approved by our hard working admin team."+
                              "You should receive an email soon confirming your application status!\n\n" + "Regards, \n" + "The Au Pair Team";
    await this.serv.sendEmail(this.emailRequest).toPromise().then(
      res => {
        console.log("Email sent " + res );
        this.emailSent = true;
      },
      error => {
        console.log("Email not sent, Error has occured with API: " + error);
      });
  }

  async sendAdminEmail(){
    this.emailRequest.to = "cheemschaps@gmail.com";
    this.emailRequest.subject = "New Au Pair Sign Up";
    this.emailRequest.body = "A new Au Pair has signed up!\n\n Please log into the admin console to review their application."+
                             " Remember to be thorough when applicants are rejected and give advice on what they an improve. \n\n" +
                            "Regards,\n The Au Pair Team" 
  }
  
}
