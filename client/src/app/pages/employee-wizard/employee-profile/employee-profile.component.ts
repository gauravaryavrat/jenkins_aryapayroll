import { DocumentServices } from '../../document-types/document-services/document.services';
import { Component, OnInit, NgZone, ViewChild,ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import { skillCategoryApiService } from '../../skill-category/skillCategory-service/skillCategory-api.service';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss']
})

export class EmployeeProfileComponent implements OnInit,OnDestroy{
  ngOnDestroy(): void {
    (document.getElementById('headerCompanyDropDown')as HTMLInputElement).removeAttribute('disabled');
  }

  @ViewChild('familyId', { static: false }) familyId: ElementRef;
  // @ViewChild('proofsId', { static: false }) proofsId: ElementRef;

  employeeBasicForm: any;
  employeeAddressForm: any;
  empEducationForm: any;
  employeeBioForm: any;
  companyTlList: any;
  updateRelationForm:any;
  companyListData = new Array();
  branchList = new Array();
  departmentList = new Array();
  jobProfileList = new Array();
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  branchName: String;
  companyId: String;
  address = ['Current', 'Permanent', 'Others'];
  branch: Object;
  hidden:String;
  familyType = ['Joint', 'Nuclear Family'];
  familyDetailsList = new Array();
  familyTypeList: String;
  divShow: boolean = false;
  formShow:boolean = false;
  title:String;
  familyIdValue:String;
  showAddFamilyButton:boolean = true;
  educationBtn: Boolean = true;
  addressId;
  workExperienceForm: any; // Work Experience form group
  bankDetailsForm: any; // Bank details form group name
  imageSrc: string = '';   // upload Document variable
  imagePath;  // upload Document variable
  docData: any; // upload Document Variable for show all document name
  experValue: Object; // post data from experience api
  actionBox = false;
  existingPersonalDetails :any;
  relivingIs = ['Formal', 'InFormal']; // Work Experience Reliving type
  existingBankDetails : any;
  employeeBioButton: string;
  basicDetail = 'Submit';
  checkbox = false;


  addRelationForm: any; // family form group name
  public familyValue: any[]; // after call api value store in this variable
  relation =["Mother","Father","Brother","Sister","Uncle","Aunt","Spouse","Son","Daughter"]; // Family relation array
  public skillValue: []; // skill category data in this array
  public showForm; // show details form of family
  items = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];  // this one is use for testing only
  public openval = 0;
  snapShotParam: String;
  shown: Boolean = false;
  show: Boolean = false;
  addressList : any; // list of old address
  addAddess: boolean = true; // add address div show and hide
  previousValue: any [];
  titleName; // title name for form on update and add address
  buttonName = 'Submit';
  button:Boolean = true;
  addressMsg:Boolean = true;
  educationData: any[]; // education details
  EducationForm: Boolean = true;  // show and hidde EducationForm
  educationCurentId; // education id
  eduBtn;
  addessBtn: Boolean=true;
  education;
  listMesg: Boolean= true;
  listEducationalDetails: any[]; //education details
  exprienceListData: any []; //exprience data
  workExperience: Boolean = true;
  listExprience: Boolean = true; // exprience list flag
  exprienceTitle; // expience form title
  expCurentId; // exprience current id on click edit button and delete button
  addExpbtn: Boolean = true;
  bankListData: any []; // bank list all data in this array
  showCard = {}; // use in bank list show
  bankList: Boolean = true; // value in bank list or not in bank list flag
  bankForm: Boolean = true; // bank form show and hidde
  lenthoffical; // length of offical data
  lenthperosnal; // length of personal data
  payrollDetailsForm: any; //payroll form name
  payrollData: any []; //list data of payoll
  payrollList: Boolean = true; // flag of payroll list
  payrollForm: Boolean = true; // flag of payroll form
  payollDataLength; // checke length of payoll Data
  paymentType = ['Cash', 'Cheque', 'Tansfer to Bank Account'];
  biodata:any[]; // bio data api data
  bioForm:Boolean = true; //bio form flag
  bioList: Boolean =true; // bio list glag
  errorMsgg: String;
  languageSkillList: Boolean = false; // language skill list flag
  lsnguageSkillForm: Boolean = false; // language skill form flag
  addLanguageBtn: Boolean = true; // btn flag for add language
  languageSkillForm: any; // language skill form name
  LanguageData: any [];
  languageSkillTitle;
  percentErrorMsg = 'Percent is Required';
  payrollGradeRuleList: any;
  payrollGradeRuleName: any;
  basicDetailsData = [];
  educationalStatus = ['Completed','Pursuing'];
  employeeLeaveData: any; //list data of leave
  employeeLeaveList: Boolean = true; // flag of leave list
  employeeLeaveForm: Boolean = true; // flag of leave form
  employeeLeaveDetailsForm: FormGroup; //employee Leave settings form
  employeeLeaveDataLength; // checke length of payoll Data
  leaveSettingHeadingButton: String;
  leaveSettingButton = true;
  leaveSettingId: any;
  existingDocumentLength: any;
  uploadForm: any;
  idProofsData: any; //list data of Employee Id's
  idProofsList: Boolean = true; // flag of Id's list
  idProofsForm: Boolean = true; // flag of Id's form
  idProofsDetailsForm: any; //employee Id's Details form
  idProofsDataLength; // checke length of Id's Data
  idProofsHeadingButton: String;
  idProofsSettingButton = true;
  idProofsSettingId: any;

  bannBtn = 'Submit';
  experienceBtn = 'Submit';
  educationBtnadd = 'Submit';
  addfamilyBtn = 'Submit';
  skillLanguageBtn = 'Submit';
  payrollButton = 'Submit';
  languageSkillEditId;
  leaveButton = 'Submit';
  idProofsButton = 'Submit';

constructor(public fb: FormBuilder,
  private docApi: DocumentServices,
  private api: EmployeeService,
  public ngZone: NgZone,
  private router: Router,
  private route:ActivatedRoute,
  private skillApi:skillCategoryApiService,
  private http: HttpClient,
  private util:UtilitiesService  ) { }




ngOnInit() {
  this.snapShotParam = this.route.snapshot.paramMap.get("employeeId");
  (this.snapShotParam === null)? this.basicDetail = 'Submit': this.basicDetail = 'Update';
  this.getTlList();
  this.existingBasicDetails();
  this.formDataValidation();
  this.listDocument();
  this.getList();
  this.addressValidation();
  this.educationDetailsValidation();
  this.empBioValidation();
  this.bankDataValidation();  // this function use in upload bank details for validation check
  this.experienceValidation(); // this function use in data validation for work Expeience
  this.skillCate(); // this function use in skill categray
  this.addMemberValidation(); // this function use for check validation of add member relation
  this.payrollValidation(); // this.payollvalidation function to fill value
  this.languageSkillValidation(); // check validation
  this.leaveSettingForm();
  this.uploadImageForm();
  this.idProofsSettingForm();
  (document.getElementById('headerCompanyDropDown')as HTMLInputElement).setAttribute('disabled','disabled');
}

/**
 * Basic Form Functionality Start From Here
 * Basic Form Validation While Adding an Employee
 */

formDataValidation() {
  this.employeeBasicForm = this.fb.group({
    departmentId: new FormControl('', Validators.required),
    branchId: new FormControl('', Validators.required),
    companyId: new FormControl('', Validators.required),
    jobProfileId: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    dob: new FormControl('', Validators.required),
    contactDetails: new FormGroup({
      personal: new FormGroup({
        phone: new FormControl('', Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(12),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
        ])),
        landLineNum: new FormControl('', Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(12),
          Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$'),
        ])),
        email: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])),
      }),
      official: new FormGroup({
        phone: new FormControl('', Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(12),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
        ])),
        landLineNum: new FormControl('', Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$'),
        ])),
        email: new FormControl("", Validators.compose([Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])),
      })
    }),
    officialEmailAsLoginEmail: new FormControl(false),
    isTL: new FormControl(false),
    tlId: new FormControl('')

  })
}

/**
 * Functionality While Updating Employee Basic Details
 * Validation While Updating Employee Basic Details
 */

