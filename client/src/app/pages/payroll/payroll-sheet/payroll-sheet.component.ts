import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import moment from 'moment';
import { PayrollApiService } from '../payroll-service/payroll-api.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import Swal from 'sweetalert2';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-payroll-sheet',
  templateUrl: './payroll-sheet.component.html',
  styleUrls: ['./payroll-sheet.component.scss']
})
export class PayrollSheetComponent implements OnInit {

  minMode: BsDatepickerViewMode = 'month'; // change for month:year
  bsValue = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  companyDetails: any;
  requestDateDetails = {
    year: `${new Date().getFullYear()}`,
    month: `${new Date().getMonth() + 1}`.padStart(2,'0')
  }

  constructor(
    private apiService: PayrollApiService,
    private titleCase: TitleCasePipe,
  ) {
    this.bsConfig = Object.assign({}, {
      minMode : this.minMode,
      dateInputFormat: 'MM-YYYY'
    });
   }

  ngOnInit(): void {
    this.getCompanyDetails();
  }

  rangeDatesUpdated(dateValues){
    try {
      this.requestDateDetails = {
        year: `${moment(dateValues).get('years')}`,
        month: `${moment(dateValues).get('months') + 1}`.padStart(2,'0')
      }

    } catch (error) {
      console.log(error);
    }
  }

  getCompanyDetails() {
    this.apiService.getCompanyDetails(localStorage.getItem('companyId')).subscribe((companyDetails) => {
      if(companyDetails.status === 'success') {
        this.companyDetails = companyDetails.data;
      }
    })
  }


  // GENERATE SALARY UPLOAD(BANK STATEMENT)
  statementSheet(sheetType) {
    try {
        this.apiService.bankStatement({year: this.requestDateDetails.year, month: this.requestDateDetails.month, statementType: sheetType}).subscribe(response => {

        if(response.status === 'success'){

            (response.data.bankStatement.length === 0) ?
            sheetType === 'Bank' ?
            Swal.fire("Bank Statement is not available or may be you didn't add Empolyees Bank Details" ) :
            sheetType === 'Cash' ?
            Swal.fire("Cash Statement is not available" ):
            Swal.fire("Cheque Statement is not available" )
            : sheetType === 'Bank' ?
            this.generateBankSheet(response.data) :
            sheetType === 'Cash' ?
            this.generateCashStatement(response.data):
            this.generateChequeStatement(response.data);

        }
        if(response.status === 'error'){
          Swal.fire(response.message);
        }
      });
    } catch (error) {
      console.log(error);
    }

  }

// FOR GENRATE EXCEL SHEET FOR BANK STATEMENT
  async generateBankSheet(bankStatementData) {
      // Create workbook and worksheet
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Bank Statement');
      const subHeading = [`We request you to transfer our Salary from Indusind salary account for the amount of  ₹ ${bankStatementData.totalAmoutPaid} (${this.titleCase.transform(bankStatementData.totalAmoutPaidWords)} Only). Please refer  transfer from Aryavrat Infotech Pvt. Ltd. to IndusInd Salary Account of IndusInd Bank of amount ₹ ${bankStatementData.totalAmoutPaid}/-through cheque on 10th ${bankStatementData.month}.`];
      const subject = 'IndusInd bank, Jaipur';
      const tableSubHeading = [`Please find the list below for the salary transfer of ${bankStatementData.month} ${bankStatementData.year}`];
      const header1 = bankStatementData.headerDetails;
      const header2 = ['', '', '', '', ''];
      const footer = [
        ['', 'Total', '', bankStatementData.totalAmoutPaid, ''],
      ];


      const bankData = [];
      for(let i = 0; i < bankStatementData.bankStatement.length; i++){
        const data  = [];
        data.push(i+1);
        for(let key in bankStatementData.bankStatement[i]){
           data.push(bankStatementData.bankStatement[i][key]);
        }
        bankData.push(data);
      }
          // Add Row and formatting
      const subTitleRow = worksheet.addRow(['TO', '', '', '', 'Date : ' + bankStatementData.currentDate]);
      worksheet.getCell('B2').value = subject;
      // Add sheet heading
      const sheetHeading = worksheet.addRow([bankStatementData.subject]);
      worksheet.mergeCells('A3:E3');
      worksheet.addRow([]);
      sheetHeading.font = { name: 'Arial', family: 4, size: 10, underline: 'double', bold: true, };
      sheetHeading.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      // Add sheet sub heading
      const sheetSubHeading1 = worksheet.addRow(subHeading);
      worksheet.mergeCells('A5:E7');
      sheetSubHeading1.getCell(5).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      sheetSubHeading1.getCell(5).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

      // Add table sub heading
      const sheetSubHeading2 = worksheet.addRow(tableSubHeading);
      worksheet.mergeCells('A8:E8');
      sheetSubHeading2.eachCell((cell, number) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });

