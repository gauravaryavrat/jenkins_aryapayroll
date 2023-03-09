import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListCalendarComponent } from './list-calendar/list-calendar.component';
import { AddCalendarComponent } from './add-calendar/add-calendar.component';
import { UpdateCalendarComponent } from './update-calendar/update-calendar.component';
import { FullCalendarModule } from '@fullcalendar/angular'; // for FullCalendar!


@NgModule({
  declarations: [
    CalendarComponent,
    ListCalendarComponent,
    AddCalendarComponent,
    UpdateCalendarComponent
  ],
  
  imports: [
    CommonModule,FullCalendarModule,
    CalendarRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CalendarModule { }
