import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HolidayRoutingModule } from './holiday-routing.module';
import { HolidayComponent } from './holiday.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListHolidayComponent } from './list-holiday/list-holiday.component';
import { AddHolidayComponent } from './add-holiday/add-holiday.component';
import { UpdateHolidayComponent } from './update-holiday/update-holiday.component';


@NgModule({
  declarations: [
     HolidayComponent,
     ListHolidayComponent,
     AddHolidayComponent,
     UpdateHolidayComponent
    ],
  
  imports: [
    CommonModule,
    HolidayRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})
export class HolidayModule { }