      const headerRow1 = worksheet.addRow(header2);
      headerRow1.eachCell((cell, number) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      const headerRow2 = worksheet.addRow(header1);
      headerRow2.eachCell((cell, number) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.font = { name: 'Arial', family: 4, size: 10, bold: true, };
      });

      worksheet.getColumn(2).width = 30;
      worksheet.getColumn(3).width = 30;
      worksheet.getColumn(5).width = 30;

      bankData.forEach(d => {
        const row = worksheet.addRow(d);
        row.eachCell((cell, number) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'bottom', horizontal: 'left', wrapText: true };
        });
      });

      footer.forEach(f => {
        const footerRow = worksheet.addRow(f);
        footerRow.eachCell((cell, number) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'bottom', horizontal: 'left', wrapText: true };
          cell.font = { name: 'Arial', family: 4, size: 10, bold: true, };
        });
      });
      // Generate Excel sheet
      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, 'Bank Statement.xlsx');
      });
  }

// FOR GENRATE EXCEL SHEET FOR CASH STATEMENT
  async generateCashStatement(salaryStatementData){
    try {
         // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Cash Statement');
    worksheet.addRow([]);
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value =`${salaryStatementData.companyName}, ${salaryStatementData.month} ${salaryStatementData.year}`;
    worksheet.getCell('A2').font = { name: 'Trebuchet MS', family: 4, size: 15, bold: true, };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.addRow([]);
    worksheet.addRow([]);

    const header1 = salaryStatementData.headerDetails;
    const data = [];

    salaryStatementData.bankStatement.forEach((salaryInfo, index) => {
      let salaryDetail = [index+1, salaryInfo.name, salaryInfo.cashAmt, '', ''];
      data.push(salaryDetail);
    });

    const headerRow2 = worksheet.addRow(header1);
    headerRow2.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { name: 'Arial', family: 4, size: 10, bold: true, };
    });

    data.forEach(d => {
      const row = worksheet.addRow(d);
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
    });


    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;

        // Footer Row
        const footerRow = worksheet.addRow(['Total','',salaryStatementData.totalCashAmtPaid,'']);
        footerRow.font = { name: 'Arial', family: 4, size: 10, bold: true, };
        footerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };


    // Generate Excel sheet
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Cash-Statement.xlsx');
    });
    } catch (error) {
      console.log(error);
    }
  }

  // FOR GENRATE EXCEL SHEET FOR CASH STATEMENT
  async generateChequeStatement(salaryStatementData){
    try {
         // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Cheque Statement');
    worksheet.addRow([]);
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value =`${salaryStatementData.companyName}, ${salaryStatementData.month} ${salaryStatementData.year}`;
    worksheet.getCell('A2').font = { name: 'Trebuchet MS', family: 4, size: 15, bold: true, };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.addRow([]);
    worksheet.addRow([]);

    const header1 = salaryStatementData.headerDetails;
    const data = [];

    salaryStatementData.bankStatement.forEach((salaryInfo, index) => {
      let salaryDetail = [index+1, salaryInfo.name, salaryInfo.chequeAmt, salaryInfo.chequeNum, '', ''];
      data.push(salaryDetail);
    });

    const headerRow2 = worksheet.addRow(header1);
    headerRow2.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { name: 'Arial', family: 4, size: 10, bold: true, };
    });

    data.forEach(d => {
      const row = worksheet.addRow(d);
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
    });


    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;

        // Footer Row
        const footerRow = worksheet.addRow(['Total', '', salaryStatementData.totalChequeAmtPaid, '', '', '']);
        footerRow.font = { name: 'Arial', family: 4, size: 10, bold: true, };
        footerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };


    // Generate Excel sheet
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Cheque-Statement.xlsx');
    });
    } catch (error) {
      console.log(error);
    }
  }

}
