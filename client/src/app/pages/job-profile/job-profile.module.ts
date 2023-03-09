import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobProfileRoutingModule } from './job-profile-routing.module';
import { JobProfileComponent } from './job-profile.component';
import { AddJobProfileComponent } from './add-job-profile/add-job-profile.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobProfileListComponent } from './job-profile-list/job-profile-list.component';
import { UpdateProfileDataComponent } from './update-profile-data/update-profile-data.component';
import { JobProfileService } from './job-profile-services/job-profile.service';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [JobProfileComponent, AddJobProfileComponent, JobProfileListComponent, UpdateProfileDataComponent],
  imports: [
    CommonModule,
    JobProfileRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [JobProfileService, AuthGuard],
})

export class JobProfileModule { }
