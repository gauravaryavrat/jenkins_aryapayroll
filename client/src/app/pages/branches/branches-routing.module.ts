import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BranchesComponent } from './branches.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { AddBranchesComponent } from './add-branches/add-branches.component';
import { ShowBranchesComponent } from './show-branches/show-branches.component';
import { UpdateBranchDataComponent } from './update-branch-data/update-branch-data.component';
// import { AddDepartmentComponent } from './department/add-department/add-department.component';
import { ShowDepartmentsComponent } from './department/show-departments/show-departments.component';
import { UpdateDepartmentComponent } from './department/update-department/update-department.component';


const routes: Routes = [
  {
    path: '',
    component: BranchesComponent,
    canActivate:[AuthGuard],
    children: [
      {
        path:'add-branch',
        component:AddBranchesComponent,
      },
      {
        path:'show-branches',
        component:ShowBranchesComponent,
      },
      {
        path:'update-branch-data/:branchId',
        component:UpdateBranchDataComponent,
      },
      // {
      //   path:'add-department/:branchId',
      //   component:AddDepartmentComponent,
      // },
      {
        path:'show-departments/:branchId',
        component:ShowDepartmentsComponent,
      },
      {
        path:'update-department/:branchId/:departmentId',
        component:UpdateDepartmentComponent,
      },
      {
        path:'',
        redirectTo :'show-branches',
        pathMatch:'full',
      },
    ],
  },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class BranchesRoutingModule { }