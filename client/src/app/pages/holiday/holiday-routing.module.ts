import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HolidayComponent } from './holiday.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListHolidayComponent } from './list-holiday/list-holiday.component';
import { AddHolidayComponent } from './add-holiday/add-holiday.component';
import { UpdateHolidayComponent } from './update-holiday/update-holiday.component';

const route : Routes = [
  {
    path :'',
    component : HolidayComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-holiday',
        component: ListHolidayComponent,
      },
      {
        path: 'add-holiday',
        component: AddHolidayComponent
      },
      {
        path: 'update-holiday/:holidayId',
        component: UpdateHolidayComponent
      },
      {
        path:'',
        redirectTo :'list-holiday',
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
export class HolidayRoutingModule { }