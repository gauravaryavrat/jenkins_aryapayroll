import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { LeaveManagementComponent } from './leave-management.component';
import { AddEarnedLeaveComponent } from './manage-earned-leave/add-earned-leave/add-earned-leave.component';
import { ListEarnedLeaveComponent } from './manage-earned-leave/list-earned-leave/list-earned-leave.component';
import { UpdateEarnedLeaveComponent } from './manage-earned-leave/update-earned-leave/update-earned-leave.component';
import { ListLeaveComponent } from './manage-leave-status/list-leave/list-leave.component';
import { MarkAbsentComponent } from './manage-leave-status/mark-absent/mark-absent.component';

const route : Routes = [
  {
    path :'',
    component : LeaveManagementComponent,
    canActivate:[AuthGuard],
    children :[
      {
       path: 'list-earned-leave',
      component: ListEarnedLeaveComponent,
      },
      {
        path: 'add-earned-leave',
       component: AddEarnedLeaveComponent,
       },
       {
        path: 'update-earned-leave/:earnedLeaveId/:employeeId',
       component: UpdateEarnedLeaveComponent,
       },
       {
        path: 'list-leave',
       component: ListLeaveComponent,
       },
       {
        path: 'mark-absent',
       component: MarkAbsentComponent,
       },
      {
        path:'',
        redirectTo :'list-earned-leave',
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
export class LeaveManagementRoutingModule { }
