import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { RolesComponent } from './roles.component';
import { AddRoleComponent } from './role/add-role/add-role.component';
import { UpdateRoleComponent } from './role/update-role/update-role.component';
import { UpdatePermissionComponent } from './permission/update-permission/update-permission.component';
import { ListRoleComponent } from './role/list-role/list-role.component';
import { ListPermissionComponent } from './permission/list-permission/list-permission.component';

const route: Routes = [
{
    path :'',
    component : RolesComponent,
    canActivate:[AuthGuard],
    children : [
      {
        path: 'add-role',
        component: AddRoleComponent,
      },
      {
        path: 'update-role/:roleId',
        component: UpdateRoleComponent,
      },
      {
        path: 'update-permission/:roleId',
        component: UpdatePermissionComponent,
      },
      {
        path: 'list-role',
        component: ListRoleComponent,
      },
      {
        path: 'list-permission/:roleId',
        component: ListPermissionComponent,
      },
      {
        path:'',
        redirectTo:'list-role',
        pathMatch:'full'
      }
    ]
}
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class RolesRoutingModule { }
