import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentServices } from '../document-services/document.services';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
  selector: 'app-update-document-types',
  templateUrl: 'update-document-types.component.html'
})

export class UpdateDocumentTypesComponent implements OnInit {

    public companyId: any;
    public documentTypeId: any;
    documentForm: any;
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    errorMsg: boolean = false;
    existingValue:any;
    public val: any= [];
  permissionInfo: any;

    constructor(private route: ActivatedRoute, private fob:FormBuilder, private router: Router,
            private api: DocumentServices,private ngZone: NgZone,
            private util: UtilitiesService ){
              this.documentTypeId = this.route.snapshot.paramMap.get("documentTypeId");
              this.util.moduleExists(this.documentTypeId,'DocumentTypes').subscribe((data)=>{
                if(data.status === 'success'){
                  if(!data.data){
                    this.router.navigateByUrl('/pages/document-types/list-document-types');
                  }
                }
              })
            }

    ngOnInit() {
      this.companyId = this.route.snapshot.paramMap.get("companyId");
      this.valueCheck();
      this.documentValidation();
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Edit DocumentType') === -1){
        this.documentForm.disable();
      }
    }

    valueCheck() {
      this.api.documentTypeDetails(this.documentTypeId).subscribe(data=>{
        if(data.status === 200 || data.status === 'success') {
          this.existingValue = data.data;
            this.documentForm = this.fob.group({
              title: new FormControl(this.existingValue.title,Validators.required),
              description: new FormControl(this.existingValue.description),
              isRequired: new FormControl(this.existingValue.isRequired)
            })
        }
      })
    }

    updateDoc() {
      try{
        let cleanDocumnetTypeUpdateForm = this.util.cleanFormLevelOne(this.documentForm);
        this.api.updateDocument(cleanDocumnetTypeUpdateForm.value,this.companyId,this.documentTypeId).subscribe(data=>{
          if(data.status === 'success' || data.status === 200) {
            this.successMessage = true ;
            this.errorMsg = false ;
            this.successMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
              this.ngZone.run(()=>this.router.navigateByUrl('/pages/document-types/list-document-types'));
            },2000);
          } else if(data.status == "error") {
            this.errorMsg = true;
            this.successMessage = false;
            this.errMsg = data.message;
            setTimeout(() => {
              this.handleErrors();
            },3000);
          }
        })
      } catch(err){
        console.log(err);
      }

    }

    documentValidation() {
      try {
        this.documentForm = this.fob.group({
          title: new FormControl('',Validators.required),
          description: new FormControl(''),
          isRequired: new FormControl(false)
          })
        }
      catch (err) {
        console.log(err);
      }
    }


    validationMessage = {
      'title': [
        { type: 'required', message: 'Title is Required' },
      ],
  }

    handleErrors(){
      this.errorMsg = false;
      this.successMessage = false;
      this.errMsg = '';
      this.successMsg = '';
  }
}