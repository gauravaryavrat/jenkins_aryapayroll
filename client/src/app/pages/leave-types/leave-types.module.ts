import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeavetypesRoutingModule } from './leave-types-routing.module';
import { LeavetypesComponent } from './leave-types.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListLeaveTypesComponent } from './list-leave-types/list-leave-types.component';
import { AddLeaveTypesComponent } from './add-leave-types/add-leave-types.component';
import { UpdateLeaveTypeComponent } from './update-leave-type/update-leave-type.component';

@NgModule({
  declarations: [
     LeavetypesComponent,
     ListLeaveTypesComponent,
     AddLeaveTypesComponent,
     UpdateLeaveTypeComponent
    ],
  
  imports: [
    CommonModule,
    LeavetypesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})
export class LeavetypesModule { }
