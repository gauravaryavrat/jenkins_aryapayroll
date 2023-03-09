import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SubUserService } from '../sub-user-service/sub-user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-show-subusers-list',
  templateUrl: './show-subusers-list.component.html',
  styleUrls: ['./show-subusers-list.component.scss']
})
export class ShowSubusersListComponent implements OnInit {

  showCard = {};
  // subUsersListData: any = Object;
  subUsersListData: any = []; 


  constructor(private api: SubUserService, public fb: FormBuilder, private ngZone: NgZone, private router: Router) { }

  ngOnInit() {
    this.getSubUsersList();
  }
  
  //Method for show sub-users in the list
  getSubUsersList() {
    try{
    this.api.getSubUsersListData().subscribe(data => {
      if (data.status === 'success' || data.status === 200) {
        this.subUsersListData = data.users;
        if(data.users.length == 0){
          this.router.navigateByUrl("/pages/sub-user/add-subuser");
        }
        else{
          const len = Object.keys(this.subUsersListData).length;
          for (var i = 0; i < len; i++) {
            this.showCard[this.subUsersListData[i]._id] = true;
          }
        }
      }
    })
  }
  catch(err){
    console.log(err);
  }
  }

//Method For collapsed List Data
  showData(subUsersId: String) {
    try{
    this.showCard[`${subUsersId}`] = !this.showCard[`${subUsersId}`];
    }
    catch(err){
      console.log(err);
    }
  }


  //Method for remove company list
  deleteSubUserListData(subUserId: String) {
    try{
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
          this.api.removeSubUsersData(subUserId).subscribe((data) => {
            if (data.status === "success" || data.status === 200) {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                data.message,
                'success'
              )
              this.getSubUsersList();
            }
          })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your Data Safe',
            'error'
          )
        }
      })
    }
    catch(err){
      console.log(err);
    }
  }


}