existingBasicDetails(){
  this.api.employeeList(this.snapShotParam).subscribe(data=>{
    if(data.status === 'success'){
      this.basicDetailsData.push(data.data);
      for (var i = 0; i < this.basicDetailsData.length; i++) {
        if(this.snapShotParam != null){
          this.onSelect(this.basicDetailsData[i].companyId);
          this.getDepartmentListData(this.basicDetailsData[i].branchId);
        }
        this.employeeBasicForm = this.fb.group({
          departmentId: new FormControl(this.basicDetailsData[i].departmentId),
          branchId: new FormControl(this.basicDetailsData[i].branchId),
          jobProfileId: new FormControl(this.basicDetailsData[i].jobProfileId),
          companyId: new FormControl(this.basicDetailsData[i].companyId),
          name: new FormControl(this.basicDetailsData[i].employeeName),
          dob: new FormControl(this.basicDetailsData[i].dob),
          contactDetails: new FormGroup({
            personal: new FormGroup({
              phone: new FormControl(this.basicDetailsData[i].personalContactNum,Validators.compose([
                Validators.minLength(10),
                Validators.maxLength(12),
                Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
              ])),
              landLineNum: new FormControl(this.basicDetailsData[i].personalPhoneNum,Validators.compose([
                Validators.minLength(10),
                Validators.maxLength(12),
                Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$'),
              ])),
              email: new FormControl(this.basicDetailsData[i].personalEmail,Validators.compose([
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
              ])),
            }),
            official: new FormGroup({
              phone: new FormControl(this.basicDetailsData[i].officialContactNum,Validators.compose([
                Validators.minLength(10),
                Validators.maxLength(12),
                Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
              ])),
              landLineNum: new FormControl(this.basicDetailsData[i].officialPhoneNum,Validators.compose([
                Validators.minLength(10),
                Validators.maxLength(12),
                Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$'),
              ])),
              email: new FormControl(this.basicDetailsData[i].officialEmail,Validators.compose([
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
              ])),
            })
          }),
          officialEmailAsLoginEmail: new FormControl(false),
          isTL: new FormControl(false),
          tlId: new FormControl('')
        })
      }
    }
  })
}

/**
 * Calling for API for Submit Data and Update Date
 * Clean Reactive Form Validation was Added here
 */

employeeForm() {
  try {
    // Clean Form
    let cleanBasicDetailForm = this.util.cleanFormLevelTwo(this.employeeBasicForm);
    if(this.snapShotParam === null){
      if (this.employeeBasicForm.valid) {
        this.api.submitData(cleanBasicDetailForm.value).subscribe((data) => {
          if (data.status == "success" || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            this.hidden = data.data.employeeDetails._id;
            setTimeout(() => {
              this.ngZone.run(() => this.router.navigateByUrl(`/pages/employee-wizard/employee-profile/${this.hidden}`));
              this.handleErrroMessage();
            }, 1500);
          }
          else if (data.status == "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrroMessage();
            }, 1500);
          }
        })
      }
    } else {
      if (this.employeeBasicForm.valid) {
        this.api.updateEmployeeBasicDetails(cleanBasicDetailForm.value,this.snapShotParam).subscribe((data) => {
          if (data.status == "success" || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrroMessage();
            }, 1500);
          }
          else if (data.status == "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrroMessage();
            }, 1500);
          }
        })
      }
    }

  } catch (err) {
    console.log(err);
  }
}

// checkbox for officail details as personal details

sameAsPersonalDetails(action){
  if(action === false){
    this.actionBox = true;
  } else if(action === true){
    this.actionBox = false;
  }

  if(this.actionBox === true){
    this.existingPersonalDetails = this.employeeBasicForm.value.contactDetails.personal;
    this.employeeBasicForm.get('contactDetails.official.phone').setValue(this.existingPersonalDetails.phone);
    this.employeeBasicForm.get('contactDetails.official.landLineNum').setValue(this.existingPersonalDetails.landLineNum);
    this.employeeBasicForm.get('contactDetails.official.email').setValue(this.existingPersonalDetails.email);
  } else if (this.actionBox === false){
    this.employeeBasicForm.get('contactDetails.official.phone').setValue('');
    this.employeeBasicForm.get('contactDetails.official.landLineNum').setValue('');
    this.employeeBasicForm.get('contactDetails.official.email').setValue('');
  }
}

// Whole Functionality Ends Here For Basic Details!!


/**
 * Employee Bio Details Form Functionality Start from here
 * Validation While Updating Employee Bio Details
 */

empBioValidation() {
  try {
    this.employeeBioForm = this.fb.group({
      bio: new FormGroup({
        height: new FormControl('',Validators.compose([Validators.pattern(/^[1-9]'((\s?)(-?)(\s?)([0-9]|(1[0-1]))\")?$/)])),
        weight: new FormControl('',Validators.compose([Validators.pattern(/^\d{2,3} ?kg$/)])),
        color: new FormControl(''),
        moleIdentification: new FormControl(''),
        bloodGroup: new FormControl('',Validators.compose([Validators.pattern(/^(A|B|AB|O)[+-]$/)])),
        eyePower: new FormControl(''),
        handicapped: new FormControl(false),
        handicappedPercent: new FormControl('',Validators.compose([Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)])),
        multipleHandicapped: new FormControl(false),
        multipleHandicappedPercent: new FormControl('',Validators.compose([Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)])),
        illness: new FormGroup({
          physical: new FormGroup({
            physicalIllnessName: new FormControl(''),
            treatmentName: new FormControl(''),
            hospitalName: new FormControl(''),
            treatmentDuration: new FormControl(''),
            illnessStatus: new FormControl(''),
          }),
          mental: new FormGroup({
            mentalIllnessName: new FormControl(''),
            treatmentName: new FormControl(''),
            hospitalName: new FormControl(''),
            treatmentDuration: new FormControl(''),
            illnessStatus: new FormControl(''),
          })
        })
      })
    })
  } catch (err) {
    console.log(err.message);
  }
}

/**
 * Functionality while updating Employee Bio Details
 * Employee Bio Details Form Validation
 */

bioEdit(){
  this.bioList = false;
  this.bioForm = true;
  this.shown = this.biodata[0].multipleHandicapped;
  this.show = this.biodata[0].handicapped;
  for(var i=0;i<this.biodata.length;i++){
    this.employeeBioForm = this.fb.group({
      bio: new FormGroup({
        height: new FormControl(this.biodata[i].height,Validators.compose([Validators.pattern(/^[1-9]'((\s?)(-?)(\s?)([0-9]|(1[0-1]))\")?$/)])),
        weight: new FormControl(this.biodata[i].weight,Validators.compose([Validators.pattern(/^\d{2,3} ?kg$/)])),
        color: new FormControl(this.biodata[i].color),
        moleIdentification: new FormControl(this.biodata[i].moleIdentification),
        bloodGroup: new FormControl(this.biodata[i].bloodGroup,Validators.compose([Validators.pattern(/^(A|B|AB|O)[+-]$/)])),
        eyePower: new FormControl(this.biodata[i].eyePower),
        handicapped: new FormControl(this.biodata[i].handicapped),
        handicappedPercent: new FormControl(this.biodata[i].handicappedPercent,Validators.compose([Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)])),
        multipleHandicapped: new FormControl(this.biodata[i].multipleHandicapped),
        multipleHandicappedPercent: new FormControl(this.biodata[i].multipleHandicappedPercent,Validators.compose([Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)])),
        illness: new FormGroup({
          physical: new FormGroup({
            physicalIllnessName: new FormControl(this.biodata[i].illness.physical.physicalIllnessName),
            treatmentName: new FormControl(this.biodata[i].illness.physical.treatmentName),
            hospitalName: new FormControl(this.biodata[i].illness.physical.hospitalName),
            treatmentDuration: new FormControl(this.biodata[i].illness.physical.treatmentDuration),
            illnessStatus: new FormControl(this.biodata[i].illness.physical.illnessStatus),
          }),
          mental: new FormGroup({
            mentalIllnessName: new FormControl(this.biodata[i].illness.mental.mentalIllnessName),
            treatmentName: new FormControl(this.biodata[i].illness.mental.treatmentName),
            hospitalName: new FormControl(this.biodata[i].illness.mental.hospitalName),
            treatmentDuration: new FormControl(this.biodata[i].illness.mental.treatmentDuration),
            illnessStatus: new FormControl(this.biodata[i].illness.mental.illnessStatus),
          })
        })
      })
    })
  }
}

/**bio list data function configuration */
bioListData(){
  this.api.bioDataList(this.snapShotParam).subscribe(data=>{
    if(data.status === 200 || data.status === 'success'){
      if(Object.keys(data.data).length === 3){
        this.bioList= false;
        this.bioForm= true;
        this.employeeBioButton = 'Submit';
      }else{
        this.employeeBioButton = 'Update';
        this.bioList= true;
        this.bioForm= false;
        this.biodata = data.data;
        this.biodata = Array.of(this.biodata);
      }
    }
  })
}
employeeBioFormData() {
  try{
    let cleanBioData = this.util.cleanFormLevelThree(this.employeeBioForm);
    if(this.employeeBioButton === 'Submit'){
      this.api.submitBioData(cleanBioData.value, this.snapShotParam).subscribe(data => {
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.bioListData();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(() => {
            this.handleErrroMessage();
          },2000)
        }
      })
    } else if(this.employeeBioButton === 'Update'){
      this.api.updateBio(cleanBioData.value, this.snapShotParam).subscribe(data =>{
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.bioListData();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(() => {
            this.handleErrroMessage();
          },2000)
        }
      })
    }

  } catch(err){
    console.log(err);
  }

}

/**
 *
 * @Function setValidators(),updateValueAndValidity(),clearValidators()
 * Predefined Function Of Reactive Form
 */

check(value: String) {
let dynamicValidation = {'dynamic':[Validators.required, Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)]};
  if (value === "true") {
    if(this.employeeBioButton === 'Update'){
      this.employeeBioForm.get('bio.handicappedPercent').setValue('');
      this.employeeBioForm.get('bio.handicappedPercent').setValidators(dynamicValidation['dynamic']);
      this.employeeBioForm.get('bio.handicappedPercent').updateValueAndValidity();
    } else {
      this.show = true;
      this.employeeBioForm.get('bio.handicapped').setValue(true);
      this.employeeBioForm.get('bio.handicappedPercent').setValidators(dynamicValidation['dynamic']);
      this.employeeBioForm.get('bio.handicappedPercent').updateValueAndValidity();
    }
  } else {
    this.show = false;
    this.employeeBioForm.get('bio.handicapped').setValue(false);
    this.employeeBioForm.get('bio.handicappedPercent').clearValidators();
    this.employeeBioForm.get('bio.handicappedPercent').updateValueAndValidity();
  }
}

/**
 *
 * @Function setValidators(),updateValueAndValidity(),clearValidators()
 * Predefined Function Of Reactive Form
 */

checked(value: String) {
  let dynamicValidation = {'dynamic':[Validators.required, Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i)]}
  if (value === "true") {
    if(this.employeeBioButton === 'Update'){
      this.employeeBioForm.get('bio.multipleHandicappedPercent').setValue('');
      this.employeeBioForm.get('bio.multipleHandicappedPercent').setValidators(dynamicValidation['dynamic']);
      this.employeeBioForm.get('bio.multipleHandicappedPercent').updateValueAndValidity();
    } else {
      this.shown = true;
      this.employeeBioForm.get('bio.multipleHandicapped').setValue(true);
      this.employeeBioForm.get('bio.multipleHandicappedPercent').setValidators(dynamicValidation['dynamic']);
      this.employeeBioForm.get('bio.multipleHandicappedPercent').updateValueAndValidity();
    }
  } else {
    this.shown = false;
    this.employeeBioForm.get('bio.multipleHandicapped').setValue(false);
    this.employeeBioForm.get('bio.multipleHandicappedPercent').clearValidators();
    this.employeeBioForm.get('bio.multipleHandicappedPercent').updateValueAndValidity();
  }
}
// Validations For Employee Bio
bioValidationMessage = {
  'height': [
    { type: 'pattern', message: 'Height value is not acceptable.'},
  ],
  'weight': [
    { type: 'pattern', message: 'Weight value is not acceptable.'},
  ],
  'bloodGroup': [
    { type: 'pattern', message: 'Blood Group value is not acceptable.'},
  ],
  'handicappedPercent': [
    { type: 'pattern', message: 'Percentage is not acceptable.'},
    { type: 'required', message: 'Percentage is Required.'},

  ],
  'multipleHandicappedPercent': [
    { type: 'pattern', message: 'Percentage value is not acceptable.'},
    { type: 'required', message: 'Percentage is Required.'},

  ]
}
/**Update address and show address*/

