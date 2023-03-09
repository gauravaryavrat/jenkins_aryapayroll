import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { UtilitiesService } from './utilities/utilities.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'Demo';

  constructor(
    private permissionAPI: ApiService,
    private util: UtilitiesService
  ) { }

  ngOnInit(){
    if(sessionStorage.length === 0 ){
      sessionStorage.setItem('companyId', localStorage.getItem('companyId'));
    }
    this.permissionAPI.permissionDetails().subscribe((data)=>{
      if(data.status === 'success'){
        this.util.permissionRoleInfo = data.data;
      }
    })
  }

}
