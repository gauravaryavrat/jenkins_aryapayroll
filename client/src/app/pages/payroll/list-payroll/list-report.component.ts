import { PayrollApiService } from '../payroll-service/payroll-api.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

import { FormBuilder } from '@angular/forms';
import { EmployeeService } from '../../employee-wizard/services/employee.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifierService } from 'angular-notifier';
declare let jsPDF;


@Component({
  selector: 'app-list-payroll',
  templateUrl: './list-payroll.component.html',
  styleUrls: ['./list-payroll.component.scss']
})

export class ListPayrollComponent implements OnInit {

  paymentData: any[];
  existingData = [];
  fixdetails: any[];
  deductionList: any[];
  earningsList: any[];
  demo = [];
  grossAmt;
  netSalaryAmt;
  totalDeductionAmt;
  imgData;

  dataSalary = [];
  salarySlip: any[];
  employeeDetails: any;
  earnedLeaveYearMsg: string;
  showPayrollDetials = false;
  salarySlipStatus = '';
  paymentModeType = [
    {name: 'Transfer to Bank Account', value: 'Tansfer to Bank Account'},
    {name: 'Cash', value: 'Cash'},
    {name: 'Cheque', value: 'Cheque'}
  ];
  status = "Active";
  companyEmployeelist: any;
  showSalaryDetailsCards = {};
  showCheckbox = {};
  selectAllCheckBox = false;
  generateSalaryForEmployees = [];
  salarySlipDetails = {};
  currentMonthValue = {};
  filterOnEmployee = false;
  filterEmployeeId: any;
  currentSalarySlipFilterStatus = 'later';

  showChequeBtn = false;

  constructor(
    private api: PayrollApiService,
    private fb: FormBuilder,
    private employeeListAPI: EmployeeService,
    private spinner: NgxSpinnerService,
    public notifier: NotifierService,


  ) { }

  ngOnInit() {
    let dataSetting = this.currentMonthSetting();
    this.listSalarySlipDetails(dataSetting.monthValue, dataSetting.year, 'later', false);
    let monthValue = Number(dataSetting.monthValue);
    for (var i = 1; i <= 12; i++) {
      if (monthValue >= i) {
        this.currentMonthValue[i.toString().padStart(2, '0')] = true;
      } else {
        this.currentMonthValue[i.toString().padStart(2, '0')] = false;
      }
    }
    this.employeeList();
  }

  // Employee List
  employeeList() {
    try {
      this.employeeListAPI.getEmployeeList(this.status).subscribe((data) => {
        if (data.status === 'success') {
          this.companyEmployeelist = data.data;
        }
      })
    } catch (err) {
      console.log(err);
    }
  }

  allDownload() {
    try {
      this.spinner.show();
      if ((document.getElementById('salarySlipType') as HTMLInputElement).value === 'later') {
        if (this.generateSalaryForEmployees.length === 0) {
          this.spinner.hide();
          Swal.fire('No Salary Slip Selected');
        } else {

          let generateSlip = {
            employeeIdArray: this.generateSalaryForEmployees
          }

          let year = (document.getElementById('payrollYear') as HTMLInputElement).value
          let month = (document.getElementById('salarySlipMonth') as HTMLInputElement).value
          let currentDate = new Date();
          if (Number(year) === currentDate.getFullYear()) {
            this.api.monthlyGenerateSlip(generateSlip, month, year, 'multipleGenerate').forEach(async (data) => {
              if (data.status === 'success') {
                for (var i = 0; i < data.data.length; i++) {
                  this.generatePdf(data.data[i]);
                }
                this.listSalarySlipDetails(month, year, 'later', false);
                this.spinner.hide();
              }
            })
            this.generateSalaryForEmployees = [];
          } else {
            this.api.generateSalarySlip(generateSlip, year, month).forEach((data) => {
              if (data.status === 'success') {
                for (var i = 0; i < data.data.length; i++) {
                  this.generatePdf(data.data[i]);
                }
                this.listSalarySlipDetails(month, year, 'later', false);
                this.spinner.hide();
              }
            })
          }
        }

      } else if ((document.getElementById('salarySlipType') as HTMLInputElement).value === 'former') {
        this.dataSalary.forEach((items) => {
          this.generatePdf(items._id);
        })
        this.spinner.hide();
      }
      // this.spinner.hide();
    } catch (error) {
      console.log(error);
      this.spinner.hide();
    }
  }

