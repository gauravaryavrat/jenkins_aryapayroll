import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyListComponent } from '../../dashboard/company-list/company-list.component';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-company-list',
  templateUrl: './update-company-list.component.html',
  styleUrls: ['./update-company-list.component.scss'],
  providers: [CompanyListComponent],
})
export class UpdateCompanyListComponent implements OnInit,OnDestroy {
  ngOnDestroy(): void {
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).removeAttribute('disabled');
  }

  updateCompanyForm: any;
  addCurrencyForm:FormGroup;
  successMsg: String;
  successMessage: Boolean = false;
  errMsg: String;
  errorMsg: Boolean = false;
  snapshotParam: String;
  listCompanyData: any;
  url: any;
  updateCompanyLogoForm: any;
  existingUrl: any;
  permissionInfo: any;
  // currency: any;
  // currencyOptionValue = 'Please Add Currency';


  constructor(private route: ActivatedRoute,
     private api: ApiService,
     public fb: FormBuilder,
     private ngZone: NgZone,
     private router: Router,
     private util: UtilitiesService,
    ) { }

  ngOnInit() { //Calling methods for validation
    this.permissionInfo = this.util.permissionRoleInfo;
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).setAttribute('disabled','disabled');
    this.snapshotParam = this.route.snapshot.paramMap.get("companyId");
    // this.listCurrency();
    // this.addCurrencyFormValidation();
    this.formValidation();
    this.existingCompanyDataValues();
    this.updateComapnyLogo();
    if(this.permissionInfo.search('Edit Company') === -1){
      this.updateCompanyForm.disable();
    }
  }

// List Currency Information
// listCurrency(){
//   try{
//     this.api.listCurrency().subscribe((data) =>{
//       if(data.status === 'success'){
//         if(data.data.length == 0){
//           this.currencyOptionValue = 'Please Add Currency';
//         } else {
//           this.currency = data.data;
//           this.currencyOptionValue = 'Select Currency';
//         }

