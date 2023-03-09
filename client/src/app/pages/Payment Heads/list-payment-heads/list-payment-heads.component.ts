import { Component, OnInit } from '@angular/core';
import { paymentHeadApiService } from '../payment-heads-service/payment-heads-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component ({
    selector: 'app-list-payment-heads',
    templateUrl: './list-payment-heads.component.html',
    styleUrls: ['./list-payment-heads.component.scss']
})

export class ListPaymentHeadsComponent implements OnInit {

  paymentData: any[];
  permissionInfo: any;

  constructor(private api:paymentHeadApiService,public route:Router, private util:UtilitiesService){}

  ngOnInit() {
    this.listPaymentHeads();
    this.permissionInfo = this.util.permissionRoleInfo;
  }

  listPaymentHeads(){
    try{
      this.api.getPaymentHeadData().subscribe(data =>{
        if (data.status === 'success' || data.status === 200) {
        this.paymentData = data.data;
        const len = Object.keys(this.paymentData).length;
        if(len == 0){
          this.route.navigateByUrl("pages/payment-heads/add-payment-heads");
        }else{
          this.paymentData = data.data;
          }
        }
      })
    }catch(err){
      console.log(err.message);
    }
  }

  showConfirmationMessage(paymentHeadId:String){
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
          this.api.removePaymentHead(paymentHeadId).subscribe((data)=>{
            if(data.status === "success" || data.status === 200){
          swalWithBootstrapButtons.fire(
            'Deleted!',
            data.message,
            'success'
          )
          this.listPaymentHeads();
            }
        })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your Payment Head Data is Safe',
            'error'
          )
        }
      })
  }
  addPaymentHeads(){
    try{
      this.util.paymentHeadStatus = 1;
    }catch(err){
      console.log(err)
    }
  }

}