import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from '../branch-service/branch.service';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-update-branch-data',
  templateUrl: './update-branch-data.component.html',
  styleUrls: ['./update-branch-data.component.scss']
})
export class UpdateBranchDataComponent implements OnInit {

  updateBranchForm: FormGroup;
  getBranchList:any =Object;
  branchData: Object[] = [];
  snapshotParam: String;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: any = String;
  errorMsg: boolean = false;
  permissionInfo: any;


  constructor(private route: ActivatedRoute, private api: BranchService, public fb: FormBuilder, private ngZone: NgZone,
    private router: Router,
    private util: UtilitiesService,
    private currencyApi: ApiService) {
      this.snapshotParam = this.route.snapshot.paramMap.get("branchId");
      this.util.moduleExists(this.snapshotParam,'Branches').subscribe((data)=>{
        if(data.status === 'success'){
          if(!data.data){
            this.router.navigateByUrl('/pages/branches/show-branches');
          }
        }
      })
    }

  ngOnInit() {
    this.updateBranchDataValidate();
    this.permissionInfo = this.util.permissionRoleInfo;
    this.getExistingData();
    if(this.permissionInfo.search('Edit Branch') === -1){
      this.updateBranchForm.disable();
    }
  }

  //Method for Validation
  updateBranchDataValidate() {
    try {
      this.updateBranchForm = this.fb.group({
        name: new FormControl('', Validators.compose([ Validators.required
        ])),
        officialNumber: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
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

  //Method for get existing data show on update form
  getExistingData() {
    try{
      this.api.getBranchDetails(this.snapshotParam).subscribe((data) => {
        if (data.status === "success") {
          this.getBranchList = data.data;
              this.updateBranchForm = this.fb.group({
                name: new FormControl(this.getBranchList.name, Validators.compose([ Validators.required
                ])),
                officialNumber: new FormControl(this.getBranchList.officialNumber, Validators.compose([
                  Validators.required,
                  Validators.minLength(10),
                  Validators.maxLength(15),
                  Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
                ])),
                fax: new FormControl(this.getBranchList.fax, Validators.compose([
                  Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
                  Validators.minLength(10),
                  Validators.maxLength(10),
                ])),
                address: new FormControl(this.getBranchList.address, Validators.required),
                outGoingMails: new FormControl(this.getBranchList.outGoingMails, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')),
                taxationNumber: new FormControl(this.getBranchList.taxationNumber),
                panNumber: new FormControl(this.getBranchList.panNumber, Validators.pattern('(^[A-Za-z]{5}[0-9]{4}[A-Za-z]$)')),
                bankName: new FormControl(this.getBranchList.bankDetails.bankName),
                bankAccNum: new FormControl(this.getBranchList.bankDetails.bankAccNum,Validators.compose([Validators.maxLength(16),
                  Validators.pattern(/^[0-9]*$/)])),
                bankType: new FormControl(this.getBranchList.bankDetails.bankType)
              })
        }
      })
    } catch(err){
      console.log(err);
    }

  }

  //Method for submit updated form data
  updateBranchFormData() {
    try {
      let cleanUpdateBranchForm = this.util.cleanFormLevelOne(this.updateBranchForm);
      if (this.updateBranchForm.valid) {
        this.api.submitUpdatedData(cleanUpdateBranchForm.value, this.snapshotParam).subscribe(data => {
          if (data.status === "success" || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.router.navigateByUrl("/pages/branches/show-branches");
            }, 2000);
          }
          else if (data.status === "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            },3000)
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for show validdation message
  validationMessage = {
    'name':[{ type: 'required', message: 'Name is Required ' }],
    'address':[{ type: 'required', message: 'Address is Required ' }],
    'officialNumber': [
      { type: 'required', message: 'Official Number is Required ' },
      { type: 'minlength', message: 'Number too short ' },
      { type: 'maxlength', message: 'Number is too large' },
      { type: 'pattern', message: 'Company Number not valid' },
    ],
    'fax': [
      { type: 'minlength', message: 'Fax number too short ' },
      { type: 'maxlength', message: 'Fax no. is too large' },
      { type: 'pattern', message: 'Fax Number not valid' },
    ],
    'outGoingMails': [
      { type: 'pattern', message: 'Invalid Mail' },
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
}
