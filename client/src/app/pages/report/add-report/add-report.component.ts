import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as jsPDF from 'jspdf'

@Component({
    selector: 'app-add-report',
    templateUrl: './add-report.component.html'
})

export class AddReportComponent implements OnInit {
    
    constructor(){}

    ngOnInit() {
    }

  }