import { Component, OnInit } from '@angular/core';
import { JobCategoryApiService } from '../jobCategory-service/jobCategory-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component ({
    selector: 'app-list-job-category',
    templateUrl: './list-job-category.component.html'
})

export class ListJobCategoryComponent implements OnInit {

    showCard:any = {};
    // leaveListData: any = Object;
    companyShowData: any = [];
    leaveListData: any=[];
    public isActive: any;
    public isNot: any;
    permissionInfo: any;

    constructor(private api: JobCategoryApiService,public route:Router, private _Activatedroute:ActivatedRoute, private util:UtilitiesService) {}

    ngOnInit() {
      this.jobList();
      this.permissionInfo = this.util.permissionRoleInfo;
    }

    jobList() {
      try{
        this.api.getJobCategoryData().subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.leaveListData = data.jobCategory;
            if(this.leaveListData.length == 0){
               this.route.navigateByUrl("/pages/job-category/add-job-category");
            }else{
            for (var i = 0; i < this.leaveListData.length; i++) {
              this.showCard[this.leaveListData[i]._id] = true;
              this.isActive = data.jobCategory[i].isActive == true ;
            }
          }
          }
        })
      }catch(err){
        console.log(err.message);
      }
    }

    showConfirmationMessage(jobCategoryId:String){
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
      }as any).then((result) => {
        if (result.value) {
          this.api.removeData(jobCategoryId).subscribe((data)=>{
            if(data.status === "success" || data.status === 200){
          swalWithBootstrapButtons.fire(
            'Deleted!',
            data.message,
            'success'
          )
          this.jobList();
            }
        })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your list data safe',
            'error'
          )
        }
      })
    }
    addJobCategory(){
      try{
        this.util.jobCategoryStatus = 1;
      }catch(err){
        console.log(err)
      }
    }

}