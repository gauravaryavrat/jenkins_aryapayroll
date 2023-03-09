import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DocumenttypesComponent } from './document-types.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListDocumentTypesComponent } from './list-document-types/list-document-types.component';
import { AddDocumentTypesComponent } from './add-document-types/add-document-types.component';
import { UpdateDocumentTypesComponent } from './update-document-types/update-document-types.component';

const route : Routes = [
  {
    path :'',
    component : DocumenttypesComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-document-types',
        component: ListDocumentTypesComponent,
      },
      {
        path: 'add-document-types',
        component: AddDocumentTypesComponent
      },
      {
        // path: 'update-document-type/:companyId/:leaveTypeId',
        path: 'update-document-types/:companyId/:documentTypeId',
        component: UpdateDocumentTypesComponent
      },
      {
        path:'',
        redirectTo :'list-document-types',
        pathMatch:'full',
      },
    ],
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class DocumenttypesRoutingModule { }