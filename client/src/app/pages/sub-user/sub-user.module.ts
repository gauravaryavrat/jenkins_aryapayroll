import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubUserRoutingModule } from './sub-user-routing.module';
import { SubUserComponent } from './sub-user.component';
import { AddSubusersComponent } from './add-subusers/add-subusers.component';
import { ShowSubusersListComponent } from './show-subusers-list/show-subusers-list.component';
import { SubUserService } from './sub-user-service/sub-user.service';
import { HttpClientModule } from '@angular/common/http';
import { UpdateSubusersDataComponent } from './update-subusers-data/update-subusers-data.component';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
    declarations: [SubUserComponent,AddSubusersComponent, ShowSubusersListComponent, UpdateSubusersDataComponent],
    imports: [
        CommonModule,
        SubUserRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientModule,
        NgxSpinnerModule   
    ],
    providers: [SubUserService,AuthGuard],
})
export class SubUserModule { }