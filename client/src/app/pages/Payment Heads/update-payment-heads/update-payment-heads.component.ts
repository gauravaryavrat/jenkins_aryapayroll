import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { paymentHeadApiService } from '../payment-heads-service/payment-heads-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-payment-heads',
  templateUrl: 'update-payment-heads.component.html'
})

export class UpdatePaymentHeadsComponent implements OnInit {

  paymentHeadUpdateForm: any;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  companyNameStore: [];
  showCard: any;
  companyNameId: any;
  public companyName: [];
  public companyId: any;
  public leaveTypeId: any;
  public jobCategoryId: any;
  existingData: any;
  paymentHeadTypes = ['Addition','Deduction'];
  paymentHeadId;
  permissionInfo: any;



constructor(private api:paymentHeadApiService, private fb:FormBuilder,private route:ActivatedRoute,private ngZone: NgZone,private router:Router,
  private util: UtilitiesService){
    this.paymentHeadId = this.route.snapshot.paramMap.get("jobCategoryId");
    this.util.moduleExists(this.paymentHeadId,'PaymentHead').subscribe((data)=>{
      if(data.status === 'success'){
        if(!data.data){
          this.router.navigateByUrl('/pages/payment-heads/list-payment-heads');
        }
      }
    })
  }

ngOnInit() {
  this.existingDataList();
  this.updatePaymentHeadValidation();
  this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Edit PaymentHeads') === -1){
        this.paymentHeadUpdateForm.disable();
      }
}

updatePaymentHeadValidation() {
  try {
    this.paymentHeadUpdateForm = this.fb.group({
        title: new FormControl('',Validators.required),
        type: new FormControl('',Validators.required)
      })
    }
  catch (err) {
    console.log(err);
  }
}

existingDataList(){
  this.api.paymentHeadDetails(this.paymentHeadId).subscribe(data=>{
    this.existingData = data.data;
      this.paymentHeadUpdateForm = this.fb.group({
        title: new FormControl(this.existingData.title,Validators.required),
        type: new FormControl(this.existingData.type,Validators.required),
      })
  })
}

updatePaymenthead(){
  try{
    let cleanPaymentHeadUpdateForm = this.util.cleanFormLevelOne(this.paymentHeadUpdateForm);
    this.api.updatePaymentHeads(cleanPaymentHeadUpdateForm.value,this.paymentHeadId).subscribe(data=>{
      if(data.status === 'success'){
        this.successMessage = true ;
        this.errorMsg = false ;
        this.successMsg = data.message;
        setTimeout(() =>{
          this.handleErrors();
          this.ngZone.run(() => this.router.navigateByUrl('/pages/payment-heads/list-payment-heads'));
        },2000);
      }else{
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        setTimeout(()=>{
          this.handleErrors();
        },3000)
      }
    })
  } catch(err){
    console.log(err);
  }
}

validationMessage = {
  'title':[{
    type: 'required', message: 'Payement Head Title is Required'
  },],
  'type':[
    {type:'required', message: 'Payement Head Type is Required'}
  ],
}


handleErrors(){
  this.errorMsg = false;
  this.successMessage = false;
  this.errMsg = '';
  this.successMsg = '';
}

}