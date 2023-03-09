import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeeWizardComponent } from './employee-wizard.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeWizardRouitngModule } from './employee-wizard-routing.module';
import { EmployeeService } from './services/employee.service';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { EmployeeListComponent } from './employee-list/employee-list.component';



@NgModule({
    declarations: [EmployeeWizardComponent, EmployeeProfileComponent, EmployeeListComponent],
    imports: [
      CommonModule,
      RouterModule,
      EmployeeWizardRouitngModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule
    ],
    providers:[EmployeeService,AuthGuard],
  })
  
  export class EmployeeWizardModule { }