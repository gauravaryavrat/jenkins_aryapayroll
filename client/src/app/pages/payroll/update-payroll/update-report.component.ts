import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray, FormArrayName } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PayrollApiService } from '../payroll-service/payroll-api.service';

@Component({
  selector: 'app-update-payroll',
  templateUrl: 'update-payroll.component.html',
  styleUrls:['update-payroll.component.scss']
})

export class UpdatePayrollComponent implements OnInit {
employeeId: any;
requestMonth: any;
requestYear: any;
existingSalaryDetails: any;
updateSalarySlipForm: any;
salarySlipDeductions = [];
salarySlipEarnings = [];
deductionForm: any;
earningsForm: any;
buttonValue = 'Show More';
showButtonValue = false;
salarySlipPattern = {};
didUpdate = false;
updatedSalaryForm: any;
isGenerated: any;
errorMsg = false;
successMessage = false;
errMsg: any;
successMsg: any;

constructor(private api:PayrollApiService, private fb:FormBuilder,private route:ActivatedRoute,private ngZone: NgZone,private router:Router){}

ngOnInit() {
  try {
  this.employeeId = this.route.snapshot.paramMap.get("employeeId");
  this.requestMonth = this.route.snapshot.paramMap.get("month");
  this.requestYear = this.route.snapshot.paramMap.get("year");
  this.salarySlipForm();
  this.api.listSalarySlipDetails(this.requestMonth,this.requestYear).subscribe((data)=>{
    if(data.status === 'success'){
      for(var i = 0; i<data.data.length; i++){
        if(data.data[i]._id == this.employeeId){
          this.existingSalaryDetails = data.data[i];
          this.salarySlipDeductions = data.data[i].deductions;
          this.salarySlipEarnings = data.data[i].earnings;
          this.isGenerated = data.data[i].isGenerated;
          break;
        }
      }
      // Basic Details
      this.updateSalarySlipForm = this.fb.group({
        employeeDetails: new FormGroup ({
          employeeName: new FormControl(this.existingSalaryDetails.employeeDetails.employeeName),
          designation: new FormControl(this.existingSalaryDetails.employeeDetails.designation),
          present: new FormControl(this.existingSalaryDetails.employeeDetails.present),
          earnedLeaves: new FormControl(this.existingSalaryDetails.employeeDetails.earnedLeaves),
          unsanctionedLeave: new FormControl(this.existingSalaryDetails.employeeDetails.unsanctionedLeave),
          payDays: new FormControl(this.existingSalaryDetails.employeeDetails.payDays),
        })
      })

      // Create Deduction Form Dynamically
      let deduction = {};
      this.salarySlipDeductions.forEach(totalDeductions =>{
        deduction[totalDeductions.label] = new FormControl(totalDeductions.amt)
        this.salarySlipPattern[totalDeductions.label] = '';
      })
      this.deductionForm = this.fb.group({
        deductions: new FormGroup(deduction)
      })

      // Create Earnings Form Dynamically
      let earnings = {};
      this.salarySlipEarnings.forEach(totalEarnings=>{
        earnings[totalEarnings.label] = new FormControl(totalEarnings.amt)
        this.salarySlipPattern[totalEarnings.label] = '';
      })
      this.earningsForm = this.fb.group({
        earnings: new FormGroup(earnings)
      })
    }
  })
  } catch (error) {
    console.log(error);
  }
}
salarySlipForm(){
  try {
    this.updateSalarySlipForm = this.fb.group({
      employeeDetails: new FormGroup ({
        employeeName: new FormControl(''),
        designation: new FormControl(''),
        present: new FormControl(''),
        earnedLeaves: new FormControl(''),
        unsanctionedLeave: new FormControl(''),
        payDays: new FormControl(''),
      })
    })
  } catch (error) {
    console.log(error);
  }
}

updateSalarySlip(element){
  try{
    this.updatedSalaryForm = this.fb.group({
      employeeDetails: new FormGroup({
        employeeName: new FormControl(this.updateSalarySlipForm.get('employeeDetails.employeeName').value),
        designation: new FormControl (this.updateSalarySlipForm.get('employeeDetails.designation').value),
        present: new FormControl (this.updateSalarySlipForm.get('employeeDetails.present').value),
        earnedLeaves: new FormControl (this.updateSalarySlipForm.get('employeeDetails.earnedLeaves').value),
        unsanctionedLeave: new FormControl (this.updateSalarySlipForm.get('employeeDetails.unsanctionedLeave').value),
        payDays: new FormControl (this.updateSalarySlipForm.get('employeeDetails.payDays').value),
      }),
      deductions : this.deductionForm,
      earnings: this.earningsForm,
      employeeIdArray: new FormArray([
        new FormControl(this.employeeId),
      ]),
      isGenerated: new FormControl(this.isGenerated)
    });

   let currentDate = new Date();

   // If salary Slip is not generated for the current month

   if((currentDate.getMonth()+1).toString().padStart(2,'0') === this.requestMonth && !this.isGenerated){
     this.api.monthlyGenerateSlip(this.updatedSalaryForm.value,this.requestMonth,this.requestYear,'Generate').subscribe((data)=>{
       if(data.status === 'success'){
         this.successMessage = true;
         this.errorMsg = false;
         this.successMsg = data.message;
         setTimeout(() => {
           this.router.navigateByUrl("/pages/payroll/list-payroll");
           this.handelErrors();
         }, 2000);
       } else if(data.status === 'error'){
         this.successMessage = false;
         this.errorMsg = true;
         this.errMsg = data.message;
         setTimeout(() => {
           this.handelErrors();
         }, 5000);
       }
     })
   }

   // If salary Slip is generated for the current month and user want to update the data
   if((currentDate.getMonth()+1).toString().padStart(2,'0') === this.requestMonth && this.isGenerated){
    this.api.monthlyGenerateSlip(this.updatedSalaryForm.value,this.requestMonth,this.requestYear,'Update').subscribe((data) =>{
      if(data.status === 'success'){
        this.successMessage = true;
        this.errorMsg = false;
        this.successMsg = data.message;
        setTimeout(() => {
          this.router.navigateByUrl("/pages/payroll/list-payroll");
          this.handelErrors();
        }, 2000);
      } else if(data.status === 'error'){
        this.successMessage = false;
        this.errorMsg = true;
        this.errMsg = data.message;
        setTimeout(() => {
          this.handelErrors();
        }, 5000);
      }
    })
   }





   element.scrollIntoView();
  }catch(err){
    console.log(err);
  }
}

showFunctinality(){
  try{
    this.showButtonValue = !this.showButtonValue;
    if(this.showButtonValue){
      this.buttonValue = 'Show Less';
    } else {
      this.buttonValue = 'Show More';
    }
  }catch(err){
    console.log(err);
  }
}

checkValidation(label){
  try {
   if((document.getElementById(label)as HTMLInputElement).value.match(/^\$?[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]+)?))$/) === null){
     this.salarySlipPattern[label] = `${label} value is not acceptable`;
   } else {
    this.salarySlipPattern[label] = '';
  }
   for(var key in this.salarySlipPattern){
     if(this.salarySlipPattern[key].length > 0){
       this.didUpdate = true;
       break;
     } else {
       this.didUpdate = false;
     }
   }

  } catch (error) {
    console.log(error)
  }
}

handelErrors(){
  try {
    this.successMessage = false;
    this.errorMsg = false;
    this.successMsg = '';
    this.errMsg = '';
  } catch (error) {
    console.log(error);
  }
}

}