import { Component, OnInit,NgZone } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentServices } from '../document-services/document.services';
import { UtilitiesService } from 'src/app/utilities/utilities.service';

@Component({
    selector: 'app-add-document-types',
    templateUrl: './add-document-types.component.html'
})

export class AddDocumentTypesComponent implements OnInit {

    documentForm:FormGroup;
    public companyId;
    successMsg: String;
    successMessage: boolean = false;
    errMsg: String;
    errorMsg: boolean = false;
    permissionInfo: any;

    constructor(private api: DocumentServices,
            private fob: FormBuilder,
            private router: Router,
            private ngzone: NgZone,
            private util: UtilitiesService ){
              this.isListAvaliable();
            }

    ngOnInit() {
      this.documentValidation();
      this.permissionInfo = this.util.permissionRoleInfo;
      if(this.permissionInfo.search('Create DocumentType') === -1){
        this.documentForm.disable();
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

    addDocumentType() {
      try{
        let cleanDocumnetTypeForm = this.util.cleanFormLevelOne(this.documentForm);
        this.api.addDocumentSubmit(cleanDocumnetTypeForm.value, this.companyId).subscribe(data=>{
          if(data.status === 'success' || data.status === 200) {
              this.successMessage = true ;
              this.errorMsg = false ;
              this.successMsg = data.message;
              setTimeout(() =>{
                this.handleErrors();
                this.ngzone.run(()=>this.router.navigateByUrl('/pages/document-types/list-document-types'));
              },2000);
          } else if(data.status === "error"|| data.status === 404){
              this.errorMsg = true;
              this.successMessage = false;
              this.errMsg = data.message;
              setTimeout(() =>{
                this.handleErrors();
              },3000);
            }
          })
      } catch(err){
        console.log(err);
      }

    }

    validationMessage = {
        'title': [
          { type: 'required', message: 'Title is required' },
        ],
    }

    handleErrors(){
      this.errorMsg = false;
      this.successMessage = false;
      this.errMsg = '';
      this.successMsg = '';
  }
  isListAvaliable(){
    try{
      this.api.documentData().subscribe((data) =>{
        if(data.status === 'success'){
          if(data.data.length > 0 && this.util.documentTypeStatus !== 1){
            this.router.navigateByUrl("/pages/document-types/list-document-types");
            this.util.documentTypeStatus = 0;
          }
        }
      })
    }catch(err){
      console.log(err);
    }
  }
}