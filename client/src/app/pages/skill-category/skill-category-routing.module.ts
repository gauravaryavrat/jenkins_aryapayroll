import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SkillCategoryComponent } from './skill-category.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { ListSkillCategoryComponent } from './list-skill-category/list-skill-category.component';
import { AddSkillCategoryComponent } from './add-skill-category/add-skill-category.component';
import { UpdateSkillCategoryComponent } from './update-skill-category/update-skill-category.component';


const route : Routes = [
  {
    path :'',
    component : SkillCategoryComponent,
    canActivate:[AuthGuard],
    children :[
      {
        path: 'list-skill-category',
        component: ListSkillCategoryComponent,
      },
      {
        path: 'add-skill-category',
        component: AddSkillCategoryComponent
      },
      {
        path: 'update-skill-category/:categoryId',
        component: UpdateSkillCategoryComponent
      },
      
      {
        path:'',
        redirectTo :'list-skill-category',
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
export class SkillCategoryRoutingModule { }