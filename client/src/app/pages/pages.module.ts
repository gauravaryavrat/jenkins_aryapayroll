import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HeaderComponent } from '../themes/header/header.component';
import { SidebarComponent } from '../themes/sidebar/sidebar.component';
import { FooterComponent } from '../themes/footer/footer.component';
import { PagesComponent } from './pages.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { NotifierModule } from 'angular-notifier';



@NgModule({
  declarations: [HeaderComponent,SidebarComponent,FooterComponent,PagesComponent, LeaveManagementComponent, UpdateProfileComponent],
  imports: [
    CommonModule,
    PagesRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NotifierModule,
  ]
})

export class PagesModule { }
