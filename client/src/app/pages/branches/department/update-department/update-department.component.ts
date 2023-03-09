import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from '../../branch-service/branch.service';

@Component({
  selector: 'app-update-department',
  templateUrl: './update-department.component.html',
  styleUrls: ['./update-department.component.scss']
})

export class UpdateDepartmentComponent implements OnInit {

  updateDepartmentForm:FormGroup;
  snapshotParam: String;
  departmentParam:String;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;
  departmentList= new Array();
  // public departmentList: any=[];
  // public departmentData:any =[];
  departmentData= new Array();

  constructor(
    private route: ActivatedRoute,
    private api: BranchService,
    public fb: FormBuilder,
    private ngZone: NgZone,
    private router: Router
  ) { }

  ngOnInit() {
    this.snapshotParam = this.route.snapshot.paramMap.get("branchId");
    this.departmentParam = this.route.snapshot.paramMap.get("departmentId");
    this.updateFormValidation();
    this.getExistingData();
  }

  //Method for form validation
  updateFormValidation() {
    try {
      this.updateDepartmentForm = this.fb.group({
        title: new FormControl(null),
        description: new FormControl(null),
      })
    } catch (err) {
      console.log(err.message);
    }
  }

   //Method for submit form data
   updateDepartmentFormData() {
    try {
      if (this.updateDepartmentForm.valid) {
        this.api.updateDepartmentData(this.updateDepartmentForm.value, this.snapshotParam, this.departmentParam).subscribe((data) => {
          if (data.status === "success" || data.status === 200) {
            this.successMessage = true;
            setTimeout(() => {
              this.ngZone.run(()=>{this.router.navigateByUrl(`/pages/branches/show-departments/${this.snapshotParam}`)});
            }, 1000);
            this.errorMsg = false;
            this.successMsg = data.message;
          } else if (data.status === "error" || data.status === 404) {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
          }
        })
      }
    } catch (err) {
      console.log(err.message);
    }
  }

   //Method for get existing data show on update form
   getExistingData() {
    this.api.getDepartmentData(this.snapshotParam).subscribe((data) => {
      if (data.status === "success" || data.status === 200) {
        this.departmentList = data.department;
        const len = Object.keys(this.departmentList).length;
        for (var i = 0; i < len; i++) {
          if (this.departmentList[i]._id === this.departmentParam) {
            this.departmentData.push(this.departmentList[i]);
            this.updateDepartmentForm = this.fb.group({
              title: new FormControl(this.departmentList[i].title),
              description: new FormControl(this.departmentList[i].description),
            })
          }
        }
      }
    })
  }

}