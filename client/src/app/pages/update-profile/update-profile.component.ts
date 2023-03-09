import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { environment } from '../../../environments/environment';
import { enableRipple } from '@syncfusion/ej2-base';
enableRipple(true);
/**
 * MultiSelect Checkbox Samples
 */
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';
import { UtilitiesService } from 'src/app/utilities/utilities.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit {
url = '../../../assets/image/profile-image.png';
discardChanges = false;
genderList = ['Male','Female','Other','N/A'];
updateProfileForm: any;
cardProfileName = '';
existingUrl= '../../../assets/image/profile-image.png';
timeZone: any;
multiObj: MultiSelect;
defaultTimeZone: any;
userAvatar: any;

  constructor(public fb: FormBuilder, private APIService: ApiService, private util: UtilitiesService, private router: Router) { }

  ngOnInit() {
    this.existUpadteProfileForm();
    this.loadUpadteProfileForm();
    this.userProfileForm();
    this.APIService.getTimeZone().subscribe((data)=>{
      if(data.status === 'success'){
        this.timeZone = data.data;
        MultiSelect.Inject(CheckBoxSelection);
        // initialize the MultiSelect component
        this.multiObj = new MultiSelect({
          // set the country data to dataSource property
          dataSource: this.timeZone,
          // map the appropriate columns to fields property
          fields: { text: 'Name', value: 'Code' },
          // set the type of mode for checkbox to visualized the checkbox added in li element.
          mode: 'CheckBox',
          // set the placeholder to MultiSelect input element
          placeholder: 'Select TimeZone',
          // set maximum selection length in Multiselect.
          maximumSelectionLength: 1,
          // set true for enable the dropdown icon.
          showDropDownIcon: true,
          // set the placeholder to MultiSelect filter input element
          filterBarPlaceholder: 'Search TimeZone',
          // set the MultiSelect popup height
          popupHeight: '350px',

        });
        this.multiObj.appendTo('#checkbox');
        this.multiObj.value = [this.util.timeZone];
      }
    })

  }

  // Load Default Form
  loadUpadteProfileForm(){
    try {
      this.updateProfileForm = this.fb.group({
        name: new FormControl(''),
        gender: new FormControl(''),
        phone: new FormControl('',Validators.compose([
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
        ])),
        birthday: new FormControl('')
      })
    } catch (error) {
      console.log(error);
    }
  }

  // Fill value With Exists value
  existUpadteProfileForm(){
    try {
      // Get User Details
      this.APIService.getUserDetails().subscribe((data)=>{
        if(data.status === 'success'){
          this.cardProfileName = data.data.name;
          this.util.timeZone = data.data.timeZone;
          if(data.data.avatar !== `${environment.apiBaseUrl}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`){
            this.url = data.data.avatar;
            this.existingUrl = data.data.avatar;
          }
          this.updateProfileForm = this.fb.group({
            name: new FormControl(data.data.name),
            gender: new FormControl(data.data.gender),
            phone: new FormControl(data.data.phone,Validators.compose([
              Validators.minLength(10),
              Validators.maxLength(15),
              Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')
            ])),
            birthday: new FormControl(data.data.birthday.substring(0,10))
          })
        }
      })

    } catch (error) {
      console.log(error);
    }
  }

  validationMessage = {
    'phone': [
      { type: 'minlength', message: 'Number too short' },
      { type: 'maxlength', message: 'Number is too large' },
      { type: 'pattern', message: 'Company Number not valid' }],
  }


  onSelectFile(event) {

    if (event.target.files && event.target.files[0]) {
      this.discardChanges = true;
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        this.userAvatar.get('avatar').setValue(file);
      }
    }
  }

  // Discard Image Value
  discardFunctionality(){
    try {
     this.url = this.existingUrl;
     this.discardChanges = false;
     this.userAvatar.get('avatar').setValue(['']);
     (document.getElementById('profilePicture')as HTMLInputElement).value = '';
    } catch (error) {
      console.log(error);
    }
  }

  // Change Profile Name
  changeName(){
    try {
      this.cardProfileName = (document.getElementById('profileName') as HTMLInputElement).value;
    } catch (error) {
      console.log(error);
    }
  }

  // Submit form
  updateProfileData(){
    try {
      let cleanUpdateProfileForm = this.util.cleanFormLevelOne(this.updateProfileForm);
      this.APIService.updateUSerProfile(cleanUpdateProfileForm.value,this.multiObj.value[0]).subscribe((data)=>{
        if(data.status === 'success'){
          if((document.getElementById('profilePicture')as HTMLInputElement).value.length > 0){
            this.APIService.uploadProfileImage(this.userAvatar,"User",undefined).subscribe((updateProfile)=>{
              if(updateProfile.status === 'success'){

                const swalWithBootstrapButtons = Swal.mixin({
                  customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                  },
                  buttonsStyling: false
                })
                swalWithBootstrapButtons.fire({
                  title: 'Status',
                  text: data.message,
                  type: 'success',
                  showCancelButton: false,
                  confirmButtonText: 'Ok',
                  reverseButtons: true,
                  allowOutsideClick: false
                } as any).then((result) => {
                  if (result.value) {
                    window.location.reload();
                  }
                })
              }
            })
          } else {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: false
            })
            swalWithBootstrapButtons.fire({
              title: 'Status',
              text: data.message,
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Ok',
              reverseButtons: true,
              allowOutsideClick: false
            }as any).then((result) => {
              if (result.value) {
                window.location.reload();
              }
            })
          }
        } else if(data.status === 'error'){
          console.log(data.message);
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  // Profile Image Form
  userProfileForm(){
    try {
      this.userAvatar = this.fb.group({
        avatar: ['']
      })
    } catch (error) {
      console.log(error);
    }
  }

}
