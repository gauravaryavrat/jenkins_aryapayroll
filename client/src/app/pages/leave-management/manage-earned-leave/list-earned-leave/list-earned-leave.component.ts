import { Component, OnInit } from '@angular/core';
import { LeaveServicesService } from '../services/leave-services.service';
import { EmployeeService } from 'src/app/pages/employee-wizard/services/employee.service';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-list-earned-leave',
  templateUrl: './list-earned-leave.component.html',
  styleUrls: ['./list-earned-leave.component.scss']
})
export class ListEarnedLeaveComponent implements OnInit {
  earnedLeaveList: any;
  companyEmployeelist: any;
  earnedLeaveMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  earnedLeaveYearMsg = '';
  earnedLeaveDataMsg = '';
  showHistoryCards = {};
  showCardEmployeeId: any;
  earnedLeaveHistory: any;
  deductionLeaveHistory: any;
  historyData: any;
  status = "Active";
  permissionInfo: any;

  constructor(private earnedLeaveListAPI : LeaveServicesService,
    private employeeListAPI: EmployeeService,
    private util: UtilitiesService
    ) { }

  ngOnInit() {
    this.employeeList();
    this.leaveListEmployee();
    this.permissionInfo = this.util.permissionRoleInfo
  }

  // Employee List
  employeeList(){
    try{
      this.employeeListAPI.getEmployeeList(this.status).subscribe((data)=> {
        if(data.status === 'success'){
          this.companyEmployeelist = data.data;
        }
      })
    } catch(err){
      console.log(err);
    }
  }

