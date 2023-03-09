import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PaymentHeadsComponent } from './payment-heads.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListPaymentHeadsComponent } from './list-payment-heads/list-payment-heads.component';
import { AddPaymentHeadsComponent } from './add-payment-heads/add-payment-heads.component';
import { UpdatePaymentHeadsComponent } from './update-payment-heads/update-payment-heads.component';

const route : Routes = [
  {
    path :'',
    component : PaymentHeadsComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-payment-heads',
        component: ListPaymentHeadsComponent,
      },
      {
        path: 'add-payment-heads',
        component: AddPaymentHeadsComponent
      },
      {
        path: 'update-payment-heads/:jobCategoryId',
        component: UpdatePaymentHeadsComponent
      },
      {
        path:'',
        redirectTo :'list-payment-heads',
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
export class PaymentHeadsRoutingModule { }