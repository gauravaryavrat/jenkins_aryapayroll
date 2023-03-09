import { Component, OnInit } from '@angular/core';
import { enableRipple } from '@syncfusion/ej2-base';
enableRipple(true);
/**
 * MultiSelect Checkbox Samples
 */
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';
import { ActivatedRoute, Router } from '@angular/router';
import { RolesService } from '../../roles-service/roles.service';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-update-permission',
  templateUrl: './update-permission.component.html',
  styleUrls: ['./update-permission.component.scss']
})
export class UpdatePermissionComponent implements OnInit {
  errorFlag = false;
  successFlag = false;
  errMsg = '';
  successMsg = '';
  createMultiObj: MultiSelect;
  editMultiObj: MultiSelect;
  deleteMultiObj: MultiSelect;
  updateRoleForm: any;
  roleId: any;
  roleTitle: any;
  updatePermissionForm: any;

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private updatePermissionAPI: RolesService,
    private FormBuilder: FormBuilder,
    private Router: Router
  ) { }

  ngOnInit() {
    this.roleId = this.ActivatedRoute.snapshot.paramMap.get('roleId');
    this.updatePermissionAPI.listIndividualPermissions(this.roleId).subscribe((data)=>{
      this.roleTitle = data.data.title;
      if(data.status === 'success'){
        this.updatePermissionAPI.getRolesListData().subscribe((permissionList)=>{
          MultiSelect.Inject(CheckBoxSelection);
          // initialize the MultiSelect component
          this.createMultiObj = new MultiSelect({
            // set the country data to dataSource property
            dataSource: permissionList.data.create,
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
          this.createMultiObj.value = data.data.create;

          MultiSelect.Inject(CheckBoxSelection);
          // initialize the MultiSelect component
          this.editMultiObj = new MultiSelect({
            // set the country data to dataSource property
            dataSource: permissionList.data.edit,
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
          this.editMultiObj.value = data.data.edit;

          MultiSelect.Inject(CheckBoxSelection);
          // initialize the MultiSelect component
          this.deleteMultiObj = new MultiSelect({
            // set the country data to dataSource property
            dataSource: permissionList.data.delete,
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
          this.deleteMultiObj.value = data.data.delete;
        })
      }
    })

    this.updatePermissionForm = this.FormBuilder.group({
      permission: this.FormBuilder.group({
        create: [],
        edit: [],
        delete: []
      })
    })
  }
  submitPermissions(){
    try {

      if(this.createMultiObj.value.length === 0 && this.editMultiObj.value.length === 0 && this.deleteMultiObj.value.length === 0){
        this.updatePermissionForm.removeControl('permission');
      } else {
        if(this.createMultiObj.value.length > 0){
          this.updatePermissionForm.get('permission.create').setValue(this.createMultiObj.value);
        } else {
          this.updatePermissionForm.get('permission').removeControl('create');
        }
        if(this.editMultiObj.value.length > 0){
          this.updatePermissionForm.get('permission.edit').setValue(this.editMultiObj.value);
        } else {
          this.updatePermissionForm.get('permission').removeControl('edit');
        }
        if(this.deleteMultiObj.value.length > 0){
          this.updatePermissionForm.get('permission.delete').setValue(this.deleteMultiObj.value);
        } else {
          this.updatePermissionForm.get('permission').removeControl('delete');
        }
      }

      this.updatePermissionAPI.updateRolePermissions(this.updatePermissionForm.value,this.roleId).subscribe((data)=>{
        if(data.status === 'success'){
          this.successFlag = true;
          this.successMsg = data.message;
          this.errorFlag = false;

          setTimeout(() => {
            this.handleErrorMessage();
            this.Router.navigateByUrl(`/pages/roles/list-permission/${this.roleId}`);
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
      console.log(error)
    }
  }


  handleErrorMessage() {
    this.successFlag = false;
    this.errorFlag = false;
    this.errMsg = '';
    this.successMsg = '';
  }
}
