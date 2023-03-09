import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { EmployeeWizardComponent } from './employee-wizard.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';

const route : Routes = [
    {
      path :'',
      component : EmployeeWizardComponent,
      canActivate:[AuthGuard],
      children :[
        {
          path:'employee-profile',
          component:EmployeeProfileComponent,
        },
        {
          path:'employee-profile/:employeeId',
          component:EmployeeProfileComponent,
        },
        {
          path:'employee-list',
          component:EmployeeListComponent,
        },
        {
          path:'',
          redirectTo:'employee-list',
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

  export class EmployeeWizardRouitngModule{}