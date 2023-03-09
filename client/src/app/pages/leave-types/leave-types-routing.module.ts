import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LeavetypesComponent } from './leave-types.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListLeaveTypesComponent } from './list-leave-types/list-leave-types.component';
import { AddLeaveTypesComponent } from './add-leave-types/add-leave-types.component';
import { UpdateLeaveTypeComponent } from './update-leave-type/update-leave-type.component';

const route : Routes = [
  {
    path :'',
    component : LeavetypesComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-leave-types',
        component: ListLeaveTypesComponent,
      },
      {
        path: 'add-leave-types',
        component: AddLeaveTypesComponent
      },
      {
        path: 'update-leave-type/:leaveTypeId',
        component: UpdateLeaveTypeComponent
      },
      {
        path:'',
        redirectTo :'list-leave-types',
        pathMatch:'full',
      },
    ],
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class LeavetypesRoutingModule { }