  // download pdf start
  async generatePdf(id) {
    this.api.getSalarySlip(id).subscribe(async (data) => {
      this.existingData = await data.data;
      this.demo.push(data.data);

      this.grossAmt = await data.data.gross.amt;
      this.netSalaryAmt = await data.data.netSalary.amt;
      this.totalDeductionAmt = await data.data.totalDeduction.amt;

      this.employeeDetails = await data.data.employeeDetails;
      var doc = await new jsPDF();
      var image = new Image();

      image.src = await data.data.companyImageUrl;

      await doc.setFontSize(12);
      await doc.rect(155, 20, 50, 24);
      await doc.addImage(image, 'PNG', 170, 22, 20, 20, 'Default Logo', 'NONE');
      await doc.rect(5, 20, 150, 8);
      await doc.setFontStyle("bold");
      await doc.text(await this.employeeDetails.companyName, 75, 26, "center", "a");
      await doc.setFontStyle("normal");
      await doc.rect(5, 28, 150, 8);
      await doc.setFontStyle("bold");
      await doc.text(`Salary Slip for the Month of ${data.data.month}, ${data.data.year}`, 75, 34, "center", "a");
      await doc.setFontStyle("normal");
      await doc.rect(5, 36, 75, 8);
      await doc.text("Employee Name", 22, 42, "center", "a");
      await doc.rect(80, 36, 75, 8);
      await doc.setFontStyle("bold");
      await doc.text(await this.employeeDetails.employeeName, 120, 42, "center", "a");
      await doc.setFontStyle("normal");


      await doc.rect(5, 44, 50, 13);
      await doc.text("Account No.", 18, 52, "center", "a");
      await doc.rect(55, 44, 50, 13);
      if (await this.employeeDetails.accountNum) {
        await doc.text(await this.employeeDetails.accountNum, 80, 52, "center", "a");
      } else {
        await doc.text('', 80, 52, "center", "a");
      }
      await doc.rect(105, 44, 50, 13);
      await doc.text("Designation", 125, 52, "center", "a");
      await doc.rect(155, 44, 50, 13);
      await doc.text(await this.employeeDetails.designation, 180, 52, "center", "a");

      await doc.rect(5, 57, 50, 8);
      await doc.text("Days Present", 19, 63, "center", "a");
      await doc.rect(55, 57, 50, 8);
      await doc.text(await this.employeeDetails.present, 80, 63, "center", "a");
      await doc.rect(105, 57, 50, 8);
      await doc.text("Earned Leaves", 125, 63, "center", "a");
      await doc.rect(155, 57, 50, 8);
      await doc.text(await this.employeeDetails.earnedLeaves, 175, 63, "center", "a");

      await doc.rect(5, 65, 100, 8);
      await doc.text("ESIC No :-", 17, 71, "center", "a");
      await doc.rect(105, 65, 100, 8);
      await doc.text("P.F. No :-", 120, 71, "center", "a");

      await doc.rect(5, 73, 65, 8);
      await doc.text("Leave Without Sanction", 29, 79, "center", "a");
      await doc.rect(70, 73, 35, 8);
      await doc.text(await this.employeeDetails.unsanctionedLeave, 83, 79, "center", "a");
      await doc.rect(105, 73, 60, 8);
      await doc.text("Payable Days", 125, 79, "center", "a");
      await doc.rect(165, 73, 40, 8);
      await doc.text(await this.employeeDetails.payDays, 180, 79, "center", "a");

      await doc.rect(5, 81, 65, 8);
      await doc.text("Total CTC/Month", 22, 87, "center", "a");
      await doc.rect(70, 81, 35, 8);
      await doc.setFontStyle("bold");
      await doc.text(await this.employeeDetails.monthlyctc, 85, 87, "center", "a");
      await doc.setFontStyle("normal");
      await doc.rect(105, 81, 60, 8);
      await doc.text("Total CTC/Annum", 129, 87, "center", "a");
      await doc.rect(165, 81, 40, 8);
      await doc.text(await this.employeeDetails.annuallyctc, 180, 87, "center", "a");

      await doc.rect(5, 89, 100, 12);
      await doc.setFontStyle("bold");
      await doc.text("Earnings", 40, 97, "center", "a");
      await doc.rect(105, 89, 100, 12);
      await doc.text("Deductions", 135, 97, "center", "a");


      await doc.rect(5, 101, 65, 8);
      await doc.rect(70, 101, 35, 8);
      await doc.text("Amount", 85, 107, "center", "a");
      await doc.rect(105, 101, 60, 8);
      await doc.rect(165, 101, 40, 8);
      await doc.text("Amount", 185, 107, "center", "a");
      await doc.setFontStyle("normal");

      // Daynamic part start
      var textY = 115;
      var maxLength;
      if (this.demo[0].deductions.length > this.demo[0].earnings.length) {
        maxLength = await this.demo[0].deductions.length;
      } else {
        maxLength = await this.demo[0].earnings.length;
      }
      for (var i = 0; i < maxLength; i++) {
        var rectY = textY - 6;
        if (await this.demo[0].earnings[i] == undefined) {
          await doc.rect(5, rectY, 65, 8);
          await doc.rect(70, rectY, 35, 8);
          textY = textY + 8;
        } else {
          await doc.rect(5, rectY, 65, 8);
          await doc.text(this.demo[0].earnings[i].label, 8, textY, "left", "a");
          await doc.rect(70, rectY, 35, 8);
          await doc.text(this.demo[0].earnings[i].amt, 95, textY, "center", "a");
        }
        if (await this.demo[0].deductions[i] == undefined) {
          await doc.rect(105, rectY, 60, 8);
          await doc.rect(165, rectY, 40, 8);
          textY = textY + 8;
        } else {
          await doc.rect(105, rectY, 60, 8);
          await doc.text(this.demo[0].deductions[i].label, 117, textY, "left", "a");
          await doc.rect(165, rectY, 40, 8);
          await doc.text(this.demo[0].deductions[i].amt, 195, textY, "center", "a");
          textY = textY + 8;
        }
      }

      textY = textY - 6;
      await doc.rect(5, textY, 65, 8);
      await doc.text("Gross", 13, textY + 6, "center", "a");
      await doc.rect(70, textY, 35, 8);
      await doc.text(this.grossAmt, 90, textY + 6, "center", "a");
      await doc.rect(105, textY, 60, 8);
      await doc.text("Total Deductions", 134, textY + 6, "center", "a");
      await doc.rect(165, textY, 40, 8);
      await doc.text(this.totalDeductionAmt, 192, textY + 6, "center", "a");

      textY = textY + 8;
      await doc.rect(5, textY, 65, 8);
      await doc.setFontStyle("bold");
      await doc.text("Net Salary", 17, textY + 6, "center", "a");
      await doc.rect(5, textY, 200, 8);
      await doc.text(this.netSalaryAmt, 90, textY + 6, "center", "a");
      await doc.setFontStyle("normal");

      textY = textY + 8;
      await doc.rect(5, textY, 200, 8);

      // doc.save('my.pdf');
      await doc.save(this.employeeDetails.employeeName + '.pdf');
    })
  }

