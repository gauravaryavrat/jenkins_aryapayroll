import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GraderuleComponent } from './graderule.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListGraderuleComponent } from './list-graderule/list-graderule.component';
import { AddGraderuleComponent } from './add-graderule/add-graderule.component';
import { UpdateGraderuleComponent } from './update-graderule/update-graderule.component';
import { ListManagePaymentHeadsComponent } from './managePaymentHeads/list-managePaymentHeads/list-managePaymentHeads.component';
import { AddManagePaymentHeadsComponent } from './managePaymentHeads/add-managePaymentHeads/add-managePaymentHeads.component';
import {UpdateManagePaymentHeadsComponent } from './managePaymentHeads/update-managePaymentHeads/update-managePaymentHeads.component';

const route : Routes = [
  {
    path :'',
    component : GraderuleComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-graderule',
        component: ListGraderuleComponent,
      },
      {
        path: 'list-managePaymentHeads/:gradeRuleId',
        component:  ListManagePaymentHeadsComponent
      },
      {
        path: 'add-managePaymentHeads/:gradeRuleId',
        component: AddManagePaymentHeadsComponent
      },
      {
        path: 'update-managePaymentHeads/:paymentHeadId/:gradeRuleId',
        component: UpdateManagePaymentHeadsComponent
      },
      {
        path: 'add-graderule',
        component: AddGraderuleComponent
      },
      {
        path: 'update-graderule/:gradeRuleId',
        component: UpdateGraderuleComponent
      },
      {
        path:'',
        redirectTo :'list-graderule',
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
export class GraderuleRoutingModule { }