  // List All Earned Leave
  leaveListEmployee(){
    try{
      let currentDate = new Date();
      let year = currentDate.getFullYear().toString();
      let month = currentDate.toString().substring(4,8);
      this.earnedLeaveListAPI.listAllEarnedLeave(year,month).subscribe((data)=> {
        if(data.status === 'success'){
          (document.getElementById('earnedLeaveYear') as HTMLInputElement).value = year;
          (document.getElementById('earnedLeaveMonth') as HTMLInputElement).value = this.earnedLeaveMonths[currentDate.getMonth()];
          if(data.data.length > 0){
            this.earnedLeaveList = data.data;
            this.earnedLeaveDataMsg = '';
            for(let i =0; i<this.earnedLeaveList.length; i++){
              this.showHistoryCards[this.earnedLeaveList[i]._id] = true;
            }

          } else if(data.data.length === 0){
            this.earnedLeaveList = [];
            this.earnedLeaveDataMsg = 'No Data Found';
          }
        }
      })
    } catch(err){
      console.log(err);
    }
  }

// Year Validation
yearValidation(){
  try{
    let yearValue = (document.getElementById('earnedLeaveYear') as HTMLInputElement).value;
    let yearRegularExpression = /^(19|20)\d{2}$/;
    let result = yearValue.match(yearRegularExpression);
    if(yearValue.length === 0 && result === null){
      this.earnedLeaveYearMsg = '';
    } else if(result === null){
      this.earnedLeaveYearMsg = "Year Value is not acceptable";
    } else {
      this.earnedLeaveYearMsg = '';
    }
  } catch(err){
    console.log(err);
  }
}

// Filter Functionality
filterFunctionality(){
  try{
    let currentDate = new Date();
    let year = (document.getElementById('earnedLeaveYear') as HTMLInputElement).value;
    let month = (document.getElementById('earnedLeaveMonth') as HTMLInputElement).value;
    let employeeId = (document.getElementById('earendLeaveEmployee') as HTMLInputElement).value;

    if(year.length === 0 && month.length === 0 && employeeId.length === 0 ){
      // Do Nothing
    } else if(year.length !== 0  && employeeId.length === 0 || month.length !== 0 && employeeId.length === 0){
      if(year.length === 0){
        year = currentDate.getFullYear().toString();
        (document.getElementById('earnedLeaveYear') as HTMLInputElement).value = year;
      } else if (month.length === 0 ){
        month = currentDate.toString().substring(4,8);
        (document.getElementById('earnedLeaveMonth') as HTMLInputElement).value = this.earnedLeaveMonths[currentDate.getMonth()];
      }

      this.earnedLeaveDetails(year,month);

    } else if(year.length === 0 && employeeId.length !== 0 || month.length === 0 && employeeId.length !== 0){
      if(year.length === 0){
        year = currentDate.getFullYear().toString();
        (document.getElementById('earnedLeaveYear') as HTMLInputElement).value = year;
      } else if(month.length === 0){
        month = currentDate.toString().substring(4,8);
        (document.getElementById('earnedLeaveMonth') as HTMLInputElement).value = this.earnedLeaveMonths[currentDate.getMonth()];
      }
      this.filterEarnedLeaveDetails(employeeId,year,month);
    } else {
      this.filterEarnedLeaveDetails(employeeId,year,month);
    }

  }catch(err){
    console.log(err);
  }

}

// Call Earned Leave List API
earnedLeaveDetails(year,month){
  try{
    this.earnedLeaveListAPI.listAllEarnedLeave(year,month).subscribe((data)=> {
      if(data.status === 'success'){
        if(data.data.length > 0){
          this.earnedLeaveList = data.data;
          this.earnedLeaveDataMsg = '';
        } else if(data.data.length === 0){
          this.earnedLeaveList = [];
          this.earnedLeaveDataMsg = 'No Data Found';
        }
      }
    })
  } catch(err){
    console.log(err);
  }
}

// Filter Earnecd Leave according to employee Id

filterEarnedLeaveDetails(employeeId,year,month){
  try{
    this.earnedLeaveListAPI.filterEarnedLeaveDetails(employeeId,year,month).subscribe((data)=>{
      if(data.status === 'success'){
        if(data.data.length === 0 ){
          this.earnedLeaveList = [];
          this.earnedLeaveDataMsg = 'No Data Found';
        } else if(data.data.length > 0){
          this.earnedLeaveList = data.data;
          this.earnedLeaveDataMsg = '';
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}

// Earned Leave History
fetchHistory(employeeId){
  try{

    let year = (document.getElementById('earnedLeaveYear') as HTMLInputElement).value;
    let month = (document.getElementById('earnedLeaveMonth') as HTMLInputElement).value;

    this.earnedLeaveListAPI.fetchHistory(employeeId,year,month).subscribe((data)=>{
          if(data.status === 'success'){
            this.earnedLeaveHistory = data.data.earnedLeave;
            this.deductionLeaveHistory = data.data.deductLeave;
          }
        })

    this.showHistoryCards[`${employeeId}`] = !this.showHistoryCards[`${employeeId}`];

  } catch(err){
    console.log(err);
  }
}

// Reset The Filter
resetFunctionality(){
  try{
    let currentDate = new Date();
    let year = currentDate.getFullYear().toString();
    (document.getElementById('earnedLeaveYear') as HTMLInputElement).value = year;
    (document.getElementById('earnedLeaveMonth') as HTMLInputElement).value = this.earnedLeaveMonths[currentDate.getMonth()];
    (document.getElementById('earendLeaveEmployee') as HTMLInputElement).value = '';
    this.filterFunctionality();
  } catch(err){
    console.log(err);
  }
}

// Delete Earned Leave
deleteEarnedLeave(employeeId,year,month,leaveCount){
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })

  swalWithBootstrapButtons.fire({
    title: 'Are you sure?',
    text: "You want to delete it",
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    reverseButtons: true,
    allowOutsideClick: false,
  }as any).then((result) => {
    if (result.value) {
      this.earnedLeaveListAPI.deleteEarnedLeave(employeeId,year,month,leaveCount).subscribe((data)=>{
        if(data.status === "success"){
      swalWithBootstrapButtons.fire(
        'Deleted!',
        data.message,
        'success'
      )
      this.filterFunctionality();
        }
    })
    } else if (
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Your earned leave data is safe',
        'error'
      )
    }
  })
}

}
