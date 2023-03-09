import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollRoutingModule } from './payroll-routing.module';
import { PayrollComponent } from './payroll.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListPayrollComponent } from './list-payroll/list-report.component';
import { AddPayrollComponent } from './add-payroll/add-payroll.component';
import { UpdatePayrollComponent } from './update-payroll/update-report.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { PayrollSheetComponent } from './payroll-sheet/payroll-sheet.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

const customNotifierOptions: NotifierOptions = {
  position: {
    horizontal: {
      position: 'right',
      distance: 12
    },
    vertical: {
      position: 'top',
      distance: 12,
      gap: 10
    }
  },
  theme: 'material',
  behaviour: {
    autoHide: 3000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};

@NgModule({
  declarations: [
    PayrollComponent,
    ListPayrollComponent,
    AddPayrollComponent,
    UpdatePayrollComponent,
    PayrollSheetComponent
  ],

  imports: [
    CommonModule,
    PayrollRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxSpinnerModule,
    NotifierModule.withConfig(customNotifierOptions),
    BsDatepickerModule.forRoot(),

  ]
})

export class PayrollModule { }
