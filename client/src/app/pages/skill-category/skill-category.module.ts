import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillCategoryRoutingModule } from './skill-category-routing.module';
import { SkillCategoryComponent } from './skill-category.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListSkillCategoryComponent } from './list-skill-category/list-skill-category.component';
import { AddSkillCategoryComponent } from './add-skill-category/add-skill-category.component';
import { UpdateSkillCategoryComponent } from './update-skill-category/update-skill-category.component';


@NgModule({
  declarations: [
    SkillCategoryComponent,
     ListSkillCategoryComponent,
     AddSkillCategoryComponent,
     UpdateSkillCategoryComponent,
    ],
  
  imports: [
    CommonModule,
    SkillCategoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule    
  ]
})
export class SkillCategoryModule { }
