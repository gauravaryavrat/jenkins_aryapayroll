import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentHeadsRoutingModule } from './payment-heads-routing.module';
import { PaymentHeadsComponent } from './payment-heads.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListPaymentHeadsComponent } from './list-payment-heads/list-payment-heads.component';
import { AddPaymentHeadsComponent } from './add-payment-heads/add-payment-heads.component';
import { UpdatePaymentHeadsComponent } from './update-payment-heads/update-payment-heads.component';

@NgModule({
  declarations: [
    PaymentHeadsComponent,
    ListPaymentHeadsComponent,
    AddPaymentHeadsComponent,
    UpdatePaymentHeadsComponent
  ],
  
  imports: [
    CommonModule,
    PaymentHeadsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})
export class PaymentHeadsModule { }
