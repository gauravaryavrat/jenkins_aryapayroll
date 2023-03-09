import { Component, OnInit } from '@angular/core';
import { skillCategoryApiService } from '../skillCategory-service/skillCategory-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component ({
    selector: 'app-list-skill-category',
    templateUrl: './list-skill-category.component.html',
})

export class ListSkillCategoryComponent implements OnInit {

    showCard = {};
    // leaveListData: Object;
    leaveListData:any =[];
    companyShowData: any = [];
  permissionInfo: any;

    constructor(private api: skillCategoryApiService,
       public route:Router,
       private _Activatedroute:ActivatedRoute,
       private util: UtilitiesService) {}

    ngOnInit() {
      this.leaveList();
      this.permissionInfo = this.util.permissionRoleInfo
    }

    leaveList() {
      try{
        this.api.skillCategoryData().subscribe(data => {
          if (data.status === 'success' || data.status === 200) {
            this.leaveListData = data.skillCategory;
            const len =this.leaveListData.length;
            if(len == 0){
              this.route.navigateByUrl("/pages/skill-category/add-skill-category");
            }
          }
        })
      }catch(err){
        console.log(err.message);
      }
    }

    showConfirmationMessage(skillCategoryId:String){
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
          this.api.removeData(skillCategoryId).subscribe((data)=>{
            if(data.status === "success" || data.status === 200){
          swalWithBootstrapButtons.fire(
            'Deleted!',
            data.message,
            'success'
          )
          this.leaveList();
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
    addSkillCategory(){
      try{
        this.util.skillCategoryStatus = 1;
      }catch(err){
        console.log(err)
      }
    }
}