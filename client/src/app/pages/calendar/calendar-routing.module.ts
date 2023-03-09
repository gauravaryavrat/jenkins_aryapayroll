import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListCalendarComponent } from './list-calendar/list-calendar.component';
import { AddCalendarComponent } from './add-calendar/add-calendar.component';
import { UpdateCalendarComponent } from './update-calendar/update-calendar.component';

const route : Routes = [
  {
    path :'',
    component : CalendarComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-calendar',
        component: ListCalendarComponent,
      },
      {
        path: 'add-calendar',
        component: AddCalendarComponent
      },
      {
        path: 'update-calendar/:jobCategoryId',
        component: UpdateCalendarComponent
      },
      {
        path:'',
        redirectTo :'list-calendar',
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
export class CalendarRoutingModule { }