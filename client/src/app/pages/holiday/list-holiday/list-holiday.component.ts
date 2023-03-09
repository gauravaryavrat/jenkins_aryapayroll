import { Component, OnInit } from '@angular/core';
import { HolidayApiService } from '../holiday-service/holiday-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component ({
    selector: 'app-list-holidays',
    templateUrl: './list-holiday.component.html'
})

export class ListHolidayComponent implements OnInit {

    showCard = {};
    leaveListData = new Array();
    companyShowData = [];
  permissionInfo: any;

    constructor(private api: HolidayApiService,public route:Router, private _Activatedroute:ActivatedRoute, private util:UtilitiesService) {}

    ngOnInit(){
      this.holidayList();
      this.permissionInfo = this.util.permissionRoleInfo;
    }

    holidayList(){
      try{
        this.api.getHoliday().subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.leaveListData = data.data;
             const len = Object.keys(this.leaveListData).length;
            if(len == 0){
               this.route.navigateByUrl("pages/holiday/add-holiday");
            }else{
              this.leaveListData = data.data;
            }
          }
        })
      }catch(err){
        console.log(err.message);
      }
    }

    showConfirmationMessage(holidayId:String){
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
        reverseButtons: true
      } as any).then((result) => {
        if (result.value) {
          this.api.removeData(holidayId).subscribe((data)=>{
            if(data.status === "success" || data.status === 200){
          swalWithBootstrapButtons.fire(
            'Deleted!',
            data.message,
            'success'
          )
          this.holidayList();
            }
        })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your data is safe',
            'error'
          )
        }
      })
    }
    addHolidays(){
      try{
        this.util.holidaysStatus = 1;
      }catch(err){
        console.log(err)
      }
    }
}