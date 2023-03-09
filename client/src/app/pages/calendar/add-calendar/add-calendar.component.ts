import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as jsPDF from 'jspdf'

@Component({
    selector: 'app-add-calendar',
    templateUrl: './add-calendar.component.html'
})

export class AddCalendarComponent implements OnInit {
    
    constructor(){}

    ngOnInit() {
    }

  }