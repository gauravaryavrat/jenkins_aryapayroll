import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { DocumentServices } from '../document-services/document.services';
import Swal from 'sweetalert2';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component ({
    selector: 'app-list-document-types',
    templateUrl: './list-document-types.component.html'
})

export class ListDocumentTypesComponent implements OnInit {

  public document = new Array();
  showCard:any = {};
  permissionInfo: any;

  constructor(private api: DocumentServices,
    public route:Router,
    private util: UtilitiesService) {}

  ngOnInit() {
    this.documentList();
    this.permissionInfo = this.util.permissionRoleInfo
  }

  documentList() {
    try{
      this.api.documentData().subscribe(data=>{
      if(data.status === 200 || data.status === "success") {
      const len = data.data.length;
      if(len == 0){
        this.route.navigateByUrl("/pages/document-types/add-document-types");
      } else {
        this.document = data.data;
      }
      }
    })
    }catch(err){
      console.log(err.message);
    }
  }

  showData(title: String) {
      this.showCard[`${title}`] = !this.showCard[`${title}`];
  }

  removeDocument(leaveTypeId:String){
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
          this.api.removeDocument(leaveTypeId).subscribe((data)=>{
            if(data.status === 'success'){
              swalWithBootstrapButtons.fire(
                'Deleted!',
                data.message,
                'success'
              );
              this.documentList();
            } else if(data.status === 'error'){
              swalWithBootstrapButtons.fire(
                'ERROR!',
                data.message,
                'error'
              );
            }
        });
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
  addDocumentType(){
    try{
      this.util.documentTypeStatus = 1;
    }catch(err){
      console.log(err)
    }
  }
}