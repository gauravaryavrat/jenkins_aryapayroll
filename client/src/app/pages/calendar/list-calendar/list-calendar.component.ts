import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ReportApiService } from '../report-service/report-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { state, style } from '@angular/animations';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar, EventInput } from '@fullcalendar/core';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; 
import { Subscriber } from 'rxjs';


@Component ({
  selector: 'app-list-calendar',
  templateUrl: './list-calendar.component.html',
  styleUrls: ['./list-calendar.component.css']
})

export class ListCalendarComponent implements OnInit {

  holidayData:[];
  attadanceData:[];

  calendarVisible = true;
  calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin];
  calendarWeekends = true;
  calendarEvents: EventInput [] = [];

  handleDateClick(arg) {
    if (confirm('Would you like to add an event to ' + arg.dateStr + ' ?')) {
      this.calendarEvents = this.calendarEvents.concat({ 
        title: 'New Event',
        start: arg.date,
        allDay: arg.allDay
      })
    }
  }

  constructor(private api:ReportApiService){}

  ngOnInit(){
    this.holiday();
    this.attadance();
  }

  holiday(){
    this.api.getHoliday().subscribe(data=>{
      this.holidayData = data.data;
      if(data.data == ''){
        this.calendarEvents.push({});
      }else{
        for(var i=0;i<this.holidayData.length;i++){
          var eventDate = new Date(data.data[i].holidayDate);
          this.calendarEvents.push({title: data.data[i].title, date:eventDate, color:'#ef8157', textColor: 'white'});
        }
      }
    })
  }

  attadance(){
    this.api.userLeave().subscribe(data=>{
      this.attadanceData = data.data;
    })
  }
 
}