/**
 * Address Form Functionality Start Fom Here
 * Address Form Validation Functionality
 */
addressValidation() {
  try {
    this.employeeAddressForm = this.fb.group({
      address: new FormGroup({
        doorNum: new FormControl(''),
        streetName1: new FormControl(''),
        streetName2: new FormControl(''),
        landmark: new FormControl(''),
        // zipcode: new FormControl(''),
        zipcode: new FormControl('', Validators.compose([Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),
        ])),
        district: new FormControl(''),
        state: new FormControl(''),
        addressType: new FormControl('Current'),
      })
    })
  } catch (err) {
    console.log(err.message);
  }
}

//Address Validation Message

validationMessageZip = {
  'zipcode': [
    { type: 'required', message: 'Zipcode is Required' },
    { type: 'pattern', message: 'Invalid Zipcode' },
    { type: 'minlength', message: 'Not a Zipcode ' },
    { type: 'maxlength', message: 'Zipcode is too large' },
  ],
}

// Address List Functionality

showAddress(){
  this.api.oldAddress(this.snapShotParam).subscribe((data) =>{
    if (data.status === 'success' || data.status === 200 ) {
      if( data.data.length == 0 || data.status == 'error' || data.state == 400 ){
        this.titleName = "Add Address";
        this.addessBtn = false;
        this.addAddess = true;
        this.addressMsg = false;
      } else {
        this.addAddess = false;
        this.addessBtn = true;
        this.addressList = data.data;
        this.addressMsg = true;
      }
    }
  })
}

// Address driver function

addNewAddress(){
  this.employeeAddressForm.reset();
  this.addessBtn = false;
  this.titleName = "Add Address";
  this.buttonName = "Submit";
  this.addAddess = true;
  this.addressId = ' ';

}

// Calling API for Add And Update Employee Address

addressForm() {
  try{
    let cleanAddressForm = this.util.cleanFormLevelOne(this.employeeAddressForm);
    if(this.addressId == " " || this.addressId ===null || this.addressId === undefined ){
      this.api.submitAddress(cleanAddressForm.value, this.snapShotParam).subscribe((data) => {
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.showAddress();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          })
        }
      })
    }else{
      this.api.updateAddess(cleanAddressForm.value, this.snapShotParam,this.addressId).subscribe((data) => {
        if (data.status === "success" || data.status === 200) {
          this.previousValue = data.data;
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.showAddress();
            this.handleErrroMessage();
          },1000)

        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          })
        }
      })
      this.addressId = "";
    }
  }catch(err){
    console.log(err);
  }

}

/**
 * Employee Address Update Functionality
 * Employee Address Fom Validation
 */

addressEdit(id:String){
  this.titleName = "Update Address";
  this.buttonName = "Update";
  this.addressId = id;
  this.addAddess = true;
  this.addessBtn = true;
  this.addressList ;
  for(var i =0;i<this.addressList.length; i++) {
    if (this.addressList[i]._id === this.addressId){
      this.employeeAddressForm = this.fb.group({
        address: new FormGroup({
          doorNum: new FormControl(this.addressList[i].doorNum),
          streetName1: new FormControl(this.addressList[i].streetName1),
          streetName2: new FormControl(this.addressList[i].streetName2),
          landmark: new FormControl(this.addressList[i].landmark),
          zipcode: new FormControl(this.addressList[i].zipcode),
          district: new FormControl(this.addressList[i].district),
          state: new FormControl(this.addressList[i].state),
          addressType: new FormControl('Current'),
        })
      })
    }
  }
}

cancleAddForm(){
  this.addressId = " ";
  this.addAddess = false;
  this.addessBtn = true;
}

//Delete Employee Address

removeAddess(addressId:String){
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
  } as any).then((result) => {
    if (result.value) {
      this.api.deleteAddress(this.snapShotParam,addressId).subscribe((data)=>{
      swalWithBootstrapButtons.fire(
        'Deleted!',
        data.message,
        'success'
      )
      this.showAddress();
    })
    } else if (
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Your data is safe',
        'error'
      )
    }
  })
}

// Employee Address Whole Functinality Ends Here


