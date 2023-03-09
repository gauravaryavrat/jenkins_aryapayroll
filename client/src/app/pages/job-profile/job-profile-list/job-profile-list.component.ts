import { Component, OnInit } from '@angular/core';
import { JobProfileService } from '../job-profile-services/job-profile.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-job-profile-list',
  templateUrl: './job-profile-list.component.html',
  styleUrls: ['./job-profile-list.component.scss']
})
export class JobProfileListComponent implements OnInit {

  // jobProfileList: Object;
  public jobProfileList:any =[];
  public showCard:any = {};
  permissionInfo: any;

  constructor(private api: JobProfileService,
     private router: Router,
     private util: UtilitiesService) { }

  ngOnInit() {
    this.permissionInfo = this.util.permissionRoleInfo;
    this.getJobProfileData();
  }

//Method for showing data in a list for binding in HTML
  getJobProfileData() {
    try {
      this.api.getJobProfileData().subscribe(data => {
        if (data.status === 'success' || data.status === 200) {
          this.jobProfileList = data.data;
          if (data.data.length == 0) {
            this.router.navigateByUrl("/pages/job-profile/add-job-profile");
          }
          else {
            const len = Object.keys(this.jobProfileList).length;
            for (var i = 0; i < len; i++) {
              this.showCard[this.jobProfileList[i]._id] = true;
            }
          }
        }
      })
    } catch (err) {
      console.log(err.message);
    }
  }


  //Method For collapsed List Data
  showData(jobProfileId: String) {
    try {
      this.showCard[`${jobProfileId}`] = !this.showCard[`${jobProfileId}`];
    }
    catch (err) {
      console.log(err);
    }
  }

  //Method for remove job profile list
   deleteJobProfile(profileId: String) {
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
          this.api.removeProfileData(profileId).subscribe(data => {
            if (data.status === "success" || data.status === 200) {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                data.message,
                'success'
              )
              this.getJobProfileData();
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
      console.log(err);
    }
  }
  addJobProfile(){
    try{
      this.util.jobProfileStatus = 1;
    }catch(err){
      console.log(err)
    }
  }


}
