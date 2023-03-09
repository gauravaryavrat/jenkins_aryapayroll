import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ReportApiService } from '../report-service/report-api.service';
import { ActivatedRoute,Router } from '@angular/router';
import Swal from 'sweetalert2';
// import * as jsPDF from 'jspdf'
declare let jsPDF;
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { state } from '@angular/animations';
import * as html2canvas from "html2canvas";
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
// import { toBase64String } from '@angular/compiler/src/output/source_map';


@Component ({
    selector: 'app-list-report',
    templateUrl: './list-report.component.html',
    styleUrls: ['./list-report.component.css']
})

export class ListReportComponent implements OnInit {

  paymentData: any[];
  convetForm: any;
  existingData: any[];
  fixdetails: any[];
  deductionList:any[];
  earningsList:any[];
  demo = [];
  demo1 = [];
  grossAmt;
  netSalaryAmt;
  totalDeductionAmt;
  imgData;


constructor(private api:ReportApiService,private fb:FormBuilder){}

ngOnInit() {
  this.existingDataList();
}
  
existingDataList(){
  this.api.salarySlipData().subscribe(data=>{
  this.existingData = data.data;
  this.demo.push(data.data);
  this.grossAmt = data.data.gross.amt;
  this.netSalaryAmt = data.data.netSalary.amt;
  this.totalDeductionAmt = data.data.totalDeduction.amt;

  let fixddata = data.data.employeeDetails;
  this.fixdetails = Object.keys(fixddata).map(key => fixddata[key]); // static header data of pdf
  this.fixdetails = Object.keys(fixddata).map(key => fixddata[key]); // static header data of pdf

  this.imgData= this.fixdetails[2];

  })
}

// download pdf start
generatePdf()
{
  var doc = new jsPDF();

  doc.setFontSize(12);
  doc.rect(5, 20, 150, 8);
  doc.text(this.fixdetails[0], 75, 26, "center", "a");
  // doc.addImage(this.imgData, 'png', 10, 1, 50, 50, 'logo');
  doc.rect(5, 28, 150, 8);
  doc.text("Salary Slip for the Month of April, 2017", 75, 34, "center", "a");
  doc.rect(5, 36, 75, 8);
  doc.text("Employee Name", 22, 42, "center", "a");
  doc.rect(80, 36, 75, 8);
  doc.text(this.fixdetails[1], 120, 42, "center", "a");

  doc.rect(5, 44, 50, 13);
  doc.text("Account No.", 18, 52, "center", "a");
  doc.rect(55, 44,50 , 13);
  doc.text(this.fixdetails[3], 80, 52, "center", "a");
  doc.rect(105, 44, 50, 13);
  doc.text("Designation", 125, 52, "center", "a");
  doc.rect(155, 44, 50, 13);
  doc.text(this.fixdetails[4], 175, 52, "center", "a");

  doc.rect(5, 57, 50, 8);
  doc.text("Days Present",19, 63, "center", "a");
  doc.rect(55, 57, 50, 8);
  doc.text(this.fixdetails[5], 80, 63, "center", "a");
  doc.rect(105, 57, 50, 8);
  doc.text("Earned Leaves", 125, 63, "center", "a");
  doc.rect(155, 57, 50, 8);
  doc.text(this.fixdetails[1], 175, 63, "center", "a");
  
  doc.rect(5, 65, 100, 8);
  doc.text("ESIC No :-", 17, 71, "center", "a");
  doc.rect(105, 65, 100, 8);
  doc.text("P.F. No :-", 120, 71, "center", "a");
  
  doc.rect(5, 73, 65, 8);
  doc.text("Leave Without Sanction", 29,79, "center", "a");
  doc.rect(70, 73, 35, 8);
  doc.text(this.fixdetails[9], 83, 79, "center", "a");
  doc.rect(105, 73, 60, 8);
  doc.text("Payable Days", 125, 79, "center", "a");
  doc.rect(165, 73, 40, 8);
  doc.text(this.fixdetails[10], 180, 79, "center", "a"); 
  
  doc.rect(5,   81, 65, 8);
  doc.text("Total CTC/Month", 22, 87, "center", "a"); 
  doc.rect(70, 81, 35, 8);
  doc.text(this.fixdetails[11], 85, 87, "center", "a"); 
  doc.rect(105, 81, 60, 8);
  doc.text("Total CTC/Annum", 129, 87, "center", "a");
  doc.rect(165, 81, 40, 8);
  doc.text(this.fixdetails[12], 180, 87, "center", "a"); 
  
  doc.rect(5,   89, 100, 12);
  doc.text("Earnings", 40, 97, "center", "a");
  doc.rect(105, 89, 100, 12);
  doc.text("Deductions", 135, 97, "center", "a");

  doc.rect(5, 101, 65, 8);
  doc.rect(70, 101, 35, 8);
  doc.text("Amount", 85, 107, "center", "a");
  doc.rect(105, 101, 60, 8);
  doc.rect(165, 101, 40, 8);
  doc.text("Amount", 185, 107, "center", "a");

// Daynamic part start
  var textY =115;
  var maxLength;
  if(this.demo[0].deductions.length > this.demo[0].earnigs.length)
  {
    maxLength = this.demo[0].deductions.length;
  } else {
    maxLength = this.demo[0].earnigs.length;
  }
  for(var i=0;i<maxLength;i++)
  {
    var rectY = textY - 6;
    if(this.demo[0].earnigs[i] == undefined){
        doc.rect(5,   rectY, 65, 8);
        doc.rect(70,  rectY, 35, 8);
        textY = textY + 8;
    } else {
      doc.rect(5,   rectY, 65, 8);
      doc.text(this.demo[0].earnigs[i].label, 8, textY, "left", "a");
      doc.rect(70,  rectY, 35, 8);
      doc.text("xxx", 95, textY, "center", "a");
    }
    if(this.demo[0].deductions[i]  == undefined){
      doc.rect(105, rectY, 60, 8);
      doc.rect(165, rectY, 40, 8);
      textY = textY + 8;
    } else {
      doc.rect(105, rectY, 60, 8);
      doc.text(this.demo[0].deductions[i].label, 117, textY, "left", "a");
      doc.rect(165, rectY, 40, 8);
      doc.text("xxx", 195, textY, "center", "a");
      textY = textY + 8;
    }
  }

  textY = textY -6;
  doc.rect(5, textY, 65, 8);
  doc.text("Gross", 13, textY+6, "center", "a");
  doc.rect(70, textY, 35, 8);
  doc.text(this.grossAmt, 90, textY+6, "center", "a");
  doc.rect(105, textY, 60, 8);
  doc.text("Tootal Deductions", 134, textY+6, "center", "a");
  doc.rect(165, textY, 40, 8);
  doc.text(this.totalDeductionAmt, 192, textY+6, "center", "a");

  textY = textY+ 8;
  doc.rect(5, textY, 65, 8);
  doc.text("Net Salary", 17, textY+6, "center", "a");
  doc.rect(5, textY, 200, 8);
  doc.text(this.netSalaryAmt, 90, textY+6, "center", "a");

  textY = textY+ 8;
  doc.rect(5, textY, 200, 8);
  
  doc.save('my.pdf');
}
// download pdf end 

// account pdf start 
accountpdfPdf(){

 
  var doc = new jsPDF('a','mm',[700,1000]);

  doc.setFontSize(10);

  var headerSpace = 30; 

  doc.text(18, headerSpace+7, "To");

  doc.text(23, headerSpace+20, "Indusind bank, Jaipur");
  doc.text(190, headerSpace+7, "Date:10/2019");

  doc.text(80, headerSpace+30, "Sub: Salary Transfer for the Month of sep 2019");

  doc.rect(15, headerSpace+35, 200, 30);
  doc.rect(15, headerSpace+65, 200, 5);

  doc.rect(15, headerSpace+70, 15, 5);
  doc.rect(15, headerSpace+70, 70, 5);
  doc.rect(15, headerSpace+70, 105, 5);
  doc.rect(15, headerSpace+70, 140, 5);
  doc.rect(15, headerSpace+70, 200, 5); 

  doc.rect(15, headerSpace+75, 15, 5); doc.text("Sr. No", 17,  headerSpace+79, "left", "a");
  doc.rect(15, headerSpace+75, 70, 5); doc.text("Name", 31, headerSpace+79, "left", "a");
  doc.rect(15, headerSpace+75, 105, 5); doc.text("Account Number", 86,headerSpace+79, "left", "a");
  doc.rect(15, headerSpace+75, 140, 5); doc.text("Amount", 123, headerSpace+79, "left", "a");
  doc.rect(15, headerSpace+75, 200, 5);doc.text("Salary for the month", 157, headerSpace+79, "left", "a");

  headerSpace = headerSpace +80;
  for(var i=0;i<20;i++)
  {
    doc.rect(15, headerSpace, 15, 5);
    doc.rect(15, headerSpace, 70, 5);
    doc.rect(15, headerSpace, 105, 5);
    doc.rect(15, headerSpace, 140, 5);
    doc.rect(15, headerSpace, 200, 5);
    headerSpace = headerSpace+5;
  } 

  // doc.addPage();

  doc.save('my.pdf');
}
// accoutn pdf end
}