//       }
//     })
//   } catch(err){}
//   }

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

  // addCurrency(){
  //   try{
  //     let cleanCurrencyForm = this.util.cleanFormLevelOne(this.addCurrencyForm);
  //     this.api.submitCurrency(cleanCurrencyForm.value).subscribe((data) => {
  //       if(data.status === "success"){
  //         this.successMessage = true ;
  //         this.errorMsg = false ;
  //         this.successMsg = data.message;
  //         setTimeout(() => {
  //           this.listCurrency();
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
// currencyValidationMessage = {
//   'name': [
//     { type: 'required', message: 'Currency Name is required' },
//   ],
//   'code': [
//     { type: 'required', message: 'Currency Code is required' },
//   ]
// }
  //Method for form validation
  formValidation() {
    try {
      this.updateCompanyForm = this.fb.group({
        name: new FormControl("",Validators.required),
        officialNumber: new FormControl("", Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
        ])),
        email: new FormControl("", Validators.compose([
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])),
        fax: new FormControl("", Validators.compose([
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ])),

        address: new FormControl("",Validators.required),
        domicile: new FormControl("", Validators.pattern('^[a-zA-Z]*$')),
        outGoingMails: new FormControl("", Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')),
        taxationNumber: new FormControl(''),
        panNumber: new FormControl('', Validators.pattern('(^[A-Za-z]{5}[0-9]{4}[A-Za-z]$)')),
        bankName: new FormControl(''),
        bankAccNum: new FormControl('',Validators.compose([Validators.maxLength(16),
          Validators.pattern(/^[0-9]*$/)])),
        bankType: new FormControl('')

      })
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for set existing value in the form
  existingCompanyDataValues() {
    try {
      this.api.getIndividualData(this.snapshotParam).subscribe(data => {
        if (data.status === "success" || data.status === 200) {
          console.log(data);
          this.url = data.data.logoUrl;
          this.existingUrl = data.data.logoUrl;
          this.listCompanyData = data.data;
          this.updateCompanyForm = this.fb.group({
            name: new FormControl(this.listCompanyData.name,Validators.required),
            officialNumber: new FormControl(this.listCompanyData.officialNumber, Validators.compose([
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(15),
              Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
            ])),
            email: new FormControl(this.listCompanyData.email, Validators.compose([
              Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
            ])),
            fax: new FormControl(this.listCompanyData.fax, Validators.compose([
              Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
              Validators.minLength(10),
              Validators.maxLength(10),
            ])),

            address: new FormControl(this.listCompanyData.address,Validators.required),
            domicile: new FormControl(this.listCompanyData.domicile, Validators.pattern('^[a-zA-Z]*$')),
            taxationNumber: new FormControl(this.listCompanyData.taxationNumber),
            panNumber: new FormControl(this.listCompanyData.panNumber, Validators.pattern('(^[A-Za-z]{5}[0-9]{4}[A-Za-z]$)')),
            bankName: new FormControl(this.listCompanyData.bankName),
            bankAccNum: new FormControl(this.listCompanyData.bankAccNum,Validators.compose([Validators.maxLength(16),
              Validators.pattern(/^[0-9]*$/)])),
            bankType: new FormControl(this.listCompanyData.bankType)
          })
        }
      })

    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for Update Data
  updateCompanyFormData() {
    try{
      let cleanCompanyUpdateForm = this.util.cleanFormLevelOne(this.updateCompanyForm);
      if (this.updateCompanyForm.valid) {
        this.api.submitUpdateCompanyData(cleanCompanyUpdateForm.value, this.snapshotParam).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {

            // Upload Company Logo
          let isCompanyLogo;
          if((document.getElementById('updateCompanyLogo') as HTMLInputElement).value.length === 0){
           isCompanyLogo = false;
          } else {
            isCompanyLogo = true;
          }
          this.api.uploadCompanyLogo(this.updateCompanyLogoForm,'Update CompanyLogo',isCompanyLogo).subscribe((responseData) => {
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
          else if (data.status == "error") {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            },2000);
          }
        })
      }
    } catch(err){
      console.log(err);
    }

  }

  //Onclick scrolling on div and  show message div
  scroll(element) {
    element.scrollIntoView();
  }



  //Method for show validation message
  validationMessage = {
    'name': [
      { type: 'required', message: 'Name is required' },
    ],
    'address': [
      { type: 'required', message: 'Address is required' }
    ],
    'officialNumber': [
      { type: 'required', message: 'Official Number is required' },
      { type: 'minlength', message: 'Number too short ' },
      { type: 'maxlength', message: 'Number is too large' },
      { type: 'pattern', message: 'Company Number not valid' },
    ],
    'fax': [
      { type: 'minlength', message: 'Fax number too short ' },
      { type: 'maxlength', message: 'Fax no. is too large' },
      { type: 'pattern', message: 'Fax Number not valid' },
    ],
    'domicile': [
      { type: 'pattern', message: 'Invalid Domicile' },
    ],
    'outGoingMails': [
      { type: 'pattern', message: 'Invalid Mail' },
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

// When User Select the file
onSelectFile(event) {
  if (event.target.files && event.target.files[0]) {
    var reader = new FileReader();

    reader.readAsDataURL(event.target.files[0]); // read file as data url

    reader.onload = (event: any) => { // called once readAsDataURL is completed
      this.url = event.target.result;
    }
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.updateCompanyLogoForm.get('companyLogo').setValue(file);
    }
  }
}

// update Company Logo
updateComapnyLogo(){
  try{
    this.updateCompanyLogoForm = this.fb.group({
      companyLogo: ['']
    })
  }catch(err){
    console.log(err);
  }
}

reset(){
  try {
    this.url = this.existingUrl;
  } catch (error) {
    console.log(error);

  }
}

}