//Method for job profile list
getJobProfile(companyId) {
  try {
    this.api.getJobProfileListData(companyId).subscribe(data => {
      if (data.status === 'success' || data.status === 200) {
        this.jobProfileList = data.data;
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

//For Form value and validation
educationDetailsValidation() {
  try {
    this.empEducationForm = this.fb.group({
      educationalDetails: new FormGroup({
        courseName: new FormControl(''),
        instituteName: new FormControl(''),
        passOutYear: new FormControl('',Validators.compose([
          Validators.required,
          Validators.pattern(/^(19|20)\d{2}$/)
      ])),
        status: new FormControl(''),
        description: new FormControl(''),
        scoredPercent: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/)
        ])),
      })
    })
  } catch (err) {
    console.log(err.message);
  }
}

validationMessageEducation = {
  'passOutYear': [
    { type: 'required', message: 'Pass Out Year is Required' },
    { type: 'pattern', message: 'Invalid Year' },
  ],
  'scoredPercent': [
    { type: 'required', message: 'Percentage is Required' },
    { type: 'pattern', message: 'Invalid Percentage' },
  ],
}





//Method for get company list
getList() {
  try {
    this.api.getCompanyData().subscribe(data => {
      if (data.status === 'success' || data.status === 200) {
        this.companyListData = data.company;
      }
    })
  }
  catch (err) {
    console.log(err.message);
  }
}

//Method for Show branch list
showBranchList(companyId: String) {
  try {
    this.api.getBranchListData(companyId).subscribe((data) => {
      if (data.status === "success" || data.status === 200) {
        this.branch = data.branch.length;
        this.branchList = data.branch;
      }
    })
  }
  catch (err) {
    console.log(err);
  }
}

//Method for set selected value according to companyId.
onSelect(companyId) {
  try {
    this.showBranchList(companyId);
    this.getJobProfile(companyId);
  } catch (err) {
    console.log(err);
  }
}

/* Method for set selected value according to branchId. */
onClick(branchId) {
  try {
    this.getDepartmentListData(branchId);
  } catch (err) {
    console.log(err.message);
  }
}

scroll(element) {
  element.scrollIntoView();
}

// Get DepartmentList
getDepartmentListData(branchId: string) {
  try {
    this.api.getDepartmentData(branchId).subscribe((data) => {
      if (data.status === "success" || data.status === 200) {
        this.departmentList = data.department;
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

//Method for show validation message
validationMessage = {
  'name': [
    { type: 'required', message: 'Name is required' },
  ],
  'departmentId': [
    { type: 'required', message: 'Department Name is required' },
  ],
  'branchId': [
    { type: 'required', message: 'Branch Name is required' },
  ],
  'companyId': [
    { type: 'required', message: 'Company Name is required' },
  ],
  'jobProfileId': [
    { type: 'required', message: 'Job Profile Name is required' },
  ],
  'dob': [
    { type: 'required', message: 'Birthday Date is required' },
  ],
  'email': [
    { type: 'required', message: 'Email is required' },
    { type: 'pattern', message: 'Enter a valid email' },
  ],
  'phone': [
    { type: 'required', message: 'Phone number is required' },
    { type: 'pattern', message: 'Invalid Phone Number' },
    { type: 'minlength', message: 'Not a phone number ' },
    { type: 'maxlength', message: 'Phone no. is too large' },
  ],
  'landLineNum': [
    { type: 'pattern', message: 'Invalid Landline Number' },
    { type: 'minlength', message: 'Not a Landline number ' },
    { type: 'maxlength', message: 'Landline no. is too large' },
  ],

}

/** Upload Document ts file configration start here */
listDocument() {
  try {
    this.docApi.documentData().subscribe(data => {
      if (data.status === 'success' || data.status === 200) {
        this.docData = data.data;
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

handleInputChange(e) {
  var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
  var pattern = /image-*/;
  var reader = new FileReader();
  if (!file.type.match(pattern)) {
    alert('Image Format is not valid');
    return;
  }
  reader.onload = this._handleReaderLoaded.bind(this);
  reader.readAsDataURL(file);
}

_handleReaderLoaded(e) {
  let reader = e.target;
  this.imageSrc = reader.result;
  this.imagePath = this.imageSrc;
}

remove() {
  alert("Remove button is working");
}

counter(i: number) {
  return new Array(i);
}
/** Upload Document ts file configration End here */


/** skill category functions */
skillCate() {
  this.skillApi.skillCategoryData().subscribe(data => {
    if(data.status === 'success' || data.status === 200) {
      this.skillValue  = data.skillCategory;
    }
  })
}
/** skill category functions */

/** add Family  */
onSelectRelation(value) {
  this.showForm = value;
}

//add family details form validation
addMemberValidation() {
  this.addRelationForm = this.fb.group({
    family: new FormGroup({
      members: new FormGroup({
        relation: new FormControl("Father", Validators.required),
        name: new FormControl(''),
        age: new FormControl('',Validators.compose([Validators.pattern(/^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/)])),
        occupation: new FormControl(''),
        education: new FormControl(''),
        income: new FormControl(''),
      })
    }),
    familyType: new FormControl('Joint'),
  })
}


validationMessageFamily = {
  'age': [
    { type: 'pattern', message: 'Invalid Age' },
  ],
}

updateValidation(familyId:String) {
  try {
    this.addfamilyBtn = 'Update';
    this.showAddFamilyButton = false;
      this.familyIdValue = familyId;
      this.formShow = true;
      this.title = "Update";
      for (var i = 0; i < this.familyDetailsList.length; i++) {
        if (this.familyDetailsList[i]._id === familyId) {
          console.log("n",this.familyDetailsList[i]._id);
          console.log("v",this.familyId);

          this.addRelationForm = this.fb.group({
            family: new FormGroup({
              members: new FormGroup({
                relation: new FormControl(this.familyDetailsList[i].relation, Validators.required),
                name: new FormControl(this.familyDetailsList[i].name),
                age: new FormControl(this.familyDetailsList[i].age,Validators.compose([Validators.pattern(/^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/)])),
                occupation: new FormControl(this.familyDetailsList[i].occupation),
                education: new FormControl(this.familyDetailsList[i].education),
                income: new FormControl(this.familyDetailsList[i].income),
              })
            }),
            familyType: new FormControl(this.familyTypeList),
          })
        }
      }
  } catch (err) {
    console.log(err.message);
  }

}
/** add family */

//Method for onclick on button show form and hide current button
showAddFamilyForm(){
  this.familyIdValue = "";
  this.addfamilyBtn = 'Submit';
  this.formShow = true;
  this.addRelationForm.reset();
  this.title = "Add";
  this.showAddFamilyButton = false;

}

//Function for onclick button for hide form
cancelValue(){
  this.formShow = false;
  this.showAddFamilyButton = true;
}

//Method for add and update employee details
addFamilyDetails() {
  this.addfamilyBtn = 'submit';
  try {
  let cleanFamilyForm = this.util.cleanFormLevelThree(this.addRelationForm);
  this.showAddFamilyButton = true;
    if( this.familyId.nativeElement.value === "" ){
      this.api.addFamilyMember(cleanFamilyForm.value, this.snapShotParam).subscribe(data => {
      if (data.status === 'success' || data.status === 200) {
        this.successMessage = true;
        this.errorMsg = false;
        this.successMsg = data.message;
        setTimeout(() => {
          this.getFamilyDetails();
          this.handleErrroMessage();
        }, 500);
        this.addRelationForm.reset();
      } else if (data.status === "error" || data.status === 404) {
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        setTimeout(()=>{
          this.handleErrroMessage()
        },2000);
      }
    })
    }
    else{
      if(this.addRelationForm.valid){
        this.api.updateFamilyDetails(cleanFamilyForm.value, this.snapShotParam, this.familyId.nativeElement.value).subscribe((data)=>{
          if (data.status === "success" || data.status === 200) {
            this.successMessage = true;
            this.errorMsg = false;
            this.successMsg = data.message;
            setTimeout(() =>{
              this.getFamilyDetails();
              this.handleErrroMessage();
            },1000)
          } else if (data.status === "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(()=>{
              this.handleErrroMessage()
            },2000);
          }
        })
      }
    }
  } catch (err) {
    console.log(err);
  }
}

//Get family details
getFamilyDetails() {
  try {
    this.formShow = false;
    this.api.getFamilyData(this.snapShotParam).subscribe(response => {
      if (response.status === "success" || response.status === 200) {
        if (response.data.familyDetails.length > 0) {
          this.divShow = true;
          this.familyDetailsList = response.data.familyDetails;
          this.familyTypeList = response.data.familyType;
        } else if(response.data.familyDetails.length === 0){
          this.divShow = false;
          this.showAddFamilyForm();
        }
      }
      else if(response.status === "error" || response.status === 404) {
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

//Method for remove company branch
deleteFamilyDetails(familyId: String) {
  try {
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
    } as any).then((result) => {
      if (result.value) {
        this.api.removeFamilyDetails(this.snapShotParam, familyId).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            swalWithBootstrapButtons.fire(
              'Deleted!',
              data.message,
              'success'
            )
            this.getFamilyDetails();

          }
        })
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your data is safe',
          'error'
        )
      }
    })
  }
  catch (err) {
    console.log(err.message);
  }
}


/**Update Education details */
showEducationDetails(){
  this.api.educationDetails(this.snapShotParam).subscribe(data => {
    if(data.status === 'success') {
      if(data.data.length == 0){
        this.education = "Education-Details";
        this.EducationForm = true;
        this.listMesg = false;
        this.educationBtn= false;
      } else {
        this.EducationForm = false;
        this.educationBtn = true;
        this.educationData = data.data;
        this.listMesg = true;
      }
    } else {
      this.errorMsg = true;
    }
  })
}


switchTypeValidation(inputValue:Number){
  if(inputValue >0 && inputValue <= 100 ){
      this.percentErrorMsg = '';
      this.errorMsgg = '';
  } else if((inputValue).toString().length == 0){
      this.percentErrorMsg = 'Percent is Required';
      this.errorMsgg = '';
  } else if((inputValue).toString().length > 6) {
      this.percentErrorMsg = 'Percent Value is too Large';
      this.errorMsgg = '';
  } else {
      this.percentErrorMsg = '';
      this.errorMsgg = 'Enter value is not valid';
  }
}

educationEdit(id){
  this.eduBtn = "Update";
  this.educationBtnadd = 'Update';
  this.education = "Update Education-Details";
  this.educationCurentId = id;
  this.EducationForm = true;
  this.educationData;
  // const len = Object.keys(this.educationData).length;
  for(var i =0;i<this.educationData.length; i++) {
  if (this.educationData[i]._id === this.educationCurentId){
  this.empEducationForm = this.fb.group({
    educationalDetails: new FormGroup({
      courseName: new FormControl(this.educationData[i].courseName),
      instituteName: new FormControl(this.educationData[i].instituteName),
      passOutYear: new FormControl(this.educationData[i].passOutYear,Validators.compose([
        Validators.required,
        Validators.pattern(/^(19|20)\d{2}$/)
    ])),
      status: new FormControl(this.educationData[i].status),
      description: new FormControl(this.educationData[i].description),
      // scoredPercent: new FormControl(this.educationData[i].scoredPercent),
      scoredPercent: new FormControl(this.educationData[i].scoredPercent, Validators.compose([
        Validators.required,
        Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/)
    ])),
    })
  })
}
}
}

removeEducation(id:String){
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
      this.api.removeEducation(this.snapShotParam,id).subscribe((data)=>{
      swalWithBootstrapButtons.fire(
        'Deleted!',
        data.message,
        'success'
      )
      this.showEducationDetails();
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

addNewEducation() {
  this.eduBtn = "Submit";
  this.educationBtn= false;
  this.education = "Education-Details";
  this.empEducationForm.reset();
  this.EducationForm = true;
  this.educationCurentId = " ";

}

cancleEducation(){
  this.EducationForm = false;
  this.educationBtn = true;
  this.educationCurentId = " ";
}

educationForm() {
  try {
    let cleanEducationalFormData = this.util.cleanFormLevelOne(this.empEducationForm);
    if(this.educationCurentId == " " || this.educationCurentId === null || this.educationCurentId === undefined){
      this.api.submitEducationalData(cleanEducationalFormData.value, this.snapShotParam).subscribe(data => {
        if (data.status === "success" || data.status === 200) {
          this.previousValue = data.data;
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.showEducationDetails();
            this.handleErrroMessage();
          },1000);

        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },2000);
        }
      })
    } else {
      this.api.updateEducation(cleanEducationalFormData.value,this.snapShotParam,this.educationCurentId).subscribe(data => {
        if (data.status === "success" || data.status === 200) {
          this.previousValue = data.data;
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.showEducationDetails();
            this.handleErrroMessage();
          },1000);

        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },2000);
        }
      })
      this.educationCurentId = "" ;
    }
  } catch (err) {
    console.log(err.message);
  }
}

/**Update Education details */


/**Update work exprience */
showWorkList(){
  this.api.workExprience(this.snapShotParam).subscribe(data => {
    if(data.status === 'success') {
      if(data.data.length == 0){
        this.exprienceTitle = "Work Experience";
        this.addExpbtn = false;
        this.workExperience = true;
        this.listExprience = false;
      } else {
        this.workExperience = false;
        this.exprienceListData = data.data;
        this.listExprience = true;
        this.addExpbtn= true;
      }
    } else {
      this.errorMsg = true;
    }
  })
}

expriceneEdit(id){
  this.exprienceTitle = "Update Experience";
  this.experienceBtn = 'Update';
  this.workExperience = true;
  this.addExpbtn = true;
  this.expCurentId = id;
  for(var i =0;i<this.exprienceListData.length; i++){
    if(this.exprienceListData[i]._id === this.expCurentId){
      this.workExperienceForm = this.fb.group({
        workExperiences: new FormGroup({
          companyName: new FormControl(this.exprienceListData[i].companyName),
          designation: new FormControl(this.exprienceListData[i].designation),
          experienceYears: new FormControl(this.exprienceListData[i].experienceYears,Validators.compose([
            Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i),
            Validators.max(40),
          ])),
          jobDescription: new FormControl(this.exprienceListData[i].jobDescription),
          relivingReason: new FormControl(this.exprienceListData[i].relivingReason),
          relivingIs: new FormControl(this.exprienceListData[i].relivingIs),
          remarks: new FormControl(this.exprienceListData[i].remarks),
        })
      })
    }
  }
}

removeExpeience(id){
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
      this.api.removeExprience(this.snapShotParam,id).subscribe((data)=>{
      swalWithBootstrapButtons.fire(
        'Deleted!',
        data.message,
        'success'
      )
      this.showWorkList();
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

cancleExperience(){
  this.workExperience = false;
  this.addExpbtn=true;
}

addExperience(){
  this.workExperienceForm.reset();
  this.experienceBtn = 'Submit';
  this.exprienceTitle = "Add Experience";
  this.workExperience = true;
  this.addExpbtn = false;
  this.expCurentId = '';
}

/**upload work Experience */
addWorkExp() {
  try {
    let cleanWorkExperienceForm = this.util.cleanFormLevelOne(this.workExperienceForm);
    if(this.expCurentId == '' || this.expCurentId == null){
      this.api.experiAdd(cleanWorkExperienceForm.value, this.snapShotParam).subscribe(data => {
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.showWorkList();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage()
          },2000)
        }
      })
    } else {
      this.api.updateWokExprience(cleanWorkExperienceForm.value,this.snapShotParam,this.expCurentId).subscribe(data=>{
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.showWorkList();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage()
          },2000)
        }

      })
    }
  } catch (err) {
    console.log(err.message);
  }
}

