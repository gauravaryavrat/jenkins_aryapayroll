import { BrowserModule } from "@angular/platform-browser";
import {
  HashLocationStrategy,
  Location,
  LocationStrategy,
  DatePipe,
  TitleCasePipe,
} from "@angular/common";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ApiService } from "./services/api.service";
import { AuthGuard } from "./authGuard/auth.guard";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { UtilitiesService } from "./utilities/utilities.service";
import { NotifierModule } from "angular-notifier";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgxPaginationModule } from "ngx-pagination";

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    NotifierModule,
    BsDatepickerModule.forRoot(),
    NgxPaginationModule,
  ],
  providers: [ApiService, AuthGuard, UtilitiesService, DatePipe, TitleCasePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
