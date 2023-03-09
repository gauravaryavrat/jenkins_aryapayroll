import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../../roles-service/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-permission',
  templateUrl: './list-permission.component.html',
  styleUrls: ['./list-permission.component.scss']
})
export class ListPermissionComponent implements OnInit {
roleId: any;
roleTitle: any;
permissionInfo: any;

  constructor(
    private ActivatedRoute: ActivatedRoute,
    private permissionListAPI: RolesService
  ) { }

  ngOnInit() {
    this.roleId = this.ActivatedRoute.snapshot.paramMap.get('roleId');
    this.permissionList();
  }

  permissionList(){
    try {
      this.permissionListAPI.listIndividualRole(this.roleId).subscribe((data)=>{
        if(data.status === 'success'){
          this.roleTitle = data.data.title;
          this.permissionInfo = data.data.permission;
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  deletePermission(permissionId){
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
        this.permissionListAPI.deletePermission(this.roleId,permissionId).subscribe((data)=>{
          if(data.status === 'success'){
            swalWithBootstrapButtons.fire(
              'Deleted!',
              data.message,
              'success'
            )
            this.permissionList();
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

}
