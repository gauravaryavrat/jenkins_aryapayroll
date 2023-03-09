import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

declare var populateCountries: any ;

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {

  companyForm: FormGroup;
  addCurrencyForm:FormGroup;
  companyLogoForm: FormGroup
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  countryMsg: any;
  stateOption = false;
  selectCountryName: any;
  selectStateName: any;
  url: any;
  imageError = 'Image Size should be less than 2MB';
  imageFlag = false;
  imageErrorMsg: any;
  permissionsInfo: any;

  // currency: any;
  // currencyOptionValue = 'Please Add Currency';

  constructor(private api: ApiService, public fb: FormBuilder, private ngZone: NgZone,
     private router: Router,
     private util: UtilitiesService) {
  }

  ngOnInit() {
    this.permissionsInfo = this.util.permissionRoleInfo;
    this.companyDataValidate();
    populateCountries("country", "state");
    this.uploadCompanyLogo();
    if(this.permissionsInfo.search('Create Company') === -1){
      this.companyForm.disable();
    }
    // this.addCurrencyFormValidation();
    // this.listCurrency();
  }
  // addCurrencyFormValidation() {
  //   try {
  //     this.addCurrencyForm = this.fb.group({
  //       name: new FormControl('', Validators.required),
  //       code: new FormControl('',Validators.required)
  //     });
  //   }
  //   catch (err) {
  //     console.log(err);
  //   }
  // }
   // Reset PopUp Currency Window
  //  resetForm(){
  //   try{
  //     this.addCurrencyForm.reset();
  //   } catch(err){
  //     console.log(err);
  //   }
  // }

  // Add Currency Value
  // addCurrency(){
  //   try{
  //     let cleanCurrencyForm = this.util.cleanFormLevelOne(this.addCurrencyForm);
  //     this.api.submitCurrency(cleanCurrencyForm.value).subscribe((data) => {
  //       if(data.status === "success"){
  //         this.successMessage = true ;
  //         this.errorMsg = false ;
  //         this.successMsg = data.message;
  //         setTimeout(() => {
  //           // this.listCurrency();
  //           this.handleErrors();
  //           (document.getElementById('dismiss') as HTMLElement).click();
  //         },1500);
  //       } else {
  //         this.errorMsg = true;
  //         this.successMessage = false;
  //         this.errMsg = data.message;
  //         setTimeout(() => {
  //           this.handleErrors();
  //         },1500);
  //       }
  //     })
  //   } catch(err){
  //     console.log(err);
  //   }
  // }

//Method for show currency validdation message
currencyValidationMessage = {
  'name': [
    { type: 'required', message: 'Currency Name is required' },
  ],
  'code': [
    { type: 'required', message: 'Currency Code is required' },
  ]
}

// List Currency Information
// listCurrency(){
// try{
//   this.api.listCurrency().subscribe((data) =>{
//     if(data.status === 'success'){
//       if(data.data.length == 0){
//         this.currencyOptionValue = 'Please Add Currency';
//       } else {
//         this.currency = data.data;
//         this.currencyOptionValue = 'Select Currency';
//       }

//     }
//   })
// } catch(err){
//   console.log(err);
// }
// }


  //Method for Validation

  companyDataValidate() {
    try {
      this.companyForm = this.fb.group({
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
        domicile: new FormControl('', Validators.pattern('^[a-zA-Z]*$')),
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

//Method for submit new company list data
  companyFormData() {
    try{
      let cleanCompanyForm = this.util.cleanFormLevelOne(this.companyForm);
    if (this.companyForm.valid) {
      this.api.submitCompanyData(cleanCompanyForm.value,this.selectCountryName,this.selectStateName).subscribe((data) => {
        if(data.status == "success"){
          sessionStorage.setItem('companyId',data.company._id);

          // Upload Company Logo
          let isCompanyLogo;
          if((document.getElementById('companyLogo') as HTMLInputElement).value.length === 0){
           isCompanyLogo = false;
          } else {
            isCompanyLogo = true;
          }

          this.api.uploadCompanyLogo(this.companyLogoForm,'Add CompanyLogo',isCompanyLogo).subscribe((responseData) => {
            if(responseData.status === 'success'){
              this.successMessage = true ;
              this.errorMsg = false ;
              this.successMsg = data.message;

              setTimeout(() => {
                this.handleErrors();
                window.location.replace('/pages/dashboard/company-list');
              },2000);
            }
          })

        }
        else if(data.status === "error"){
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(() => {
            this.handleErrors();
          },2000)
        }
      })
    }
  }
  catch(err){
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
    'domicile':[
      { type: 'pattern', message: 'Invalid Domicile'},
    ],
    'outGoingMails':[
      { type: 'pattern', message: 'Invalid Mail'},
    ],
    'taxNumber':[
      { type: 'pattern', message: 'Invalid Taxation No.'},
    ],
    'panNo':[
      { type: 'pattern', message: 'Invalid PAN No.'},
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

 // Country Option Functionality
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

// Upload company Logo form
uploadCompanyLogo(){
  try{
    this.companyLogoForm = this.fb.group({
      companyLogo: ['']
    })
  }catch(err){
    console.log(err);
  }
}

onSelectFile(event) {
  if (event.target.files && event.target.files[0]) {
    var reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]); // read file as data url

    reader.onload = (event: any) => { // called once readAsDataURL is completed
      this.url = event.target.result;
    }
    if(event.target.files[0].size > 2000000){
      this.imageFlag = true;
      this.imageErrorMsg = "File Size Exceeded than 2MB";
    } else {
      if (event.target.files.length > 0) {
        this.imageFlag = false;
        this.imageError = '';
        this.imageErrorMsg = '';
        const file = event.target.files[0];
        this.companyLogoForm.get('companyLogo').setValue(file);
      }
    }
  }
}

// Reset Image
reset(){
  try {
    (document.getElementById('companyLogo') as HTMLInputElement).value = '';
    this.url = '';
    this.imageError = 'Image Size should be less than 2MB';
    this.imageFlag = false;
  } catch (error) {
    console.log(error);

  }
}

}
