import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/api.service';
import { GraderuleApiService } from '../../graderule/graderule-service/graderule-api.service';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { NotifierService } from 'angular-notifier';
import moment from 'moment';
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company-report',
  templateUrl: './company-report.component.html',
  styleUrls: ['./company-report.component.scss']
})
export class CompanyReportComponent implements OnInit {

  earningDetails = [];
  deductionDetails = [];
  headerData = [];
  viewData = [];
  empData = [];
  gradeDetails = [];
  tableData: any;
  disableFilter = true;
  cellValues: string;
  excelHeader = [];
  minMode: BsDatepickerViewMode = 'month'; // change for month:year
  sortMonthTabs = [];

  currentPage = 1;
  excelViewData = [];

  bsConfig: Partial<BsDatepickerConfig>;
  requestDatePicker = {
    startDate: '',
    endDate: ''
  }

  constructor(
    private datePipe: DatePipe,
    public gradeApi: GraderuleApiService,
    public apiService: ApiService,
    public notifier: NotifierService,
    private spinner: NgxSpinnerService,



  ) {
    this.bsConfig = Object.assign({}, {
      minMode : this.minMode,
      rangeInputFormat: 'MM-YYYY',
      dateInputFormat: 'MM-YYYY'
    });
  }

  ngOnInit() {
    this.gradeApi.getGradeRuleList().subscribe(response => {
      if (response.status === 'success') {
        this.gradeDetails = response.data;
      }
    });
    this.getAllFilterValues();
  }

  getCompanyReport(tableData) {
    try {
      this.headerData = [];
      const header = [
        'Sr No.',
        'Name',
        'Date of Joining',
        'In Hand(P/M)',
        'Bonus',
        'Incentives',
        'Gross',
        'PresentDays',
        'Absent Days',
        'Working Days',
        'Adjust Leave',
        'Per day Salary',
        'Net Salary',
        'Pay Mode'
      ];


      // FOR EARNING INFO
      if (tableData.gradeRuleInfo.earningsInfo.length !== 0) {
        this.earningDetails = [];
        for (let earning of tableData.gradeRuleInfo.earningsInfo) {
          if (earning.type === 'Percent') {
            let earningString = `${earning.name}(${earning.value}%)`;
            this.earningDetails.push(earningString);
          }

          if (earning.type === 'Fixed') {
            let earningString = `${earning.name}(₹ ${earning.value})`;
            this.earningDetails.push(earningString);
          }

          if ((earning.type).trim().length === 0) {
            let earningString = `${earning.name}`;
            this.earningDetails.push(earningString);
          }

        }
      }

      // FOR DEDUCTION INFO
      if (tableData.gradeRuleInfo.deductionInfo.length !== 0) {
        this.deductionDetails = [];
        for (let deduction of tableData.gradeRuleInfo.deductionInfo) {
          if (deduction.type === 'Percent') {
            let deductionString = `${deduction.name}(${deduction.value}%)`;
            this.deductionDetails.push(deductionString);
          }

          if (deduction.type === 'Fixed') {
            let deductionString = `${deduction.name}(₹ ${deduction.value})`;
            this.deductionDetails.push(deductionString);
          }
          if ((deduction.type).trim().length === 0) {
            let deductionString = `${deduction.name}`;
            this.deductionDetails.push(deductionString);
          }
        }
      }
      // FOR MANAGE HEADER DATA
      this.headerData = header.concat(this.earningDetails.concat(this.deductionDetails));
      this.viewData = [];
      for (let j = 0; j < tableData.employeeSheetDetails.length; j++) {
        this.returnSheetValue(tableData.employeeSheetDetails[j], j + 1, this.headerData, 'companyReport');
      }
     } catch (error) {
      console.log(error);
    }
  }

