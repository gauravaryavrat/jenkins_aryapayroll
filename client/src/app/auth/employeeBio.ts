export class EmployeeBio {
    height: String;
    weight: String;
    color: String;
    moleIdentification: String;
    bloodGroup: String;
    eyePower: String;
    handicapped: boolean;
    handicappedPercent: String;
    multipleHandicapped: boolean;
    multipleHandicappedPercent: String;
    illness: {
        physical: {
            physicalIllnessName: String;
            treatmentName: String;
            hospitalName: String;
            treatmentDuration: String;
            illnessStatus: String;
        }
        mental: {
            mentalIllnessName: String;
            treatmentName: String;
            hospitalName: String;
            treatmentDuration: String;
            illnessStatus: String;
        }
    }
}