  // account pdf start
  accountpdfPdf() {


    var doc = new jsPDF('a', 'mm', [700, 1000]);

    doc.setFontSize(10);

    var headerSpace = 30;

    doc.text(18, headerSpace + 7, "To");

    doc.text(23, headerSpace + 20, "Indusind bank, Jaipur");
    doc.text(190, headerSpace + 7, "Date:10/2019");

    doc.text(80, headerSpace + 30, "Sub: Salary Transfer for the Month of sep 2019");

    doc.rect(15, headerSpace + 35, 200, 30);
    doc.rect(15, headerSpace + 65, 200, 5);

    doc.rect(15, headerSpace + 70, 15, 5);
    doc.rect(15, headerSpace + 70, 70, 5);
    doc.rect(15, headerSpace + 70, 105, 5);
    doc.rect(15, headerSpace + 70, 140, 5);
    doc.rect(15, headerSpace + 70, 200, 5);

    doc.rect(15, headerSpace + 75, 15, 5); doc.text("Sr. No", 17, headerSpace + 79, "left", "a");
    doc.rect(15, headerSpace + 75, 70, 5); doc.text("Name", 31, headerSpace + 79, "left", "a");
    doc.rect(15, headerSpace + 75, 105, 5); doc.text("Account Number", 86, headerSpace + 79, "left", "a");
    doc.rect(15, headerSpace + 75, 140, 5); doc.text("Amount", 123, headerSpace + 79, "left", "a");
    doc.rect(15, headerSpace + 75, 200, 5); doc.text("Salary for the month", 157, headerSpace + 79, "left", "a");

    headerSpace = headerSpace + 80;
    for (var i = 0; i < 20; i++) {
      doc.rect(15, headerSpace, 15, 5);
      doc.rect(15, headerSpace, 70, 5);
      doc.rect(15, headerSpace, 105, 5);
      doc.rect(15, headerSpace, 140, 5);
      doc.rect(15, headerSpace, 200, 5);
      headerSpace = headerSpace + 5;
    }

    // doc.addPage();

    doc.save('my.pdf');
  }
  // accoutn pdf end

