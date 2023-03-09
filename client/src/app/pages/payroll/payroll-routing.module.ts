import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PayrollComponent } from './payroll.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListPayrollComponent } from './list-payroll/list-report.component';
import { AddPayrollComponent } from './add-payroll/add-payroll.component';
import { UpdatePayrollComponent } from './update-payroll/update-report.component';
import { PayrollSheetComponent } from './payroll-sheet/payroll-sheet.component';


const route : Routes = [
  {
    path :'',
    component : PayrollComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-payroll',
        component: ListPayrollComponent,
      },
      {
        path: 'add-payroll',
        component: AddPayrollComponent
      },
      {
        path: 'update-payroll/:employeeId/:month/:year',
        component: UpdatePayrollComponent
      },
      {
        path: 'payroll-sheet',
        component: PayrollSheetComponent
      },
      {
        path:'',
        redirectTo :'list-payroll',
        pathMatch:'full',
      },
    ],
  }
];

@NgModule({
  exports: [RouterModule],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class PayrollRoutingModule { }