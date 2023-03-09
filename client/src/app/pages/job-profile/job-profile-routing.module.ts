import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { JobProfileComponent } from './job-profile.component';
import { AddJobProfileComponent } from './add-job-profile/add-job-profile.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { JobProfileListComponent } from './job-profile-list/job-profile-list.component';
import { UpdateProfileDataComponent } from './update-profile-data/update-profile-data.component';

const route:Routes =[
  {
    path:'',
    component:JobProfileComponent,
    canActivate:[AuthGuard],
    children:[
      {
        path:'add-job-profile',
        component:AddJobProfileComponent,
      },
      {
        path:'job-profile-list',
        component:JobProfileListComponent,
      },
      {
        path:'update-profile-data/:jobProfileId',
        component:UpdateProfileDataComponent,
      },
      {
        path:'',
        redirectTo :'job-profile-list',
        pathMatch:'full',
      },
    ],
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class JobProfileRoutingModule { }
