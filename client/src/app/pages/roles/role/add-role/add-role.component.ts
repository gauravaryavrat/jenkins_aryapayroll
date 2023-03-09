import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../roles-service/roles.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { enableRipple } from '@syncfusion/ej2-base';
enableRipple(true);
/**
 * MultiSelect Checkbox Samples
 */
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';
import { Router } from '@angular/router';
@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit {
  addRoleForm: any;
  createMultiObj: MultiSelect;
  editMultiObj: MultiSelect;
  deleteMultiObj: MultiSelect;
  errorFlag = false;
  successFlag = false;
  errMsg = '';
  successMsg = '';

  constructor(
    private rolesApi: RolesService,
    public formBuilder: FormBuilder,
    private Router: Router
  ) { }

  ngOnInit() {
    this.addRoleFormData();
    this.rolesApi.getRolesListData().subscribe((data)=>{
      if(data.status === 'success'){

        MultiSelect.Inject(CheckBoxSelection);
        // initialize the MultiSelect component
        this.createMultiObj = new MultiSelect({
          // set the country data to dataSource property
          dataSource: data.data.create,
          // map the appropriate columns to fields property
          fields: { text: 'Name', value: 'Name' },
          // set the type of mode for checkbox to visualized the checkbox added in li element.
          mode: 'CheckBox',
          // set the placeholder to MultiSelect input element
          placeholder: 'Select Create Permission',
          // set maximum selection length in Multiselect.
          // maximumSelectionLength: 1,
          // set true for enable the dropdown icon.
          showDropDownIcon: true,
          // set the placeholder to MultiSelect filter input element
          filterBarPlaceholder: 'Search Create Permission',
          // set the MultiSelect popup height
          popupHeight: '350px',
        });
        this.createMultiObj.appendTo('#createCheckbox');

        MultiSelect.Inject(CheckBoxSelection);
        // initialize the MultiSelect component
        this.editMultiObj = new MultiSelect({
          // set the country data to dataSource property
          dataSource: data.data.edit,
          // map the appropriate columns to fields property
          fields: { text: 'Name', value: 'Name' },
          // set the type of mode for checkbox to visualized the checkbox added in li element.
          mode: 'CheckBox',
          // set the placeholder to MultiSelect input element
          placeholder: 'Select Edit Permission',
          // set maximum selection length in Multiselect.
          // maximumSelectionLength: 1,
          // set true for enable the dropdown icon.
          showDropDownIcon: true,
          // set the placeholder to MultiSelect filter input element
          filterBarPlaceholder: 'Search Edit Permission',
          // set the MultiSelect popup height
          popupHeight: '350px',
        });
        this.editMultiObj.appendTo('#editCheckbox');

        MultiSelect.Inject(CheckBoxSelection);
        // initialize the MultiSelect component
        this.deleteMultiObj = new MultiSelect({
          // set the country data to dataSource property
          dataSource: data.data.delete,
          // map the appropriate columns to fields property
          fields: { text: 'Name', value: 'Name' },
          // set the type of mode for checkbox to visualized the checkbox added in li element.
          mode: 'CheckBox',
          // set the placeholder to MultiSelect input element
          placeholder: 'Select Delete Permission',
          // set maximum selection length in Multiselect.
          // maximumSelectionLength: 1,
          // set true for enable the dropdown icon.
          showDropDownIcon: true,
          // set the placeholder to MultiSelect filter input element
          filterBarPlaceholder: 'Search Delete Permission',
          // set the MultiSelect popup height
          popupHeight: '350px',
        });
        this.deleteMultiObj.appendTo('#deleteCheckbox');
      }
    })
  }

  addRoleFormData(){
    try {
      this.addRoleForm = this.formBuilder.group({
        title: new FormControl('',Validators.required),
        description: new FormControl(''),
        permission: this.formBuilder.group({
          create: [],
          edit: [],
          delete: []
        })
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  // Submit roles
  submitRoles(){
    try {

      if(this.createMultiObj.value === null && this.editMultiObj.value === null && this.deleteMultiObj.value === null){
        this.addRoleForm.removeControl('permission');
      } else {
        if(this.createMultiObj.value !== null){
          this.addRoleForm.get('permission.create').setValue(this.createMultiObj.value);
        } else {
          this.addRoleForm.get('permission').removeControl('create');
        }
        if(this.editMultiObj.value !== null){
          this.addRoleForm.get('permission.edit').setValue(this.editMultiObj.value);
        } else {
          this.addRoleForm.get('permission').removeControl('edit');
        }
        if(this.deleteMultiObj.value !== null){
          this.addRoleForm.get('permission.delete').setValue(this.deleteMultiObj.value);
        } else {
          this.addRoleForm.get('permission').removeControl('delete');
        }
      }

      this.addRoleForm.get('title').setValue(this.addRoleForm.get('title').value.trim());
      if(this.addRoleForm.get('description').value === null){
        this.addRoleForm.get('description').setValue('');
      } else {
      this.addRoleForm.get('description').setValue(this.addRoleForm.get('description').value.trim());
      }

      // Requset to server
      this.rolesApi.addRole(this.addRoleForm.value).subscribe((data)=>{
        if(data.status === 'success'){
          this.successFlag = true;
          this.successMsg = data.message;
          this.errorFlag = false;

          setTimeout(() => {
            this.handleErrorMessage();
            this.Router.navigateByUrl('/pages/roles/list-role');
          }, 1000);

        } else if(data.status = 'error'){
          this.errorFlag = true;
          this.errMsg = data.message;
          this.successFlag = false;

          setTimeout(() => {
            this.handleErrorMessage();
          }, 2000);

        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  addRoleValidationMessage = {
    'title': [
      {type: 'required', message: 'Title is required'}
    ]
  }

  handleErrorMessage() {
    this.successFlag = false;
    this.errorFlag = false;
    this.errMsg = '';
    this.successMsg = '';
  }
}
