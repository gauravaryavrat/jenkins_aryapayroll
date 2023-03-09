import { Component, OnInit, NgZone } from '@angular/core';
import { BranchService } from '../branch-service/branch.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-show-branches',
  templateUrl: './show-branches.component.html',
  styleUrls: ['./show-branches.component.scss']
})
export class ShowBranchesComponent implements OnInit {

  snapShot:String;
  // branchList: any =Object;
  branchList: any = [];
  showBranchCard = {};
  permissionInfo: any;

  constructor(private api:BranchService,
     private route:ActivatedRoute,
     private ngZone: NgZone,
     private router: Router,
     private util: UtilitiesService) { }

  ngOnInit() {
    this.permissionInfo = this.util.permissionRoleInfo;
    this.showBranchList();
  }

//Method for Show branch list
  showBranchList(){
    try{
    this.api.getBranchListData().subscribe((data)=>{
      if(data.status === "success" || data.status === 200){
        this.branchList = data.branch;
        if(data.branch.length == 0){
          this.router.navigateByUrl("/pages/branches/add-branch");
        }else{
        for(var i = 0; i < this.branchList.length; i++){
          this.showBranchCard[this.branchList[i]._id] = true;
        }
        }
      }
    })
  }
  catch(err){
    console.log(err);
  }
}

  //Method for onclick data show when collapse
  showData(branchId: String) {
    try{
    this.showBranchCard[`${branchId}`] = !this.showBranchCard[`${branchId}`];
    }
    catch(err){
      console.log(err);
    }
  }

   //Method for remove company branch
   showConfirmationMessage(branchId: String) {
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
          this.api.removeData(branchId).subscribe((data) => {
            if (data.status === "success" || data.status === 200) {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                data.message,
                'success'
              )
              this.ngZone.run(()=>{
                this.router.navigateByUrl('/pages/branches/show-branches');
              })
              this.showBranchList();
            } else if(data.status === 'error'){
              swalWithBootstrapButtons.fire(
                'ERROR!',
                data.message,
                'error'
              )
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
  addBranches(){
    try{
      this.util.branchesSatus = 1;
    }catch(err){
      console.log(err)
    }
  }

}
