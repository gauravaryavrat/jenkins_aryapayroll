import { GraderuleApiService } from '../graderule-service/graderule-api.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/utilities/utilities.service';


@Component({
  selector: 'app-list-graderule',
  templateUrl: './list-graderule.component.html',
  styleUrls: ['./list-graderule.component.css']
})

export class ListGraderuleComponent implements OnInit {

  listGradRuleData: any [];
  permissionInfo: any;

  constructor(private api: GraderuleApiService, private fb: FormBuilder,public route:Router, private util:UtilitiesService) { }

  ngOnInit() {
   this.listGradRule();
   this.permissionInfo = this.util.permissionRoleInfo;
  }

  listGradRule(){
   try{
     this.api.getGradeRuleList().subscribe(data=>{
       if (data.status === 'success' || data.status === 200){
        this.listGradRuleData = data.data;
        const len = Object.keys(this.listGradRuleData).length;
        if(len == 0){
          this.route.navigateByUrl("pages/graderule/add-graderule");
        }else{
          this.listGradRuleData = data.data;
        }
      }
     })
   }catch(err){
     console.log(err)
   }
  }

  showConfirmationMessage(gradeRuleid:string){
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
        this.api.removeData(gradeRuleid).subscribe((data)=>{
          if(data.status === 'success'){
            swalWithBootstrapButtons.fire(
              'Deleted!',
              data.message,
              'success'
            )
          } else if (data.status === 'error'){
            swalWithBootstrapButtons.fire(
              'ERROR!',
              data.message,
              'error'
            )
          }
          this.listGradRule();
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
addGradeRule(){
  try{
    this.util.gradeRuleStatus = 1;
  }catch(err){
    console.log(err)
  }
}




}
