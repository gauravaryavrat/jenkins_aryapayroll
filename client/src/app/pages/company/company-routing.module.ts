import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CompanyComponent } from './company.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { AddCompanyComponent } from './add-company/add-company.component';
import { UpdateCompanyListComponent } from './update-company-list/update-company-list.component';
import { CompanyReportComponent } from './company-report/company-report.component';

const route : Routes = [
  {
    path :'',
    component : CompanyComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'add-company',
        component: AddCompanyComponent,
      },
      {
        path: 'update-company-list/:companyId',
        component:UpdateCompanyListComponent,
      },
      {
        path: 'company-report',
        component: CompanyReportComponent,
      },
      {
        path:'',
        redirectTo :'company-list',
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
export class CompanyRoutingModule { }
