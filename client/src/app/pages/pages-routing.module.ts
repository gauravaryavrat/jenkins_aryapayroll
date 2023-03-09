import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { PaymentHeadsModule } from './Payment Heads/payment-heads.module';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { AuthGuard } from '../authGuard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate:[AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module')
        .then(m => m.DashboardModule)
      },
      {
        path: 'sub-user',
        loadChildren: () => import('./sub-user/sub-user.module')
        .then(m => m.SubUserModule)
      },
      {
        path: 'company',
        loadChildren: () => import('./company/company.module')
        .then(m => m.CompanyModule),
      },
      {
        path: 'branches',
        loadChildren: () => import('./branches/branches.module')
        .then(m => m.BranchesModule)
      },
      {
        path: 'leave-types',
        loadChildren: () => import('./leave-types/leave-types.module')
        .then(m => m.LeavetypesModule)
      },
      {
        path:'employee-wizard',
        loadChildren:() => import('./employee-wizard/employee-wizard.module')
        .then(m => m.EmployeeWizardModule)
      },
      // {
      //   path:'employee-wizard',
      //   loadChildren:() => import('./employee-wizard/employee-wizard.module')
      //   .then(m => m.EmployeeWizardModule)
      // },
      {
        path:'job-profile',
        loadChildren:() => import('./job-profile/job-profile.module')
        .then(m => m.JobProfileModule)
      },
      {
        path: 'job-category',
        loadChildren: () => import('./job category/job-category.module')
        .then(m => m.JobCategoryModule)
      },
      {
        path: 'document-types',
        loadChildren:() => import('./document-types/document-types.module')
        .then(m=> m.DocumenttypesModule)
      },
      {
        path: 'skill-category',
        loadChildren:() => import('./skill-category/skill-category.module')
        .then(m => m.SkillCategoryModule)
      },
      {
        path: 'holiday',
        loadChildren:() => import('./holiday/holiday.module')
        .then(m => m.HolidayModule)
      },
      {
        path: 'payment-heads',
        loadChildren:()=> import('./Payment Heads/payment-heads.module')
        .then(m=>PaymentHeadsModule)
      },
      {
        path: 'report',
        loadChildren:()=>import('./report/report.module')
        .then(m=>m.ReportModule)
      },
      {
        path: 'payroll',
        loadChildren:()=>import('./payroll/payroll.module')
        .then(m=>m.PayrollModule)
      },
      {
        path: 'calendar',
        loadChildren:()=>import('./calendar/calendar.module')
        .then(m=>m.CalendarModule)
      },
      {
        path: 'department',
        loadChildren:()=>import('./department/department.module')
        .then(m=>m.DepartmentModule)
      },
      {
        path: 'graderule',
        loadChildren: ()=>import('./graderule/graderule.module')
        .then(m=>m.GraderuleModule)
      },
      {
        path: 'leave-management',
        loadChildren: ()=>import('./leave-management/leave-management.module')
        .then(m=>m.LeaveManagementModule)
      },
      {
        path: 'roles',
        loadChildren: ()=>import('./roles/roles.module')
        .then(m=>m.RolesModule)
      },
      {
        path: 'update-profile',
        component: UpdateProfileComponent
      },
      {
        path: '',
        redirectTo: 'company',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'branches',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'leave-types',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'employee-wizard',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'job-profile',
        pathMatch: 'full',
      },
      {
        path:'',
        redirectTo: 'job-category',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'document-types',
        pathMatch:'full'
      },
      {
        path: '',
        redirectTo: 'skill-category',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'holiday',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'payment-heads',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'report',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'payroll',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'calendar',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'department',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'graderule',
        pathMatch: 'full'
      },
      {
        path: '',
        redirectTo: 'leave-management',
        pathMatch: 'full'
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
export class PagesRoutingModule { }
