import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { JobCategoryComponent } from './job-category.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListJobCategoryComponent } from './list-job-category/list-job-category.component';
import { AddJobCategoryComponent } from './add-job-category/add-job-category.component';
import { UpdateJobCategoryComponent } from './update-job-category/update-job-category.component';

const route : Routes = [
  {
    path :'',
    component : JobCategoryComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-job-category',
        component: ListJobCategoryComponent,
      },
      {
        path: 'add-job-category',
        component: AddJobCategoryComponent
      },
      {
        path: 'update-job-category/:jobCategoryId',
        component: UpdateJobCategoryComponent
      },
      {
        path:'',
        redirectTo :'list-job-category',
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
export class JobCategoryRoutingModule { }