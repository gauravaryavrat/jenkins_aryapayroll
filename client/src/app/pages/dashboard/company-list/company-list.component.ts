import { Component, OnInit, NgZone, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilitiesService } from 'src/app/utilities/utilities.service';


@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})

export class CompanyListComponent implements OnInit {
  @Input() showProgress:boolean = false;
  showCard = {};
  companyListData:any = Object;
  individualCompanyData = [];
  companyData: String;
  companyId:string;
  wholeCompanyData = [];
  permissionsInfo: any;

  constructor(private api: ApiService, public fb: FormBuilder, private ngZone: NgZone,
    private router: Router,
    private spinner: NgxSpinnerService,
    private util: UtilitiesService
    ) {
   }

  ngOnInit() {
  this.permissionsInfo = this.util.permissionRoleInfo;
  this.getList();
  this.getAllCompanyList();
  }

  //Method for show data in the list
  getList() {
    try {
      this.spinner.show();
      this.api.getIndividualData(sessionStorage.getItem('companyId')).subscribe(data => {
        if (data.status === 'success' || data.status === 200) {
         this.individualCompanyData.push(data.data);
         setTimeout(() => {
          this.spinner.hide();
         },1000)
        }
      })
    }
    catch (err) {
      console.log(err.message);
    }
  }

  // Get All Company Lists
  getAllCompanyList() {
    try {
      this.api.getListData().subscribe(data => {
        if (data.status === 'success' || data.status === 200) {
          if(data.company.length === 0){
            this.spinner.hide();
            this.router.navigateByUrl("/pages/company/add-company");
          } else {
            this.wholeCompanyData = data.company;
          }
        }
      })
    }
    catch (err) {
      console.log(err.message);
    }
  }

  //Method for onclick data show when collapse
  showData(companyId: String) {
    try {
      this.showCard[`${companyId}`] = !this.showCard[`${companyId}`];
    }
    catch (err) {
      console.log(err.message);
    }
  }

  //Method for remove company list
  showConfirmationMessage(companyId: String) {
    try {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You want to delete it",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        reverseButtons: true
      }as any).then((result) => {
        if (result.value) {
          this.api.removeData(companyId).subscribe((data) => {
            if (data.status === "success" || data.status === 200) {
              if(this.wholeCompanyData.length > 0) {
                for (let i = 0; i<this.wholeCompanyData.length; i++ ){
                  if(this.wholeCompanyData[i]._id != companyId){
                    sessionStorage.setItem('companyId',this.wholeCompanyData[i]._id);
                    break;
                  } else {
                    continue;
                  }
                }
              }
              swalWithBootstrapButtons.fire(
                'Deleted!',
                data.message,
                'success'
              )
              this.ngZone.run(()=>{
                this.router.navigateByUrl('/pages/dashboard/company-list')
              })
              window.location.reload();
            }
          })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your list data safe',
            'error'
          )
        }
      })
    }
    catch (err) {
      console.log(err.message);
    }
  }

}