  // Year Validation
  yearValidation() {
    try {
      let currentDate = new Date();
      let year = currentDate.getFullYear();
      let yearValue = (document.getElementById('payrollYear') as HTMLInputElement).value;
      let yearRegularExpression = /^(19|20)\d{2}$/;
      let result = yearValue.match(yearRegularExpression);

      if (yearValue.length === 0 && result === null) {
        this.earnedLeaveYearMsg = '';
      } else if (result === null) {
        this.earnedLeaveYearMsg = "Year Value is not acceptable";
      } else {
        this.earnedLeaveYearMsg = '';
      }

      if (Number(yearValue) < year) {
        for (var key in this.currentMonthValue) {
          this.currentMonthValue[key] = true;
        }
        (document.getElementById('salarySlipMonth') as HTMLInputElement).value = '01';
      } else if (Number(yearValue) === year) {
        let monthValue = currentDate.getMonth() + 1;
        for (var i = 1; i <= 12; i++) {
          if (monthValue >= i) {
            this.currentMonthValue[i.toString().padStart(2, '0')] = true;
          } else {
            this.currentMonthValue[i.toString().padStart(2, '0')] = false;
          }
        }
      } else if (Number(yearValue) > year) {
        this.earnedLeaveYearMsg = "Forthcoming data is not available";
      }



    } catch (err) {
      console.log(err);
    }
  }

  // Filter Functionality
  filterFunctionality() {
    this.selectAllCheckBox = false;

    if ((document.getElementById('payrollYear') as HTMLInputElement).value.length === 0) {
      let currentDate = new Date().toString();
      (document.getElementById('payrollYear') as HTMLInputElement).value = currentDate.substring(11, 15);
    }

    if ((document.getElementById('salaryEmployee') as HTMLInputElement).value.length !== 0) {
      this.filterEmployeeId = (document.getElementById('salaryEmployee') as HTMLInputElement).value;
      let month = (document.getElementById('salarySlipMonth') as HTMLInputElement).value;
      let year = (document.getElementById('payrollYear') as HTMLInputElement).value;
      this.listSalarySlipDetails(month, year, 'later', true);
    } else {
      if ((document.getElementById('salarySlipType') as HTMLInputElement).value === 'former') {
        this.currentSalarySlipFilterStatus = 'former';
        let month = (document.getElementById('salarySlipMonth') as HTMLInputElement).value;
        let year = (document.getElementById('payrollYear') as HTMLInputElement).value;

        if ((document.getElementById('salaryModeType') as HTMLInputElement).value.length !== 0) {
          let paymentMode = (document.getElementById('salaryModeType') as HTMLInputElement).value;
          this.filterSalarySlip(paymentMode, year, month);
        } else {
          this.listSalarySlipDetails(month, year, 'former', false);
        }

      } else if ((document.getElementById('salarySlipType') as HTMLInputElement).value === 'later') {
        this.currentSalarySlipFilterStatus = 'later';
        let month = (document.getElementById('salarySlipMonth') as HTMLInputElement).value;
        let year = (document.getElementById('payrollYear') as HTMLInputElement).value;

        if ((document.getElementById('salaryModeType') as HTMLInputElement).value.length !== 0) {
          let paymentMode = (document.getElementById('salaryModeType') as HTMLInputElement).value;
          this.filterCurrentSalarySlip(paymentMode, year, month);
        } else {
          this.listSalarySlipDetails(month, year, 'later', false);
        }
      }
    }

    (document.getElementById('salaryModeType') as HTMLInputElement).value === 'Cheque'? this.showChequeBtn = true : this.showChequeBtn = false;

  }

  // Current Month Setting
  currentMonthSetting() {
    try {
      let curretDate = new Date(); let manipulateDate, month, year, monthValue,
        returnData = {
          month: String,
          year: String,
          monthValue: String
        };

      monthValue = (curretDate.getMonth() + 1).toString().padStart(2, '0');
      year = curretDate.toString();
      year = year.substring(11, 15);
      month = curretDate.toString();
      month = month.substring(4, 7);
      returnData.month = month;
      returnData.monthValue = monthValue;
      returnData.year = year;
      (document.getElementById('payrollYear') as HTMLInputElement).value = year;
      (document.getElementById(monthValue) as HTMLInputElement).setAttribute('selected', 'selected');
      (document.getElementById('salarySlipType') as HTMLInputElement).value = 'later';

      return (returnData);
    } catch (error) {
      console.log(error);
    }
  }

