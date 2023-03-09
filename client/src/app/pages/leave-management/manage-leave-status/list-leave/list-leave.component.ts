import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/pages/employee-wizard/services/employee.service';
import { ServicesService } from '../services.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-leave',
  templateUrl: './list-leave.component.html',
  styleUrls: ['./list-leave.component.scss']
})
export class ListLeaveComponent implements OnInit {
  companyEmployeelist: any;
  filterDate: any;
  companyEmployeeLeaveList: any;
  leaveListMessage = '';
  listActions = ['Approve','Reject','Sandwich'];
  showInfoCard = {};
  showCardLeaveId: any;
  status = "Active";

  constructor(private employeeListAPI: EmployeeService,
    private leaveListAPI: ServicesService) {

    }

  ngOnInit() {
    this.employeeList();
    this.filterDate = this.returnCurrentDate();
    (document.getElementById("leaveListDate") as HTMLInputElement).value = this.filterDate;
    this.dateWiseAllLeaveList();
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


// All Employee Leave List
dateWiseAllLeaveList(){
  try{
    this.leaveListAPI.dateWiseAllLeaveList(this.filterDate).subscribe((data)=>{
      if(data.status === 'success'){
        if(data.data.length === 0){
          this.leaveListMessage = 'No Data Found';
          this.companyEmployeeLeaveList = [];
        } else {
          this.companyEmployeeLeaveList = data.data;
          this.showInfoCard = {};
          for(let i = 0; i < this.companyEmployeeLeaveList.length; i++){
            this.showInfoCard[this.companyEmployeeLeaveList[i]._id] = true;
          }
          this.leaveListMessage = '';
        }
      }
    })
  } catch(err){
    console.log(err)
  }
}

// Get Individual Employee Leave List
dateWiseLeaveList(userId,date){
  try{
    this.leaveListAPI.dateWiseLeaveList(userId,date).subscribe((data)=>{
      if(data.status === 'success'){
        if(data.data.length === 0 ){
          this.leaveListMessage = 'No Data Found';
          this.companyEmployeeLeaveList = [];
        } else {
          this.companyEmployeeLeaveList = data.data;
          this.showInfoCard = {};
          for(let i = 0; i < this.companyEmployeeLeaveList.length; i++){
            this.showInfoCard[this.companyEmployeeLeaveList[i]._id] = true;
          }
          this.leaveListMessage = '';
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}

// Filter Functionality Method
filterFunctionality(){
  try{
    if((document.getElementById("leaveListEmployee") as HTMLInputElement).value === ''){
      if((document.getElementById("leaveListDate") as HTMLInputElement).value === ''){
        (document.getElementById("leaveListDate") as HTMLInputElement).value = this.returnCurrentDate();
        this.filterDate = (document.getElementById("leaveListDate") as HTMLInputElement).value;
        this.dateWiseAllLeaveList();
      }
      this.filterDate = (document.getElementById("leaveListDate") as HTMLInputElement).value;
      this.dateWiseAllLeaveList();
    } else {
      if((document.getElementById("leaveListDate") as HTMLInputElement).value === ''){
        let userId = (document.getElementById("leaveListEmployee") as HTMLInputElement).value;
        (document.getElementById("leaveListDate") as HTMLInputElement).value = this.returnCurrentDate();
        this.filterDate = (document.getElementById("leaveListDate") as HTMLInputElement).value;
        this.dateWiseLeaveList(userId,this.filterDate);
      }
      let userId = (document.getElementById("leaveListEmployee") as HTMLInputElement).value;
      this.filterDate = (document.getElementById("leaveListDate") as HTMLInputElement).value
      this.dateWiseLeaveList(userId,this.filterDate);
    }
  }catch(err){
    console.log(err);
  }
}

// Reset Button Functionality
resetFilter(){
  try{
    this.filterDate = this.returnCurrentDate();
    (document.getElementById("leaveListDate") as HTMLInputElement).value = this.filterDate;
    (document.getElementById("leaveListEmployee") as HTMLInputElement).value = '';
    this.dateWiseAllLeaveList();
  }catch(err){
    console.log(err);
  }
}

// Reset Action List
resetActionList(){
  (document.getElementById("actionList")as HTMLInputElement).value = '';
}

// Return Current Date
returnCurrentDate(){
  try{
    let date = new Date();
    return(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,"0")}-${(date.getDate()).toString().padStart(2,"0")}`);
  } catch(err){
    console.log(err);
  }
}

// Action taken by user
  async actionTaken(value,userId,leaveId){
  try {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: `You want to change leave status to ${value}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    }as any).then(async (result) => {
      if (result.value) {
        if(value !== 'Reject'){
          var requestDataAlter = {
            action: value,
            reason: ''
          }
          this.leaveListAPI.leaveActionTaken(requestDataAlter,userId,leaveId).subscribe((data)=>{
            if(data.status === 'success'){
              this.filterFunctionality();
              swalWithBootstrapButtons.fire(
                'Done',
                data.message,
                'success'
              )
            } else if(data.status === 'error'){
              swalWithBootstrapButtons.fire(
                data.message
              )
            }
            this.resetActionList();
          })
        } else {
          const { value: text } = await Swal.fire({
          input: 'textarea',
          inputPlaceholder: 'Type your reason here...',
          inputAttributes: {
            'aria-label': 'Type your reason here'
          },
          showCancelButton: false
        })
        if(!text){
          Swal.fire('There is no reason given by you')
        }
        if (text) {
          var requestData = {
            action: value,
            reason: text
          }
          this.leaveListAPI.leaveActionTaken(requestData,userId,leaveId).subscribe((data)=>{
            if(data.status === 'success'){
              this.filterFunctionality();
              swalWithBootstrapButtons.fire(
                'Done',
                data.message,
                'success'
              )
            } else if(data.status === 'error'){
              swalWithBootstrapButtons.fire(
                'Error',
                data.message,
                'error'
              )
            }
            this.resetActionList();
          })
        }
        }
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        this.resetActionList();
        swalWithBootstrapButtons.fire(
          'Cancelled',
          "You didn't take any action",
          'error'
        )
      }
    })
  }
  catch (err) {
    console.log(err.message);
  }
}

// Manage Leave Info
leaveInfo(leaveId){
  try{
    this.showInfoCard[`${leaveId}`] = !this.showInfoCard[`${leaveId}`];
  }catch(err){
    console.log(err);
  }
}

}


