import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { RolesService } from '../../roles-service/roles.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-update-role',
  templateUrl: './update-role.component.html',
  styleUrls: ['./update-role.component.scss']
})
export class UpdateRoleComponent implements OnInit {
  updateRoleForm: any;
  errorFlag = false;
  successFlag = false;
  errMsg = '';
  successMsg = '';
  roleId: any;

  constructor(
    private FormBuilder: FormBuilder,
    private updateRoleAPI: RolesService,
    private ActivatedRoute: ActivatedRoute,
    private Route: Router
  ) { }

  ngOnInit() {
    this.roleId = this.ActivatedRoute.snapshot.paramMap.get('roleId')
    this.updateRoleFormStruct();
    this.updateRoleFormExist();
  }

  updateRoleFormStruct(){
    try {
      this.updateRoleForm = this.FormBuilder.group({
        title: new FormControl('',Validators.required),
        description: new FormControl('')
      })
    } catch (error) {
      console.log(error);
    }
  }

  updateRoleFormExist(){
    try {
      this.updateRoleAPI.listIndividualRole(this.roleId).subscribe((data)=>{
        if(data.status === 'success'){
          this.updateRoleForm = this.FormBuilder.group({
            title: new FormControl(data.data.title, Validators.required),
            description: new FormControl(data.data.description)
          })
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  updateRoleValidationMessage = {
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

  updateRole(){
    try {
      this.updateRoleForm.get('title').setValue(this.updateRoleForm.get('title').value.trim());
      if(this.updateRoleForm.get('description').value === null){
      this.updateRoleForm.get('description').setValue('');
    } else {
      this.updateRoleForm.get('description').setValue(this.updateRoleForm.get('description').value.trim());
    }

    // update  Role
    this.updateRoleAPI.updateRole(this.updateRoleForm.value,this.roleId).subscribe((data)=>{
      if(data.status === 'success'){
        this.successFlag = true;
        this.successMsg = data.message;
        this.errorFlag = false;

        setTimeout(() => {
          this.handleErrorMessage();
          this.Route.navigateByUrl('/pages/roles/list-role');
        }, 2000);

      } else if(data.status === 'error'){
        this.errorFlag = true;
        this.successFlag = false;
        this.errMsg = data.message
      }
    })
    } catch (error) {
      console.log(error);
    }
  }
}
