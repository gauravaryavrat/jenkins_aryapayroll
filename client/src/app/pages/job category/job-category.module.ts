import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobCategoryRoutingModule } from './job-category-routing.module';
import { JobCategoryComponent } from './job-category.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListJobCategoryComponent } from './list-job-category/list-job-category.component';
import { AddJobCategoryComponent } from './add-job-category/add-job-category.component';
import { UpdateJobCategoryComponent } from './update-job-category/update-job-category.component';

@NgModule({
  declarations: [
    JobCategoryComponent,
    ListJobCategoryComponent,
    AddJobCategoryComponent,
    UpdateJobCategoryComponent
  ],
  
  imports: [
    CommonModule,
    JobCategoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})
export class JobCategoryModule { }