validationMessageExper = {
  'experienceYears': [
    { type: 'pattern', message: 'Invalid Experience Years' },
    { type: 'max', message: 'Experience Years should be less than 40'}
  ],
}


experienceValidation() {
  try {
    this.workExperienceForm = this.fb.group({
      workExperiences: new FormGroup({
        companyName: new FormControl(''),
        designation: new FormControl(''),
        experienceYears: new FormControl('',Validators.compose([
          Validators.pattern(/(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/i),
          Validators.max(40),
        ])),
        jobDescription: new FormControl(''),
        relivingReason: new FormControl(''),
        relivingIs: new FormControl(''),
        remarks: new FormControl(''),
      })
    })
  }
  catch (err) {
    console.log(err);
  }
}
/** upload work experience */
/** Update work exprience */



/**Bank details update delete */
bankDetails(){
  try{
    this.actionBox = false;
    this.api.bankDetailsList(this.snapShotParam).subscribe(data=>{
      if(data.status === 'success' || data.status === 200){
          this.lenthoffical = Object.keys(data.data.official).length;
          this.lenthperosnal = Object.keys(data.data.personal).length;
        if(this.lenthoffical == 0 || this.lenthperosnal == 0){
          this.bankList = false;
          this.bankForm = true;
          this.bankDetailsForm.reset();
        }else{
          this.bankListData = data.data;
          this.bankListData = Array.of(this.bankListData);
          this.bankList = true;
          this.bankForm= false;
        }
      }
    })
  }catch(err){
    console.log(err.message);
  }
}

editBankDetails(){
  this.bankForm = true;
  this.bankList = false;
  this.bannBtn = 'Update';
  this.bankListData;
  for(var i =0;i<this.bankListData.length;i++){
    this.bankDetailsForm = this.fb.group({
      bankDetails: new FormGroup({
          official: new FormGroup({
            name: new FormControl(this.bankListData[i].official.name),
            accountNum: new FormControl(this.bankListData[i].official.accountNum,Validators.compose([Validators.maxLength(16),
              Validators.pattern(/^[0-9]*$/)])),
            accountPlace: new FormControl(this.bankListData[i].official.accountPlace),
            accountType: new FormControl(this.bankListData[i].official.accountType),
            debitCardNum: new FormControl(this.bankListData[i].official.debitCardNum),
            debitCardType: new FormControl(this.bankListData[i].official.debitCardType),
            remarks: new FormControl(this.bankListData[i].official.remarks),
          }),
          personal: new FormGroup({
            name: new FormControl(this.bankListData[i].personal.name),
            accountNum: new FormControl(this.bankListData[i].personal.accountNum,Validators.compose([Validators.maxLength(16),
              Validators.pattern(/^[0-9]*$/)])),
            accountPlace: new FormControl(this.bankListData[i].personal.accountPlace),
            accountType: new FormControl(this.bankListData[i].personal.accountType),
            debitCardNum: new FormControl(this.bankListData[i].personal.debitCardNum),
            debitCardType: new FormControl(this.bankListData[i].personal.debitCardType),
            remarks: new FormControl(this.bankListData[i].personal.remarks),
        })
      })
    })
  }
}

/** Upload Banke details file configration start */

sameAsOfficialDetails(action){
  if(action === false){
    this.actionBox = true;
  } else if(action === true){
    this.actionBox = false;
  }
  if(this.actionBox === true){
    this.existingBankDetails = this.bankDetailsForm.value.bankDetails.official;
    this.bankDetailsForm.get('bankDetails.personal.name').setValue(this.existingBankDetails.name);
    this.bankDetailsForm.get('bankDetails.personal.accountNum').setValue(this.existingBankDetails.accountNum);
    this.bankDetailsForm.get('bankDetails.personal.accountPlace').setValue(this.existingBankDetails.accountPlace);
    this.bankDetailsForm.get('bankDetails.personal.accountType').setValue(this.existingBankDetails.accountType);
    this.bankDetailsForm.get('bankDetails.personal.remarks').setValue(this.existingBankDetails.remarks);

  } else if (this.actionBox === false){
    this.bankDetailsForm.get('bankDetails.personal.name').setValue('');
    this.bankDetailsForm.get('bankDetails.personal.accountNum').setValue('');
    this.bankDetailsForm.get('bankDetails.personal.accountPlace').setValue('');
    this.bankDetailsForm.get('bankDetails.personal.accountType').setValue('');
    this.bankDetailsForm.get('bankDetails.personal.remarks').setValue('');
  }
}

bankDetailsAdd() {
  try {
    let cleanBankForm = this.util.cleanFormLevelTwo(this.bankDetailsForm);
    this.api.employBank(cleanBankForm.value, this.snapShotParam).subscribe((data) => {
      if (data.status === "success" || data.status === 200) {
        this.successMessage = true;
        this.errorMsg = false;
        this.successMsg = data.message;
        setTimeout(() =>{
          this.bankDetails();
          this.handleErrroMessage();
        },1500)
      } else if (data.status === "error" || data.status === 404) {
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        setTimeout(() =>{
          this.bankDetails();
          this.handleErrroMessage();
        },2000)
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

bankDetailsCancel(){
  this.bankDetails();
}

bankDataValidation() {
  try {
    this.bankDetailsForm = this.fb.group({
      bankDetails: new FormGroup({
          official: new FormGroup({
            name: new FormControl('',Validators.compose([Validators.required])),
            accountNum: new FormControl('',Validators.compose([Validators.required,Validators.maxLength(16),
            Validators.pattern(/^[0-9]*$/)])),
            accountPlace: new FormControl(''),
            accountType: new FormControl(''),
            debitCardNum: new FormControl(''),
            debitCardType: new FormControl(''),
            remarks: new FormControl(''),
          }),
          personal: new FormGroup({
            name: new FormControl('',Validators.compose([Validators.required])),
            accountNum: new FormControl('',Validators.compose([Validators.required,Validators.maxLength(16),
              Validators.pattern(/^[0-9]*$/)])),
            accountPlace: new FormControl(''),
            accountType: new FormControl(''),
            debitCardNum: new FormControl(''),
            debitCardType: new FormControl(''),
            remarks: new FormControl(''),
        })
      })
    })
  } catch (err) {
    console.log(err);
  }
}

validationMessageBank = {
  'name': [
    { type: 'required', message: 'Bank Name is Required' },
  ],
  'accountNum': [
    { type: 'required', message: 'Account Number is Required' },
    { type: 'maxlength', message: 'Account Number is maximum of 16 digits' },
    { type: 'pattern', message: 'Account Number is not Acceptable' }
  ],
}

/** upload bank details file configration end */
/**Bank details update delete */


/** payroll add details configratin  start*/
payrollValidation(){
  this.payrollDetailsForm = this.fb.group({
    payroll:new FormGroup({
      ctc:new FormControl('',Validators.compose([Validators.required,Validators.pattern(/^\d{1,10}(?:\.\d{0,2})?$/)])),
      ctcEffectiveFromDate:new FormControl('',Validators.required),
      ctcEffectiveToDate:new FormControl('',Validators.required),
      paidLeaveBalance:new FormControl('',Validators.compose([Validators.pattern(/^\d{0,2}(?:\.\d{0,2})?$/)])),
      earnedLeaveBalance:new FormControl(''),
      gradeRule:new FormControl('',Validators.required),
      basicPay:new FormControl('',Validators.compose([Validators.required,Validators.pattern(/^\d{1,10}(?:\.\d{0,2})?$/)])),
      mode: new FormControl('Cash'),

    })
  })
}

payrollValidations = {
  'ctc': [
    { type: 'required', message: 'CTC Value is Required' },
    { type: 'pattern', message: 'CTC Value is not Acceptable' },
  ],
  'ctcEffectiveFromDate': [
    { type: 'required', message: 'Selcted Field is Required' },
  ],
  'ctcEffectiveToDate': [
    { type: 'required', message: 'Selcted Field is Required' },
  ],
  'paidLeaveBalance': [
    { type: 'pattern', message: 'Paid Leave Balance is not Acceptable' },
  ],
  'gradeRule': [
    { type: 'gradeRule', message: 'Selcted Field is Required' },
  ],
  'basicPay': [
    { type: 'required', message: 'Basic Pay Value is Required' },
    { type: 'pattern', message: 'Basic Pay Value is not Acceptable' },
  ],
}

payrollAdd(){
  try{
    if(this.payrollButton === 'Submit'){
      this.api.payrollDataSubmit(this.payrollDetailsForm.value,this.snapShotParam).subscribe(data=>{
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.payrollListData();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },2000)
        }
      })
    } else if(this.payrollButton === 'Update'){
      this.api.updatePayrollSettings(this.payrollDetailsForm.value,this.snapShotParam).subscribe(data=>{
        if (data.status === "success" || data.status === 200) {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.payrollListData();
            this.handleErrroMessage();
          },1000)
        } else if (data.status === "error" || data.status === 404) {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },2000)
        }
      })
    }
  }catch(err) {
    console.log(err);
  }
}

