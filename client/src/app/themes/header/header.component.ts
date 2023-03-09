import { Component, OnInit, NgZone } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  companyListData: any[];
  filterListData: any[];
  navbarOpen = false;
  companyName: String;
  public userId;
  url: any;

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  constructor(private apiService: ApiService, private route: Router, private ngZone: NgZone, ) { }

  ngOnInit() {
    this.userProfile();
    this.getList();
    this.getIndividualList();
    let getmyVal: any = JSON.parse(localStorage.getItem("myVal"));
    let id = getmyVal.split('@');
    this.userId = id[0];
  }

  //Method for show data in the list
  getList() {
    try {
      this.apiService.getListData().subscribe(data => {
        if (data.status === 'success' || data.status === 200) {
          if (data.company.length === 0) {
            this.ngZone.run(() => this.route.navigateByUrl('/pages/company/add-company'));
          } else {
            this.companyListData = data.company;
          }
        }
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for show dropdown selected value
  getIndividualList() {
    try {
      if (sessionStorage.getItem('companyId') === "undefined") {
        this.companyName = "No Company Added";
      } else {
        this.apiService.getIndividualData(sessionStorage.getItem('companyId')).subscribe((data) => {
          if(data.status === 'success'){
            this.companyName = data.data.name;
            this.filterCompanyId();
          } else {
            console.log(data.message);
          }
        })
      }

    } catch (err) { }
  }

  //Method for set selected valuein session storage
  onSelect(companyId: string) {
    try {
      sessionStorage.setItem('companyId', companyId);
      localStorage.setItem('companyId',companyId);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  }

 //Method for filter company Name by companyId
  filterCompanyId() {
    let companyId = sessionStorage.getItem('companyId');
    if(companyId != undefined){
      this.filterListData = this.companyListData.filter(e => e._id !== companyId);
      this.companyListData = this.filterListData;
    }
  }


  logout(): void {
    this.apiService.submitLogout();
    this.route.navigateByUrl('/users');
  }

  // User Profile Details
  userProfile(){
    try {
      this.apiService.getUserDetails().subscribe((data)=>{
        if(data.status === 'success'){
          this.url = data.data.avatar;
          if(data.data.name.length > 0){
            this.userId = data.data.name;
          }
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {
  }

}