  // FOR MANAGE TABLE DATA ACCORDING TO HEADER DATA
  returnSheetValue(employeeData, srNo, headers, type) {
    let viewData = [
      srNo,
      employeeData.name,
      this.datePipe.transform(employeeData.doj, 'dd-MM-yyyy'),
      employeeData.inHand,
      employeeData.bonus,
      employeeData.incentives,
      employeeData.gross,
      employeeData.presentDays,
      employeeData.absentDays,
      employeeData.workingDays,
      employeeData.adjustLeave,
      employeeData.everyDaySalary,
      employeeData.netSalary,
      employeeData.payMode,

    ];
    for (let k = headers.indexOf("Pay Mode") + 1; k < headers.length; k++) {

      let empDedEarHeader = headers[k].substr(0, headers[k].indexOf('(')).trim();
      empDedEarHeader.trim().length === 0 ? empDedEarHeader = headers[k].trim() : '';

      let empDedEarIndex = employeeData.deductions.map((amount) => {
        return (amount.label).trim();
      }).indexOf(empDedEarHeader);

      if (empDedEarIndex === -1) {
        empDedEarIndex = employeeData.earnings.map((amount) => {
          return (amount.label).trim();
        }).indexOf(empDedEarHeader);

        viewData.push(employeeData.earnings[empDedEarIndex]['amt'])
      } else {
        viewData.push(employeeData.deductions[empDedEarIndex]['amt'])
      }
    }
    return type === 'excelReport' ? this.excelViewData.push(viewData) : this.viewData.push(viewData);
  }