payrollListData(){
  try{
  this.api.payollDataList(this.snapShotParam).subscribe(data => {
    if(data.status === 'success' || data.status === 200){
      this.gradeRuleList();
      this.payollDataLength = Object.keys(data.data).length;
      if(this.payollDataLength === 2){
        this.payrollList = false;
        this.payrollForm = true;
        this.payrollDetailsForm.get('payroll.earnedLeaveBalance').setValue(data.data.earnedLeaveBalance);
      }else{
        this.payrollData = data.data;
        this.payrollData = Array.of(this.payrollData);
        this.payrollList = true;
        this.payrollForm = false;
        this.payrollButton = 'Update';
        this.payrollDetailsForm.get('payroll.earnedLeaveBalance').setValue(data.data.earnedLeaveBalance);
      }
    } else {
      console.log(data.message);
    }
  })
  }catch(err){
    console.log(err);
  }
}

// Grade Rule List

gradeRuleList(){
  try{
    this.api.gradeRuleList().subscribe(data => {
      if(data.status === 'success'){
        this.payrollGradeRuleList = data.data;
      }
    })
  }catch(err){
    console.log(err);
  }
}

payrollSettingEdit(){
  this.payrollForm = true;
  this.payrollList= false;
  for(var i=0;i<this.payrollData.length;i++){
    this.payrollDetailsForm = this.fb.group({
      payroll:new FormGroup({
        ctc:new FormControl(this.payrollData[i].ctc,Validators.compose([Validators.required,Validators.pattern(/^\d{1,10}(?:\.\d{0,2})?$/)])),
        ctcEffectiveFromDate:new FormControl(this.payrollData[i].ctcEffectiveFromDate.substring(0,10)),
        ctcEffectiveToDate:new FormControl(this.payrollData[i].ctcEffectiveToDate.substring(0,10)),
        paidLeaveBalance:new FormControl(this.payrollData[i].paidLeaveBalance,Validators.compose([Validators.pattern(/^\d{0,2}(?:\.\d{0,2})?$/)])),
        earnedLeaveBalance:new FormControl(this.payrollData[i].earnedLeaveBalance),
        gradeRule:new FormControl(this.payrollData[i].gradeRule),
        basicPay: new FormControl(this.payrollData[i].basicPay,Validators.compose([Validators.required,Validators.pattern(/^\d{1,10}(?:\.\d{0,2})?$/)])),
        mode: new FormControl(this.payrollData[i].mode),
      })
    })
  }
}

