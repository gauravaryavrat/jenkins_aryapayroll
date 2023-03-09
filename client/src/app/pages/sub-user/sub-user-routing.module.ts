import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SubUserComponent } from './sub-user.component';
import { AddSubusersComponent } from './add-subusers/add-subusers.component';
import { ShowSubusersListComponent } from './show-subusers-list/show-subusers-list.component';
import { UpdateSubusersDataComponent } from './update-subusers-data/update-subusers-data.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';

const route : Routes = [
    {
      path :'',
      component : SubUserComponent,
      canActivate:[AuthGuard],
      children :[
        {
         path: 'add-subuser',
        component: AddSubusersComponent,
        },
        {
          path: 'show-subusers-list',
          component:ShowSubusersListComponent,
        },
        {
          path: 'update-subuser-data/:subUserId',
          component:UpdateSubusersDataComponent,
        },
        {
          path:'',
          redirectTo :'show-subusers-list',
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

  export class SubUserRoutingModule{}