import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { environment } from '../../../environments/environment';
import { EmployeeService } from 'src/app/pages/employee-wizard/services/employee.service';
declare const $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
companyLength: any;
sideBarCompanyName: any;
sideBarCompanyLogo: any;
employeeLength: any;
adminStatus: Boolean;


  constructor(private api: ApiService,
    private companyEmployeeListAPI: EmployeeService) { }

  ngOnInit() {
      $('.list-group').click(function() {
          $(this).addClass('active').siblings().removeClass('active');
      });

       // Get Company List Length
    this.api.getListData().subscribe((data)=> {
      if(data.status === 'success'){
        this.companyLength = data.company.length;
        if(this.companyLength > 0){
          for(var i = 0; i<this.companyLength; i++){
            var sessionId = sessionStorage.getItem('companyId');
            if(sessionId === undefined){
              this.sideBarCompanyName = 'AryaVrat payroll';
              this.sideBarCompanyLogo = `${environment.apiBaseUrl}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
              break;
            }
            if(data.company[i]._id == sessionId){
              this.sideBarCompanyName = data.company[i].name;
              if(data.company[i].logoUrl === `${environment.apiBaseUrl}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`){
                this,this.sideBarCompanyLogo = `${environment.apiBaseUrl}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
              } else{
                this.sideBarCompanyLogo = `${environment.apiBaseUrl}/${data.company[i].logoUrl.substr(data.company[i].logoUrl.indexOf('public')+6)}`;
              }
            }
          }
        } else {
          this.sideBarCompanyName = 'AryaVrat payroll';
          this.sideBarCompanyLogo = `${environment.apiBaseUrl}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
        }
      }
    })

    // Get Employees List For individual company
    this.companyEmployeeListAPI.getEmployeeList('Active').subscribe((data)=>{
      if(data.status === 'success'){
        this.employeeLength = data.data.length;
      }
    })

    // Get Admin Status
    this.companyEmployeeListAPI.isAdmin().subscribe((data)=>{
      if(data.status === 'success'){
        this.adminStatus = data.data;
      }
    })
    }

  }


