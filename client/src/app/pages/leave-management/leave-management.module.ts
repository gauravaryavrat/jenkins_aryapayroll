import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddEarnedLeaveComponent } from './manage-earned-leave/add-earned-leave/add-earned-leave.component';
import { RouterModule } from '@angular/router';
import { LeaveManagementRoutingModule } from './leave-management-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ListEarnedLeaveComponent } from './manage-earned-leave/list-earned-leave/list-earned-leave.component';
import { UpdateEarnedLeaveComponent } from './manage-earned-leave/update-earned-leave/update-earned-leave.component';
import { ListLeaveComponent } from './manage-leave-status/list-leave/list-leave.component';
import { MarkAbsentComponent } from './manage-leave-status/mark-absent/mark-absent.component';

@NgModule({
  declarations: [ AddEarnedLeaveComponent, ListEarnedLeaveComponent, UpdateEarnedLeaveComponent, ListLeaveComponent, MarkAbsentComponent],
  imports: [
    CommonModule,
    RouterModule,
    LeaveManagementRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule
  ]
})
export class LeaveManagementModule { }
