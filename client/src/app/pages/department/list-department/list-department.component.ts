import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { DepartmentApiService } from '../department-service/department-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { state, style } from '@angular/animations';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component ({
    selector: 'app-list-department',
    templateUrl: './list-department.component.html',
    styleUrls: ['./list-department.component.css']
})

export class ListDepartmentComponent implements OnInit {

    departmentData:any=[];
    public isActive: any;
    public isNot: any;
    showCard:any = {};
    userId;

    branchId;
  permissionInfo: any;

  constructor(private api:DepartmentApiService,
    public route:Router,
    private util: UtilitiesService
    ){}

  ngOnInit(){
   this.departmentList();
   this.permissionInfo = this.util.permissionRoleInfo;
   }

  departmentList(){
    try{
      this.api.getDepartment().subscribe(data=>{
        if (data.status === 'success' || data.status === 200) {
          this.departmentData = data.data;
          if(this.departmentData.length == 0){
            this.route.navigateByUrl("/pages/department/add-department");
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }

  showConfirmationMessage(departmentId:String){
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
        this.api.removeData(departmentId).subscribe((data)=>{
          if(data.status === "success" || data.status === 200){
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Your row has been deleted.',
          'success'
        )
          } else if(data.status === 'error'){
            swalWithBootstrapButtons.fire(
              'ERROR!',
              data.message,
              'error'
            )
          }
          this.departmentList();
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

  addDepartment(){
    try{
      this.util.departmentSatus = 1;
    }catch(err){
      console.log(err)
    }
  }

}