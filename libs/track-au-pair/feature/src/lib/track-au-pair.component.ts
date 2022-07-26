import { Component, OnInit } from '@angular/core';
import { User, auPair, Parent } from '../../../../shared/interfaces/interfaces';
import { API } from '../../../../shared/api/api.service';
import * as L from 'leaflet'

@Component({
  selector: 'the-au-pair-track-au-pair',
  templateUrl: './track-au-pair.component.html',
  styleUrls: ['./track-au-pair.component.scss'],
})

export class TrackAuPairComponent implements OnInit 
{
  //Map variables
  leafletMap : any;
  markerGroup : any;
  lat = -26;
  long = 28;
  zoom = 8;

  //User variables
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
    salt: "",
  }

  parentDetails: Parent = {
    id: "",
    children: [],
    medID: "",
    auPair: "",
  }

  auPairDetails: auPair = {
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
    currentLat : 0.0
  }

  constructor(private serv : API) 
  {
    setInterval(()=> {
      this.getUserDetails();
      this.putMarker();
     }, 5000);
  }

  async ngOnInit(): Promise<void> 
  { 
    this.loadLeafletMap();
    await this.getUserDetails();
    this.putMarker();
    this.leafletMap.setView(new L.LatLng(this.auPairDetails.currentLat, this.auPairDetails.currentLong),15, {animate: true});
    
  }

  loadLeafletMap() 
  {
    //Clearing the current marker before adding the new one
    this.leafletMap = new L.Map('leafletMap');
    this.markerGroup = L.layerGroup().addTo(this.leafletMap);

    const self = this;

        //Load the map
    this.leafletMap.on("load", function () {
      setTimeout(() => {
        self.leafletMap.invalidateSize();
      }, 1000);
    });
    this.leafletMap.setView([this.lat, this.long], this.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      minZoom: 1,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a> contributors'
    }).addTo(this.leafletMap);
  }

  async getUserDetails()
  {
    /* Find logged in user's au pair */
    let res = await this.serv.getParent("4561237814867").toPromise();
    this.parentDetails.auPair = res.auPair;   
    
    /* Get the onShift and current coords of the employed au pair  */
    res = await this.serv.getAuPair(this.parentDetails.auPair).toPromise();
    this.auPairDetails.id = res.id;
    this.auPairDetails.onShift = res.onShift;
    this.auPairDetails.currentLong = res.currentLong;
    this.auPairDetails.currentLat = res.currentLat;
  };

  putMarker()
  {    
    //Only show location if the au pair is on shift
    if(this.auPairDetails.onShift)
    {
      //Clear all old markers
      this.leafletMap.removeLayer(this.markerGroup);
      this.markerGroup = L.layerGroup().addTo(this.leafletMap);

      //Put the marker and style the icon
      L.marker(
        [this.auPairDetails.currentLat, this.auPairDetails.currentLong],
        {icon: new L.Icon({iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png'})
      }).addTo(this.markerGroup);
      // this.leafletMap.panTo([this.auPairDetails.currentLat, this.auPairDetails.currentLong], 14);

      //Display name of au pair and current address they are at
      const dom = document.getElementById("auPairStatus");
      if(dom != null)
      {
        dom.innerHTML = this.auPairDetails."";
        dom.style.display = "flex";
      }
    }
    else
    {
      const dom = document.getElementById("auPairStatus");
      if(dom != null)
      {
        dom.innerHTML = "Your Au Pair is currently not on shift, and their location cannot currently be shown.";
        dom.style.display = "flex";
      }
    }
  }
}