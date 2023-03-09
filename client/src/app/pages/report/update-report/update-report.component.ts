import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReportApiService } from '../report-service/report-api.service';

@Component({
  selector: 'app-update-report',
  templateUrl: 'update-report.component.html'
})

export class UpdateReportComponent implements OnInit {

  paymentHeadUpdateForm: any;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  companyNameStore: [];z
  showCard: any;
  companyNameId: any;
  public companyName: [];
  public companyId: any;
  public leaveTypeId: any;
  public jobCategoryId: any;
  existingData: any[];
  paymentHeadTypes = ['Addition','Deduction'];
  paymentHeadId;

 

constructor(private api:ReportApiService, private fb:FormBuilder,private route:ActivatedRoute,private ngZone: NgZone,private router:Router){}

ngOnInit() {
  this.existingDataList();
  this.paymentHeadId = this.route.snapshot.paramMap.get("jobCategoryId");
  this.updatePaymentHeadValidation();
}

updatePaymentHeadValidation() {
  try {
    this.paymentHeadUpdateForm = this.fb.group({
        title: new FormControl(null),
        type: new FormControl(null)
      })
    }
  catch (err) {
    console.log(err);
  }
}

existingDataList(){
  this.api.getPaymentHeadData().subscribe(data=>{
    this.existingData = data.data;
    const len = Object.keys(this.existingData).length; 
    for(var i=0;i<len;i++){
      this.paymentHeadUpdateForm = this.fb.group({
        title: new FormControl(this.existingData[i].title),
        type: new FormControl(this.existingData[i].type),
      })
    }
  })
}

updatePaymenthead(){
  this.api.updatePaymentHeads(this.paymentHeadUpdateForm.value,this.paymentHeadId).subscribe(data=>{
    if(data.data === 'success'|| data.data === 200){
      this.successMessage = true ;
      this.ngZone.run(() => this.router.navigateByUrl('/pages/payment-heads/list-payment-heads'));          
      this.errorMsg = false ;
      this.successMsg = data.message;
    }else{
      this.errorMsg = true; 
      this.successMessage = false;
      this.errMsg = data.message;
    }
  })
}

} 