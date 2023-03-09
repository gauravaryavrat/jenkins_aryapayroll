import { Component, OnInit, NgZone} from '@angular/core';
import { BranchService } from '../branch-service/branch.service';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

declare var populateCountries: any ;

@Component({
  selector: 'app-add-branches',
  templateUrl: './add-branches.component.html',
  styleUrls: ['./add-branches.component.scss']
})
export class AddBranchesComponent implements OnInit {

  branchForm:FormGroup;
  snapshotParam:String;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  countryMsg: string;
  stateOption: boolean;
  selectCountryName: string;
  selectStateName: string;
  permissionInfo: any;

  constructor(private route: ActivatedRoute,private api: BranchService, public fb: FormBuilder, private ngZone: NgZone,
    private router: Router,
    private util: UtilitiesService,
    ) {
      this.isListAvaliable();
    }

  ngOnInit() {
    this.permissionInfo = this.util.permissionRoleInfo;
    this.branchDataValidate();
    populateCountries("country", "state");
    this.snapshotParam = sessionStorage.getItem("companyId");
    if(this.permissionInfo.search('Create Branch') === -1){
      this.branchForm.disable();
    }
  }

   //Method for Validation
  branchDataValidate() {
    try {
      this.branchForm = this.fb.group({
        name: new FormControl('', Validators.compose([
          Validators.required,
        ])),
        officialNumber: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
        ])),
        email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])),
        fax: new FormControl('', Validators.compose([
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ])),
        address: new FormControl('', Validators.required),
        outGoingMails: new FormControl('', Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')),
        taxationNumber: new FormControl(''),
        panNumber: new FormControl('', Validators.pattern('(^[A-Za-z]{5}[0-9]{4}[A-Za-z]$)')),
        bankName: new FormControl(''),
        bankAccNum: new FormControl('',Validators.compose([Validators.maxLength(16),
          Validators.pattern(/^[0-9]*$/)])),
        bankType: new FormControl('')
      })
    }
    catch (err) {
      console.log(err);
    }
  }

  scroll(element) {
    element.scrollIntoView();
}

//Method for submit form data
  branchFormData(){
    try{
      let cleanAddCompanyForm = this.util.cleanFormLevelOne(this.branchForm);
      if(this.branchForm.valid){
        this.api.submitBranchFormData(cleanAddCompanyForm.value,this.snapshotParam,this.selectCountryName,this.selectStateName).subscribe((data)=>{
          if(data.status === "success"|| data.status === 200){
            this.successMessage = true ;
            this.errorMsg = false ;
            this.successMsg = data.message;
            setTimeout(()=>{
            this.handleErrors();
            this.ngZone.run(()=>this.router.navigateByUrl('/pages/branches/show-branches'));
             }, 1500);
          }
          else if(data.status == "error"){
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(()=> {
              this.handleErrors();
            },4000)
          }
        })
      }
    }catch(err){
      console.log(err);
    }
  }

  //Method for show validdation message
  validationMessage = {
    'name': [
      { type: 'required', message: 'Name is required' },
    ],
    'email': [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', message: 'Enter a valid email' }
    ],
    'address':[
      { type: 'required', message: 'Address is required' },
    ],
    'officialNumber': [
      { type: 'required', message: 'Number is required' },
      { type: 'minlength', message: 'Number too short ' },
      { type: 'maxlength', message: 'Number is too large' },
      { type: 'pattern', message: 'Company Number not valid' },
    ],
    'fax': [
      { type: 'minlength', message: 'Fax number too short ' },
      { type: 'maxlength', message: 'Fax no. is too large' },
      { type: 'pattern', message: 'Fax Number not valid' },
    ],
    'outGoingMails':[
      { type: 'pattern', message: 'Invalid Mail'},
    ],
    'taxNumber':[
      { type: 'pattern', message: 'Invalid Taxation No.'},
    ],
    'panNumber':[
      { type: 'pattern', message: 'Invalid PAN Number'},
    ],
    'bankAccNum':[
      { type: 'maxlength', message: 'Account No. limit exceeded'},
      { type: 'pattern', message: 'Invalid Account No.'},
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
    this.api.getBranchListData().subscribe((data) =>{
      if(data.status === 'success'){
        if(data.branch.length > 0 && this.util.branchesSatus !== 1){
          this.router.navigateByUrl("/pages/branches/show-branches");
          this.util.branchesSatus = 0;
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}

//Check For Country Validation
countryName(){
  if((document.getElementById('country')as HTMLInputElement).value === '-1'){
   this.countryMsg = "Country Name is Required";
   this.stateOption = false;
  } else {
    this.selectCountryName = (document.getElementById('country')as HTMLInputElement).value
    this.countryMsg = '';
    this.stateOption = true;
    this.stateName();
  }
}
// State Option Functionality
stateName(){
  if((document.getElementById('state')as HTMLInputElement) === null){
    this.selectStateName = '';
  } else if((document.getElementById('state')as HTMLInputElement).value === ''){
    this.selectStateName = '';
  } else {
    this.selectStateName = (document.getElementById('state')as HTMLInputElement).value
  }
}

}
