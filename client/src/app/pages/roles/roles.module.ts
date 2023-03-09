import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddRoleComponent } from './role/add-role/add-role.component';
import { UpdateRoleComponent } from './role/update-role/update-role.component';
import { UpdatePermissionComponent } from './permission/update-permission/update-permission.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';
import { RolesService } from './roles-service/roles.service';
import { ListRoleComponent } from './role/list-role/list-role.component';
import { ListPermissionComponent } from './permission/list-permission/list-permission.component';




@NgModule({
  declarations: [AddRoleComponent, UpdateRoleComponent, UpdatePermissionComponent, RolesComponent, ListRoleComponent, ListPermissionComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    RolesRoutingModule,
  ],
  providers: [RolesService],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class RolesModule { }
