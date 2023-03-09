import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { paymentHeadApiService } from '../payment-heads-service/payment-heads-api.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';


@Component({
    selector: 'app-add-payment-heads',
    templateUrl: './add-payment-heads.component.html'
})

export class AddPaymentHeadsComponent implements OnInit {

  paymentHeadForm: FormGroup;
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    errorMsg: boolean = false;
    companyNameStore: any;
    showCard: any;
    companyNameId: any;
    public companyName:any= [];
    public companyId: any;
    paymentHeadTypes = ['Addition','Deduction'];
  permissionInfo: any;


    constructor(public fb: FormBuilder,private api:paymentHeadApiService,private ngZone:NgZone,
      private router:Router,private util: UtilitiesService){
        this.isListAvaliable();
      }

    ngOnInit() {
      this.paymentHeadValidate();
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create PaymentHeads') === -1){
        this.paymentHeadForm.disable();
      }
    }

    paymentHeadData(){
      try{
        let cleanPaymentHeadForm = this.util.cleanFormLevelOne(this.paymentHeadForm);
        this.api.addPaymentHeads(cleanPaymentHeadForm.value).subscribe(data=>{
          if(data.status === 'success'){
            this.successMessage = true ;
            this.errorMsg = false ;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.ngZone.run(()=>this.router.navigateByUrl('/pages/payment-heads/list-payment-heads'));
            },2000)
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

    paymentHeadValidate() {
      try {
        this.paymentHeadForm = this.fb.group({
          title: new FormControl('',Validators.required),
          type:new FormControl('', Validators.required),
          // parentId: new FormControl(null)
          })
        }
      catch (err) {
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
  isListAvaliable(){
    try{
      this.api.getPaymentHeadData().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.data.length > 0 && this.util.paymentHeadStatus !== 1){
            this.router.navigateByUrl("/pages/payment-heads/list-payment-heads");
            this.util.paymentHeadStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }
}