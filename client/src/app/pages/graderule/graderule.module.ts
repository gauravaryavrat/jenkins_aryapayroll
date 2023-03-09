import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraderuleRoutingModule } from './graderule-routing.module';
import { GraderuleComponent } from './graderule.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListGraderuleComponent } from './list-graderule/list-graderule.component';
import { AddGraderuleComponent } from './add-graderule/add-graderule.component';
import { UpdateGraderuleComponent } from './update-graderule/update-graderule.component';
import { ListManagePaymentHeadsComponent } from './managePaymentHeads/list-managePaymentHeads/list-managePaymentHeads.component';
import { AddManagePaymentHeadsComponent } from './managePaymentHeads/add-managePaymentHeads/add-managePaymentHeads.component';
import {UpdateManagePaymentHeadsComponent } from './managePaymentHeads/update-managePaymentHeads/update-managePaymentHeads.component';


@NgModule({
  declarations: [
    GraderuleComponent,
    ListGraderuleComponent,
    AddGraderuleComponent,
    UpdateGraderuleComponent,
    ListManagePaymentHeadsComponent,
    AddManagePaymentHeadsComponent,UpdateManagePaymentHeadsComponent
  ],
  
  imports: [
    CommonModule,
    GraderuleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})

export class GraderuleModule { }
