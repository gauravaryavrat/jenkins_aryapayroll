import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumenttypesRoutingModule } from './document-types-routing.module';
import { DocumenttypesComponent } from './document-types.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListDocumentTypesComponent } from './list-document-types/list-document-types.component';
import { AddDocumentTypesComponent } from './add-document-types/add-document-types.component';
import { UpdateDocumentTypesComponent } from './update-document-types/update-document-types.component';

@NgModule({
  declarations: [
     DocumenttypesComponent,
     ListDocumentTypesComponent,
     AddDocumentTypesComponent,
     UpdateDocumentTypesComponent
    ],
  
  imports: [
    CommonModule,
    DocumenttypesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})
export class DocumenttypesModule { }
