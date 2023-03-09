import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService } from '../../branch-service/branch.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-departments',
  templateUrl: './show-departments.component.html',
  styleUrls: ['./show-departments.component.scss']
})
export class ShowDepartmentsComponent implements OnInit {

  snapshotParam: String;
  departmentList= new Array();
  showDepartmentCard = {};
  constructor(private route: ActivatedRoute,
    private router: Router,
    private api: BranchService,
    private ngZone: NgZone, ) { }

  ngOnInit() {
    this.getDepartmentListData();
  }

  navigate() {
    this.router.navigateByUrl(`/pages/branches/add-department/${this.snapshotParam}`)
  }

  getDepartmentListData() {
    try {
      this.snapshotParam = this.route.snapshot.paramMap.get("branchId");
      this.api.getDepartmentData(this.snapshotParam).subscribe((data) => {
        if (data.status === "success" || data.status === 200) {
          this.departmentList = data.department;
          const len = Object.keys(data.department).length;
          for (var i = 0; i < len; i++) {
            this.showDepartmentCard[this.departmentList[i]._id] = true;
          }
        }
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  //Method for onclick data show when collapse
  showData(departmentId: String) {
    try {
      this.showDepartmentCard[`${departmentId}`] = !this.showDepartmentCard[`${departmentId}`];
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for remove company branch
  deleteList(departmentId: String) {
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
          this.api.removeDepartmentData(departmentId).subscribe((data) => {
            if (data.status === "success" || data.status === 200) {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                data.message,
                'success'
              )
              this.ngZone.run(() => {
                this.router.navigateByUrl(`/pages/branches/show-departments/${this.snapshotParam}`);
              })
              this.getDepartmentListData();
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
