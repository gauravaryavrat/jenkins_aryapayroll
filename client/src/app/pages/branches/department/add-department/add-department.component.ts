import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from '../../branch-service/branch.service';

@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss']
})
export class AddDepartmentComponent implements OnInit {

  departmentForm: FormGroup;
  snapshotParam: String;
  successMsg: String;
  successMessage: boolean = false;
  errMsg: String;
  errorMsg: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private api: BranchService,
    public fb: FormBuilder,
    private ngZone: NgZone,
    private router: Router) { }

  ngOnInit() {
    this.snapshotParam = this.route.snapshot.paramMap.get("branchId");
    this.departmentValidation();
  }

  //Method for form validation
  departmentValidation() {
    try {
      this.departmentForm = this.fb.group({
        title: new FormControl(null, Validators.required),
        description: new FormControl(null),
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for submit form data
  departmentFormData() {
    try {
      if (this.departmentForm.valid) {
        this.api.submitDepartmentData(this.departmentForm.value, this.snapshotParam).subscribe((data) => {
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


  // For show error message
  validationMessage = {
    'title': [
      { type: 'required', message: 'Title is required' },
    ],
  }
}