  // List Salary Slips
  listSalarySlips(year, monthValue) {
    try {
      this.api.getPayrolData(year, monthValue).subscribe((data) => {
        if (data.status === 'success') {
          if (data.data.length > 0) {
            this.dataSalary = data.data;
            this.salarySlipStatus = '';
          } else {
            this.dataSalary = [];
            this.salarySlipStatus = 'Salary Slip Not Found';
          }
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  // Filter Employee According to payment Mode
  filterSalarySlip(modeType, year, month) {
    try {

      this.api.filterSalarySlip(modeType, year, month).subscribe((data) => {
        if (data.status === 'success') {
          if (data.data.length > 0) {
            this.dataSalary = data.data;
            this.salarySlipStatus = '';
          } else {
            this.dataSalary = [];
            this.salarySlipStatus = 'No Salary Slip Found';
          }
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  // List Employee Salary Details
  listSalarySlipDetails(monthValue, year, type, employeeFilter) {
    try {
      if (employeeFilter) {
        this.api.listSalarySlipDetails(monthValue, year).subscribe((data) => {
          if (data.status === 'success') {
            this.dataSalary = [];
            for (var i = 0; i < data.data.length; i++) {
              if (data.data[i].isGenerated) {
                if (data.data[i].employeeId == this.filterEmployeeId) {
                  this.dataSalary.push(data.data[i]);
                  (document.getElementById('salarySlipType') as HTMLInputElement).value = 'former';
                  this.currentSalarySlipFilterStatus = 'former';
                  break;
                } else {
                  continue;
                }
              } else if (!data.data[i].isGenerated) {
                if (data.data[i]._id == this.filterEmployeeId) {
                  this.dataSalary.push(data.data[i]);
                  (document.getElementById('salarySlipType') as HTMLInputElement).value = 'later';
                  this.currentSalarySlipFilterStatus = 'later';
                  break;
                } else {
                  continue;
                }
              }
            }

            this.showSalaryDetailsCards = {};
            this.showCheckbox = {};

            for (var i = 0; i < this.dataSalary.length; i++) {
              this.showSalaryDetailsCards[this.dataSalary[i]._id] = true;
              if (!this.dataSalary[i].isGenerated) {
                this.showCheckbox[this.dataSalary[i]._id] = false;
              }
            }

            if (this.dataSalary.length === 0) {
              this.salarySlipStatus = 'No Salary Slip Found';
              this.selectAllCheckBox = false;
            } else {
              this.salarySlipStatus = '';
            }
          }
        })
      } else {
        this.api.listSalarySlipDetails(monthValue, year).subscribe((data) => {
          if (data.status === 'success') {
            this.dataSalary = [];
            if (type === 'later') {
              for (var i = 0; i < data.data.length; i++) {
                if (!data.data[i].isGenerated) {
                  this.dataSalary.push(data.data[i]);
                }
              }
            } else if (type === 'former') {
              for (var i = 0; i < data.data.length; i++) {
                if (data.data[i].isGenerated) {
                  this.dataSalary.push(data.data[i]);
                }
              }
            }

            this.showSalaryDetailsCards = {};
            this.showCheckbox = {};

            for (var i = 0; i < this.dataSalary.length; i++) {
              this.showSalaryDetailsCards[this.dataSalary[i]._id] = true;
              if (!this.dataSalary[i].isGenerated) {
                this.showCheckbox[this.dataSalary[i]._id] = false;
              }
            }
            if (this.dataSalary.length === 0) {
              this.salarySlipStatus = 'No Salary Slip Found';
              this.selectAllCheckBox = false;
            } else {
              this.salarySlipStatus = '';
            }
          }
        })
      }

    } catch (error) {
      console.log(error);
    }
  }

  // Header Checkbox Functionality
  headerCheckBox() {
    try {
      this.selectAllCheckBox = !this.selectAllCheckBox;
      if (this.selectAllCheckBox) {
        this.generateSalaryForEmployees = [];
        for (var key in this.showCheckbox) {
          this.showCheckbox[key] = true;
          this.generateSalaryForEmployees.push(key);
        }
      } else {
        for (var key in this.showCheckbox) {
          this.showCheckbox[key] = false;
          this.generateSalaryForEmployees = [];
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // List CheckBoxes Functionalities
  listCheckBoxes(id) {
    try {
      this.showCheckbox[id] = !this.showCheckbox[id];
      if (this.showCheckbox[id]) {
        this.generateSalaryForEmployees.push(id);
      } else {
        for (var i = 0; i < this.generateSalaryForEmployees.length; i++) {
          if (id == this.generateSalaryForEmployees[i]) {
            this.generateSalaryForEmployees.splice(i, 1);
            break;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Show Salary Details
  showSalarySlipDetails(employeeId) {
    try {
      this.showSalaryDetailsCards[employeeId] = !this.showSalaryDetailsCards[employeeId];
      this.salarySlipDetails[employeeId] = {};
      this.salarySlipDetails[employeeId].employeeSalaryDetails = [];
      this.salarySlipDetails[employeeId].deductionDetails = [];
      this.salarySlipDetails[employeeId].earningDetails = [];
      for (var i = 0; i < this.dataSalary.length; i++) {
        if (this.dataSalary[i]._id == employeeId) {
          this.salarySlipDetails[employeeId].employeeSalaryDetails.push(this.dataSalary[i].employeeDetails);
          this.salarySlipDetails[employeeId].deductionDetails = this.dataSalary[i].deductions;
          this.salarySlipDetails[employeeId].earningDetails = this.dataSalary[i].earnings;
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Filter the later generate salary slip
  filterCurrentSalarySlip(modeType, year, month) {
    try {
      this.showSalaryDetailsCards = {};
      this.showCheckbox = {};

      this.api.filterCurrentSalarySlip(modeType, year, month).subscribe((data) => {
        if (data.status === 'success') {
          if (data.data.length > 0) {

            this.dataSalary = data.data;
            this.salarySlipStatus = '';

            for (var i = 0; i < data.data.length; i++) {
              this.showSalaryDetailsCards[data.data[i]._id] = true;
              if (!data.data[i].isGenerated) {
                this.showCheckbox[data.data[i]._id] = false;
              }
            }
          } else {
            this.dataSalary = [];
            this.salarySlipStatus = 'No Salary Slip Found';
          }
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  // Reset Functionality
  resetFunctionality() {
    try {
      this.earnedLeaveYearMsg = '';
      this.currentSalarySlipFilterStatus = 'later';
      this.filterOnEmployee = false;
      let dataSetting = this.currentMonthSetting();
      let currentDate = new Date();
      // let monthValue = (currentDate.getMonth()+1).toString().padStart(2,'0');
      let monthValue = (currentDate.getMonth() + 1);
      for (var i = 1; i <= 12; i++) {
        if (monthValue >= i) {
          this.currentMonthValue[i.toString().padStart(2, '0')] = true;
        } else {
          this.currentMonthValue[i.toString().padStart(2, '0')] = false;
        }
      }

      (document.getElementById(`${dataSetting.monthValue}`) as HTMLInputElement).removeAttribute('selected');
      (document.getElementById('salarySlipType') as HTMLInputElement).value = 'later';
      (document.getElementById('salaryEmployee') as HTMLInputElement).value = '';
      (document.getElementById('salaryModeType') as HTMLInputElement).value = '';
      (document.getElementById('salarySlipMonth') as HTMLInputElement).value = monthValue.toString().padStart(2, '0');
      this.listSalarySlipDetails(dataSetting.monthValue, dataSetting.year, 'later', false);

    } catch (error) {
      console.log(error);
    }
  }

  employeeFilter() {
    this.filterOnEmployee = true;
  }

  // ADD CHEQUE NO.
  addChequeNo(salaryId){
    try {

      this.api.getChequeApi(salaryId).subscribe(response => {
        if(response.status === 'success'){
          Swal.fire({
            title: "Cheque Details",
            text: "Enter Cheque No.:",
            input: 'text',
            inputValue: response.data.chequeNum,
            showCancelButton: true,
            inputValidator: (value) => {
              return !value && 'Cheque No. Mandatory'
            }
            }).then((result) => {
            if (result.value) {
              this.api.addChequeApi(salaryId, {checkNum: result.value}).subscribe(response => {
                (response.status === 'success') ?  this.notifier.notify(response.status, response.message) :
                this.notifier.notify(response.status, response.message) ;
              }, error => {
                console.log(error);
              });
            }
        });
        }

        if(response.status === 'error'){
          this.notifier.notify(response.status, response.message);
        }
      }, error => {
        console.log(error);
      });
    } catch (error) {
      console.log(error);
    }
  }

}


