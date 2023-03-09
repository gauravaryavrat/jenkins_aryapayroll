import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';

const route : Routes = [
    {
        path:'',
        component:DashboardComponent,
        canActivate:[AuthGuard],
        children:[
            {
              path:'company-list',
              component:CompanyListComponent,
            },
            {
              path: '',
              redirectTo:'company-list',
              pathMatch:'full',
            },
        ]
    }

];

@NgModule({
    declarations: [],
    imports: [
      CommonModule,
      RouterModule.forChild(route)
    ]
  })
  export class DashboardRoutingModule { }
  