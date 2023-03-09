import { Component, OnInit } from '@angular/core';
import { RolesService } from '../../roles-service/roles.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-role',
  templateUrl: './list-role.component.html',
  styleUrls: ['./list-role.component.scss']
})
export class ListRoleComponent implements OnInit {

  constructor(
    private roleListAPI: RolesService,
    private router: Router
    ) { }
  rolesInfo: any;

  ngOnInit() {
    this.listAllRole();
  }

  listAllRole() {
    try {
      this.roleListAPI.listAllRole().subscribe((data)=>{
        if(data.status === 'success'){
          if(data.data.length === 0){
            this.router.navigateByUrl("/pages/roles/add-role");
          } else {
            this.rolesInfo = data.data;
          }
        }
      })
    } catch (error) {
      console.log(error);
    }
  }
}
