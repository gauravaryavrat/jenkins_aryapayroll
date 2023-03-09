export class Employee {
    companyId: String;
    branchId: String;
    deaprtmentId: String;
    jobProfileId:String;
    name:String;
    dob:String;
    contactDetails : {
        personal : {
            phone: String,
            landLineNum: String,
            email:String,
        },
      official:{
        phone:String,
        landLineNum:String,
        email:String,
      }
    }
    officialEmailAsLoginEmail: String;
    isTL: boolean;
    tlId: String;
    isActive: Boolean;
}

