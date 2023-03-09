import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchesRoutingModule } from './branches-routing.module';
import { RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { BranchesComponent } from './branches.component';
import { AddBranchesComponent } from './add-branches/add-branches.component';
import { ShowBranchesComponent } from './show-branches/show-branches.component';
import { BranchService } from './branch-service/branch.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpdateBranchDataComponent } from './update-branch-data/update-branch-data.component';
import { AddDepartmentComponent } from './department/add-department/add-department.component';
import { ShowDepartmentsComponent } from './department/show-departments/show-departments.component';
import { UpdateDepartmentComponent } from './department/update-department/update-department.component';

@NgModule({
  declarations: [BranchesComponent, AddBranchesComponent, ShowBranchesComponent, UpdateBranchDataComponent, AddDepartmentComponent, ShowDepartmentsComponent, UpdateDepartmentComponent],
  imports: [
    CommonModule,
    BranchesRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  providers:[AuthGuard,BranchService]
})
export class BranchesModule { }
