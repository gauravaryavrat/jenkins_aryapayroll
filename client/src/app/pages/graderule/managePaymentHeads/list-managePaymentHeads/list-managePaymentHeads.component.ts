import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GraderuleApiService } from '../../graderule-service/graderule-api.service';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';


@Component ({
    selector: 'app-list-managePaymentHeads',
    templateUrl: './list-managePaymentHeads.component.html',
    styleUrls: ['./list-managePaymentHeads.component.scss']
})

export class ListManagePaymentHeadsComponent implements OnInit, OnDestroy{
  permissionInfo: any;
  ngOnDestroy(): void {
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).removeAttribute('disabled');
  }

    showCard = {};
    leaveListData = new Array();
    companyShowData = [];
    gradeRuleId;
    dataValue:any [];
    paymentHeadId;
    companyName: String;
    gradeRuleTitle: any;

    constructor(private api:GraderuleApiService,
      private fb:FormBuilder,
      private route:ActivatedRoute,
      private ngZone: NgZone,
      private router:Router,
      private util: UtilitiesService
      ){}

    ngOnInit(){
        this.gradeRuleId = this.route.snapshot.paramMap.get("gradeRuleId");
        this.listGradeRule();
        (document.getElementById('headerCompanyDropDown')as HTMLInputElement).setAttribute('disabled','disabled');
        this.permissionInfo = this.util.permissionRoleInfo;
    }

    listGradeRule(){
        this.api.existingData(this.gradeRuleId).subscribe(data=>{
            this.gradeRuleTitle = data.data.title
            this.dataValue = data.data.paymentHeads;
        })
    }

    showConfirmationMessage(paymentHeadsId:string){
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
            this.api.removeGradeData(paymentHeadsId,this.gradeRuleId).subscribe((data)=>{
            swalWithBootstrapButtons.fire(
              'Deleted!',
              data.message,
              'success'
            )
            this.listGradeRule();
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

}