backPayrollBtn(){
  this.payrollForm = false;
  this.payrollList = true;
  this.payrollListData();

}
/** payroll add details configration end  */

/** employee Leave Settings details configratin  start*/
employeeLeaveDataList(){
  try{
  this.api.leaveEmployeeDataList(this.snapShotParam).subscribe(data => {
    if(data.status === 'success'){
      if(data.data.leaveSettings.length == 0){
        this.employeeLeaveList = false;
        this.employeeLeaveForm = true;
        this.leaveSettingButton = false;
        this.leaveButton = 'Submit';
        this.leaveSettingHeadingButton = "Add Leave Settings";
        // this.addLeaveSettingButton = true;
      }else{
        this.employeeLeaveData = data.data.leaveSettings;
        this.employeeLeaveList = true;
        this.employeeLeaveForm = false;
        this.leaveSettingButton = true;
        this.leaveButton = 'Update';
        // this.addLeaveSettingButton = false;
      }
    }
  })
  }catch(err){
    console.log(err);
  }
}

// Add Leave Settings

addLeaveSetting(){
  try{
    let cleanLeaveSettingForm = this.util.cleanFormLevelOne(this.employeeLeaveDetailsForm);
    if(this.leaveButton === 'Submit'){
      this.api.addLeaveSettings(cleanLeaveSettingForm.value,this.snapShotParam).subscribe(data=>{
        if (data.status === "success") {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.employeeLeaveDataList();
            this.handleErrroMessage();
          },2000)
        } else if (data.status === "error") {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },3000)
        }
      })
    } else if(this.leaveButton === 'Update'){
      this.api.updateLeaveSettings(cleanLeaveSettingForm.value,this.snapShotParam,this.leaveSettingId).subscribe(data=>{
        if (data.status === "success") {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.employeeLeaveDataList();
            this.handleErrroMessage();
          },2000)
        } else if (data.status === "error") {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },3000)
        }
      })
    }
  } catch(err){
    console.log(err);
  }
}

// Leave Setting Update Details

leaveSettingUpdateDetails(leaveSettingId){
  try{
    this.leaveSettingId = leaveSettingId;
    this.leaveSettingHeadingButton = "Update Leave Settings";
    this.leaveButton = "Update";
    this.employeeLeaveForm = true;
    this.leaveSettingButton = true;
    for(var i = 0; i<this.employeeLeaveData.length; i++){
      if(this.employeeLeaveData[i]._id == leaveSettingId){
        this.employeeLeaveDetailsForm = this.fb.group({
          startDate:new FormControl(this.employeeLeaveData[i].startDate.substring(0,10),Validators.required),
          endDate:new FormControl(this.employeeLeaveData[i].endDate.substring(0,10),Validators.required),
          leavePerMonth:new FormControl(this.employeeLeaveData[i].leavePerMonth,Validators.required),
          reason:new FormControl(this.employeeLeaveData[i].reason)
        })
      }
    }
  } catch(err){
    console.log(err);
  }
}

/** Leave Settings add details */
leaveSettingForm(){
  this.employeeLeaveDetailsForm = this.fb.group({
    startDate:new FormControl('',Validators.required),
    endDate:new FormControl('',Validators.required),
    leavePerMonth:new FormControl('',Validators.required),
    reason:new FormControl('',)
  })
}

// Leave Setting ADD Leave Setting Button Functionality
addNewLeaveSettings(){
  this.employeeLeaveDetailsForm.reset();
  this.leaveSettingButton = false;
  this.leaveSettingHeadingButton = "Add Leave Settings";
  this.leaveButton = "Submit";
  this.employeeLeaveForm = true;
}

// Leave Setting Cancel Button Functionality
leaveSettingCancel(){
  this.employeeLeaveDataList();
  this.employeeLeaveDetailsForm.reset();
}

validationMessageLeaveSettings = {
  'startDate': [
    { type: 'required', message: 'Start Date is Required' },
  ],
  'endDate': [
    { type: 'required', message: 'End Date is Required' },
  ],
  'leavePerMonth': [
    { type: 'required', message: 'Leave Per Month is Required' },
  ],
}

/** employee Leave details configratin End*/

/** employee Identity Proofs configratin Start*/
getEmployeeIdProofsList(){
  try{
  this.api.employeeIdProofsDataList(this.snapShotParam).subscribe(data => {

    if(data.status === 'success'){
      if(data.data.length == 0){
        this.idProofsList = false;
        this.idProofsForm = true;
        this.idProofsSettingButton = false;
        this.idProofsButton = 'Submit';
        this.idProofsHeadingButton = "Add Identity Proofs Settings";
        // this.addLeaveSettingButton = true;
      }else{
        this.idProofsData = data.data;
        this.idProofsList = true;
        this.idProofsForm = false;
        this.idProofsSettingButton = true;
        this.idProofsButton = 'Update';
        // this.addLeaveSettingButton = false;
      }
    }
  })
  }catch(err){
    console.log(err);
  }
}

// Add Employee Id Poofs Details

addIdProofs(){
  try{
    let cleanIdProofsSettingForm = this.util.cleanFormLevelTwo(this.idProofsDetailsForm);
    if(this.idProofsButton === 'Submit'){
      this.api.addEmployeeIdProofs(cleanIdProofsSettingForm.value,this.snapShotParam).subscribe(data=>{
        if (data.status === "success") {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.getEmployeeIdProofsList();
            this.handleErrroMessage();
          },2000)
        } else if (data.status === "error") {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },3000)
        }
      })
    } else if(this.idProofsButton === 'Update'){
      this.api.updateIdProofsSettings(cleanIdProofsSettingForm.value,this.snapShotParam,this.idProofsSettingId).subscribe(data=>{
        if (data.status === "success") {
          this.successMessage = true;
          this.errorMsg = false;
          this.successMsg = data.message;
          setTimeout(() =>{
            this.getEmployeeIdProofsList();
            this.handleErrroMessage();
          },2000)
        } else if (data.status === "error") {
          this.errorMsg = true;
          this.successMessage = false;
          this.errMsg = data.message;
          setTimeout(()=>{
            this.handleErrroMessage();
          },3000)
        }
      })
    }
  } catch(err){
    console.log(err);
  }
}

// Id Proofs Setting Update Details

idProofsSettingUpdateDetails(proofsId:String){
  try{
    this.idProofsSettingId = proofsId;
    this.idProofsHeadingButton = "Update Id Proofs Settings";
    this.idProofsButton = 'Update';
    this.idProofsForm = true;
    this.idProofsSettingButton = false;
    for(var i = 0; i<this.idProofsData.length; i++){
      if(this.idProofsData[i]._id === proofsId){
        this.idProofsDetailsForm = this.fb.group({
          identityProofs: new FormGroup ({
            identityName:new FormControl(this.idProofsData[i].identityName,Validators.required),
            identityNum:new FormControl(this.idProofsData[i].identityNum,Validators.required),
            authorityName:new FormControl(this.idProofsData[i].authorityName),
            issuePlace:new FormControl(this.idProofsData[i].issuePlace),
            expiryDate:new FormControl(this.idProofsData[i].expiryDate.substring(0,10),Validators.required),
            remarks:new FormControl(this.idProofsData[i].remarks)
          })
        })
      }
    }
  } catch(err){
    console.log(err);
  }
}

//Method for remove Employee Id Proofs
deleteIdentityProofs(proofId: String) {
  try {
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
        this.api.removeIdProofsDetails(this.snapShotParam, proofId).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            swalWithBootstrapButtons.fire(
              'Deleted!',
              data.message,
              'success'
            )
            this.getEmployeeIdProofsList();

          }
        })
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your data is safe',
          'error'
        )
      }
    })
  }
  catch (err) {
    console.log(err.message);
  }
}

// Add New Id Proofs Setting Add Identity Proofs Button Functionality
addNewIdProofsSettings(){
  this.idProofsDetailsForm.reset();
  this.idProofsSettingButton = false;
  this.idProofsHeadingButton = "Add Identity Proofs";
  this.idProofsButton = 'Submit';
  this.idProofsForm = true;
}
// New Id Proofs Setting Cancel Button Functionality
idProofsSettingsCancel(){
  this.getEmployeeIdProofsList();
  this.idProofsDetailsForm.reset();
}

