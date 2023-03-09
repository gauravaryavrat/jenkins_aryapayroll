import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListReportComponent } from './list-report/list-report.component';
import { AddReportComponent } from './add-report/add-report.component';
import { UpdateReportComponent } from './update-report/update-report.component';

const route : Routes = [
  {
    path :'',
    component : ReportComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-report',
        component: ListReportComponent,
      },
      {
        path: 'add-report',
        component: AddReportComponent
      },
      {
        path: 'update-report/:jobCategoryId',
        component: UpdateReportComponent
      },
      {
        path:'',
        redirectTo :'list-report',
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
export class ReportRoutingModule { }