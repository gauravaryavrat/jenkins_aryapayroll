import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentComponent } from './department.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListDepartmentComponent } from './list-department/list-department.component';
import { AddDepartmentComponent } from './add-department/add-department.component';
import { UpdateDepartmentComponent } from './update-department/update-department.component';

const route : Routes = [
  {
    path :'',
    component : DepartmentComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-department',
        component: ListDepartmentComponent,
      },
      {
        path: 'add-department',
        component: AddDepartmentComponent
      },
      {
        path: 'update-department/:id/:userId',
        component: UpdateDepartmentComponent
      },
      {
        path:'',
        redirectTo :'list-department',
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
export class DepartmentRoutingModule { }