//Employee ID's Form add details //
idProofsSettingForm(){
  this.idProofsDetailsForm = this.fb.group({
    identityProofs: new FormGroup({
      identityName:new FormControl('',Validators.required),
      identityNum:new FormControl('',Validators.required),
      authorityName:new FormControl(''),
      issuePlace:new FormControl(''),
      expiryDate:new FormControl('',Validators.required),
      remarks:new FormControl('')
    })
  })
}

validationMessageIdProofsSettings = {
  'identityName': [
    { type: 'required', message: 'Identity Name is Required' },
  ],
  'identityNum': [
    { type: 'required', message: 'Identity Number is Required' },
  ],
  'authorityName': [
    { type: 'required', message: 'Authority Name is Required' },
  ],
  'issuePlace': [
    { type: 'required', message: 'Issue Place is Required' },
  ],
  'expiryDate': [
    { type: 'required', message: 'Expiry Date is Required' },
  ],
  'remarks': [
    { type: 'required', message: 'Remarks is Required' },
  ],
}
/** employee Identity Proofs configratin End*/


bioCancel(){
  this.bioForm=false;
  this.bioList=true;
}
/** bio complete function configratin */

/** langulage skills function configation  start*/
listSkillLanguage(){
  try{
    this.lsnguageSkillForm = false;
    this.api.LanguageSkill(this.snapShotParam).subscribe(data=>{
      if(data.status == 'success' || data.status == 200){
        if(data.data.length === 0){
          this.languageSkillList = false;
          this.addLanguageSkillList();
        }else{
          this.LanguageData = data.data;
          this.languageSkillList= true;
        }
      }
    })
  }catch(err){
    console.log(err);
  }
}

languageSkillEdit(id){
  this.languageSkillEditId = id;
  this.skillLanguageBtn = 'Update';
  this.languageSkillTitle = "Update Language";
  this.lsnguageSkillForm = true;
  this.addLanguageBtn = false;
  for(var i=0;i<this.LanguageData.length;i++){
    if(this.LanguageData[i]._id == id){
      this.languageSkillForm = this.fb.group({
        languageSkills:new FormGroup({
          toSpeak:new FormControl(this.LanguageData[i].toSpeak),
          toRead:new FormControl(this.LanguageData[i].toRead),
          toWrite:new FormControl(this.LanguageData[i].toWrite),
        })
      })
    }
  }
}

cancelLanguageSkill(){
  this.lsnguageSkillForm = false;
  this.addLanguageBtn = true;
}

addLanguageSkill(){
  try {
    let cleanLaungugeSkillForm = this.util.cleanFormLevelOne(this.languageSkillForm);

  if(this.languageSkillEditId == "" || this.languageSkillEditId === null){
    this.api.addLanguageSkill(cleanLaungugeSkillForm.value,this.snapShotParam).subscribe(data=>{
      if (data.status === "success" || data.status === 200) {
        this.successMessage = true;
        this.errorMsg = false;
        this.successMsg = data.message;
        this.addLanguageBtn = true;
        setTimeout(() =>{
          this.listSkillLanguage();
          this.handleErrroMessage();
        },1000)
      } else if (data.status === "error" || data.status === 404) {
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        setTimeout(()=>{
          this.handleErrroMessage();
        },2000);
      }
    })
  }else{
    this.api.updateLanguageSkill(cleanLaungugeSkillForm.value,this.snapShotParam,this.languageSkillEditId).subscribe(data=>{
      if (data.status === "success" || data.status === 200) {
        this.successMessage = true;
        this.errorMsg = false;
        this.successMsg = data.message;
        this.addLanguageBtn = true;
        setTimeout(() =>{
          this.listSkillLanguage();
          this.handleErrroMessage();
        },1000)
      } else if (data.status === "error" || data.status === 404) {
        this.errorMsg = true;
        this.successMessage = false;
        this.errMsg = data.message;
        setTimeout(()=>{
          this.handleErrroMessage();
        },2000);
      }
    })
    }
    this.languageSkillEditId = "";
  } catch(err){
    console.log(err);
  }
}


languageSkillValidation(){
  this.languageSkillForm = this.fb.group({
    languageSkills:new FormGroup({
      toSpeak:new FormControl(''),
      toRead:new FormControl(''),
      toWrite:new FormControl(''),
    })
  })
}

addLanguageSkillList(){
this.languageSkillEditId = "";
this.languageSkillTitle = "Add";
this.skillLanguageBtn = 'Submit';
this.lsnguageSkillForm = true;
this.addLanguageBtn = false;
this.languageSkillForm.reset();
}


/**langualge skills function configration end */

// Error Handling Message
handleErrroMessage(){
  this.successMessage = false;
  this.errorMsg = false;
  this.successMsg = '';
  this.errMsg = '';
}
oncheck(){
  this.checkbox = !this.checkbox;
  this.employeeBasicForm.get('isTL').setValue(this.checkbox);
}

// Get Tl List
getTlList(){
  this.api.getTlList().subscribe((data)=>{
    if(data.status === 'success'){
      this.companyTlList = data.data;
    }
  })
}

uploadedDocumentDetails = [];
employeeDocumentsDetails = [];
// get documnet list uploaded which are no uploaded yet
uploadedDocumentList(){
  try{
    this.api.uploadedDocuments(this.snapShotParam).subscribe((data) =>{
      if(data.status === 'success'){
        this.uploadedDocumentDetails = data.data;
      }
    })
    this.employeeDocumentList();
  }catch(err){
    console.log(err);
  }
}

// Image Upload Form
uploadImageForm(){
  try{
    this.uploadForm = this.fb.group({
      document: ['']
    });
  }catch(err){
    console.log(err);
  }
}

// Upload Docs
uploadDocs(documentTypeId,index,type){
  try{
    if(type === 'Update'){
      if((document.getElementById(`${index}`)as HTMLInputElement).value.length === 0){
        Swal.fire('No Image Selected');
      } else {
        this.api.uploadDocuments(this.uploadForm,documentTypeId,this.snapShotParam,type).subscribe((data)=>{
          if(data.status === 'success'){
            (document.getElementById('dismissUpdateDocuments').click());
            Swal.fire(
              'Status',
              data.message,
              'success'
            )
            this.employeeDocumentList();
          } else if(data.status === 'error'){
              Swal.fire(data.message);
          }
        })
      }
    } else if(type === 'Add'){
      if((document.getElementById(`documnetDocImage${index}`)as HTMLInputElement).value.length === 0){
        Swal.fire('No Image Selected');
      } else {
        this.api.uploadDocuments(this.uploadForm,documentTypeId,this.snapShotParam,type).subscribe((data)=>{
          if(data.status === 'success'){
            Swal.fire(
              'Status',
              data.message,
              'success'
            )
            this.uploadedDocumentList();
            this.employeeDocumentList();
          } else if(data.status === 'error'){
              Swal.fire(data.message);
          }
        })
      }
    }

  }catch(err){
    console.log(err);
  }
}

// When User select document image
onFileSelect(event){
try{
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    this.uploadForm.get('document').setValue(file);
  }
}catch(err){
  console.log(err);
}
}

// Get Uploaded Documnets By the employee
employeeDocumentList(){
  try{
    this.api.employeeDocumentList(this.snapShotParam).subscribe((data)=>{
      if(data.status === 'success'){
        this.employeeDocumentsDetails = data.data;
      }
    })
  }catch(err){
    console.log(err);

  }
}

// Show Image On new tab
openImage(imageUrl){
  try{
    window.open(imageUrl);
  }catch(err){
    console.log(err);
  }
}

// Delete Employee Document
deleteDocument(documentTypeId){
  try{
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
      reverseButtons: true,
      allowOutsideClick: false,
    } as any).then((result) => {
      if (result.value) {
        this.api.deleteEmployeeDocument(documentTypeId,this.snapShotParam).subscribe((data)=>{
          if(data.status === "success" || data.status === 200){
        swalWithBootstrapButtons.fire(
          'Deleted!',
          data.message,
          'success'
        )
        this.employeeDocumentList();
        this.uploadedDocumentList();
          }
      })
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Document Still Exists',
          'error'
        )
      }
    })
  }catch(err){
    console.log(err);
  }
}

// Update the employee docs
documentTypeId: any;
async updateDocuments(documentTypeId){
  try{
    this.documentTypeId = documentTypeId;
  }catch(err){
    console.log(err);
  }
}

}