  // CHECK ALL FILTER BLANK OR NOT
  getAllFilterValues() {
    try {
      let grade = (document.getElementById('gradeOptions') as HTMLInputElement).value;
      if (grade !== '' && this.requestDatePicker.startDate.trim().length > 0  && this.requestDatePicker.endDate.trim().length > 0) {
        this.disableFilter = false;
      } else {
        this.disableFilter = true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // CHECK DROPDOWN VALUES
  selectGrade() {
    try {
      this.getAllFilterValues();
    } catch (error) {
      console.log(error);

    }
  }


  // FOR FILTER DATA AND GET COMPANY REPORT
  filterData() {
    try {
      this.spinner.show();
      let grade = (document.getElementById('gradeOptions') as HTMLInputElement).value;
      this.apiService.getCompanyReport(this.requestDatePicker.startDate, this.requestDatePicker.endDate, grade).subscribe(response => { 
      this.spinner.hide();
          if (response.status === 'success') {
          if(response.data.length === 0){
            this.notifier.notify('info', 'Company Report Not Available')
          }
          if(response.data.length !== 0){
            this.sortMonthTabs = response.sortingCriteria;
            this.tableData = response.data;

            let tabIndex = this.tableData.map((monthObj) => {
              return monthObj.sheetId;
            }).indexOf(this.sortMonthTabs[0].sortingId);

          this.getCompanyReport(this.tableData[tabIndex]);
          }
        } else if (response.status === 'error') {
          this.tableData = [];
          this.notifier.notify(response.status, response.message);
        }
      }, error => {
      this.spinner.hide();
        console.log(error);
      });
    } catch (error) {
      this.spinner.hide();
      console.log(error);
    }
  }

  // FOR RESET FILTER VALUES
  reset() {
    try {
      (document.getElementById('gradeOptions') as HTMLInputElement).value = '';
      (document.getElementById('rangeDate') as HTMLInputElement).value = '';
      this.disableFilter  = true;
      this.headerData = [];
      this.excelHeader = [];
      this.viewData = [];
      this.sortMonthTabs = [];
    } catch (error) {
      console.log(error);
    }
  }

// FOR GENERATE COMPANY REPORT SHEET
  async generateExcelSheet() {
    try {
      const workbook = new Workbook();
      for(let tableData of this.tableData) { 
        
      const worksheet = workbook.addWorksheet(`${tableData.showMonthName} ${tableData.showYear}`);
      worksheet.addRow([]);
      // FOR MANAGE COMPANY NAME
      worksheet.mergeCells('L2:R2');
      worksheet.getCell('L2').value = `${tableData.companyExpen.name}, ${tableData.month} ${tableData.year}`;
      worksheet.getCell('L2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7B7B7B' }, };
      worksheet.getCell('L2').font = { name: 'Trebuchet MS', family: 4, size: 20, bold: true, };
      worksheet.getCell('L2').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      worksheet.addRow([]);
      worksheet.addRow([]);
      const header = [
        'Sr No.',
        'Name',
        'Date of Joining',
        'In Hand(P/M)',
        'Bonus',
        'Incentives',
        'Gross',
        'PresentDays',
        'Absent Days',
        'Working Days',
        'Adjust Leave',
        'Per day Salary',
        'Net Salary',
        'Pay Mode'

      ];

      worksheet.mergeCells('A4:M4');
      worksheet.getCell('A4:M4').value = 'Employee Details';
      worksheet.getCell('A4:M4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1EFDA' } };
      worksheet.getCell('A4:M4').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      worksheet.getCell('A4:M4').font = { name: 'Arial', family: 4, size: 12, bold: true, };
      worksheet.getCell('A4:M4').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

      const  earnings = [];
      if (tableData.gradeRuleInfo.earningsInfo.length !== 0) {
        this.cellValues = `${this.sheetAlgo(14 + tableData.gradeRuleInfo.earningsInfo.length)}4`;
        worksheet.mergeCells(`N4:${this.cellValues}`);
        worksheet.getCell('N4').value = 'Total Earnings';
        worksheet.getCell('N4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1EFDA' } };
        worksheet.getCell('N4').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getCell('N4').font = { name: 'Arial', family: 4, size: 12, bold: true, };
        worksheet.getCell('N4').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (let earning of tableData.gradeRuleInfo.earningsInfo) {
          if (earning.type === 'Percent') {
            let earningString = `${earning.name}(${earning.value}%)`;
            earnings.push(earningString);
          }

          if (earning.type === 'Fixed') {
            let earningString = `${earning.name}(₹ ${earning.value})`;
            earnings.push(earningString);
          }

          if ((earning.type).trim().length === 0) {
            let earningString = `${earning.name}`;
            earnings.push(earningString);
          }
        }
      }
      const deductions = [];
      if (tableData.gradeRuleInfo.deductionInfo.length !== 0) {
        let cell = `${this.sheetAlgo((14 + tableData.gradeRuleInfo.earningsInfo.length + 1))}4:${this.sheetAlgo((14 + tableData.gradeRuleInfo.earningsInfo.length + tableData.gradeRuleInfo.deductionInfo.length))}4`;
        worksheet.mergeCells(cell);
        worksheet.getCell(`${this.sheetAlgo(14 + tableData.gradeRuleInfo.earningsInfo.length + 1)}4`).value = 'Total Deduction';
        worksheet.getCell(`${this.sheetAlgo(14 + tableData.gradeRuleInfo.earningsInfo.length + 1)}4`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1EFDA' } };
        worksheet.getCell(`${this.sheetAlgo(14 + tableData.gradeRuleInfo.earningsInfo.length + 1)}4`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getCell(`${this.sheetAlgo(14 + tableData.gradeRuleInfo.earningsInfo.length + 1)}4`).font = { name: 'Arial', family: 4, size: 12, bold: true, };
        worksheet.getCell(`${this.sheetAlgo(14 + tableData.gradeRuleInfo.earningsInfo.length + 1)}4`).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (let deduction of tableData.gradeRuleInfo.deductionInfo) {
          if (deduction.type === 'Percent') {
            let deductionString = `${deduction.name}(${deduction.value}%)`;
           deductions.push(deductionString);
          }

          if (deduction.type === 'Fixed') {
            let deductionString = `${deduction.name}(₹ ${deduction.value} )`;
           deductions.push(deductionString);
          }

          if ((deduction.type).trim().length === 0) {
            let deductionString = `${deduction.name}`;
           deductions.push(deductionString);
          }
        }
      }


       this.excelHeader = header.concat(earnings.concat(deductions));

      worksheet.addRow(this.excelHeader).eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE1EFDA' },
        }
        cell.font = { name: 'Arial', family: 4, size: 10, bold: true, };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      for (let i = 0; i < this.excelHeader.length; i++) {
        worksheet.getColumn(i + 1).width = 20;
      }

      this.excelViewData = [];
      for (let j = 0; j < tableData.employeeSheetDetails.length; j++) {
        this.returnSheetValue(tableData.employeeSheetDetails[j], j + 1, this.excelHeader, 'excelReport');

      }

      this.excelViewData.forEach(d => {
        const row = worksheet.addRow(d);
        row.eachCell((cell, number) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
      });

      worksheet.addRow([]);
      worksheet.addRow([]);


      const monthHeading = ['', '', 'Monthly Paid', ''];
      worksheet.addRow(monthHeading).eachCell(cell => {
        cell.font = { name: 'Arial', family: 4, size: 14, bold: true, };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF2CC' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });

      const monthSubHeader = ['Company Name', 'Cash', 'Cheque', 'Account Transfer'];
      worksheet.addRow(monthSubHeader).eachCell(cell => {
        cell.font = { name: 'Arial', family: 4, size: 10, bold: true, };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1EFDA' } };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });

      const monthlyData = [[tableData.companyExpen.name, tableData.companyExpen.cash, tableData.companyExpen.cheque, tableData.companyExpen.bankTransfer]]

      monthlyData.forEach(d => {
        const row = worksheet.addRow(d);
        row.eachCell((cell, number) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
      });

    }

      // Generate Excel sheet
      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, `${this.tableData[0].companyExpen.name}-report.xlsx`);
        this.excelHeader = [];
      });
    } catch (error) {
      console.log(error);
    }
  }

  sheetAlgo(cellValue) {

    let basicVertCellVal = {
      1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I', 10: 'J',
      11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O', 16: 'P', 17: 'Q', 18: 'R', 19: 'S', 20: 'T',
      21: 'U', 22: 'V', 23: 'W', 24: 'X', 25: 'Y', 26: 'Z',
    }
    let value = Number(cellValue);

    if (value > 26) {
      let remainder = (value % 26).toString();
      let quotient = parseInt((value / 26).toString());
      let returnCellValue = remainder === '0' ? `${basicVertCellVal[Number(quotient) - 1]}Z` : `${basicVertCellVal[quotient]}${basicVertCellVal[remainder]}`;

      return returnCellValue;
    } else {
      return `${basicVertCellVal[cellValue]}`;
    }
  }


// ON DATE SELECT CHECK VALIDATION
  rangeDatesUpdated(dateValues){
    try {

      if (dateValues === null || dateValues === 'Invalid Date' || dateValues === null || dateValues[0] === null || dateValues[1] === null || dateValues.length < 2) {
        this.requestDatePicker = {
          startDate: '',
          endDate: '',
        }
      } else{
        this.requestDatePicker = {
          startDate: moment(dateValues[0]).format('YYYY-MM'),
          endDate: moment(dateValues[1]).format('YYYY-MM'),
        }
      }
     
      this.getAllFilterValues();
    } catch (error) {
      console.log(error);
    }
  }


  // FOR FILTER MONTH DATA
  changeTabData(sortingId){
    try { 
      let tabIndex = this.tableData.map((monthObj) => {
        return monthObj.sheetId
      }).indexOf(sortingId);
      
      this.getCompanyReport(this.tableData[tabIndex]);
      this.currentPage = 1;
    } catch (error) {
      console.log(error);
    }
  }

   // on page change events
   onPageChange(page: number) {
    this.currentPage = page;
  }
}
