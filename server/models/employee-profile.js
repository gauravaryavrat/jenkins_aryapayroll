const moongoose = require("mongoose");
const Schema = moongoose.Schema,
  ObjectId = Schema.ObjectId;
const validator = require("validator");
const MetaData = require("../models/meta-data");

const employeeProfileSchema = new Schema({
  metaData: MetaData.schema,
  managerId: ObjectId,
  departmentId: {
    type: ObjectId,
    required: [true, "DeparmentId must be given"]
  },
  employeeId: String, // Add Employee Manually
  jobProfileId: ObjectId,
  branchId: {
    type: ObjectId,
    required: [true, "BranchId must be given"]
  },
  companyId: {
    type: ObjectId,
    required: [true, "Company Id must be given"]
  },
  dob: Date,
  age: String,
  esiPfJoiningDate: Date,
  joiningDate: Date,
  relivingDate: Date,
  resignDate: Date,
  resignReason: String,
  settlement: {
    finalAmount: String,
    date: Date,
    mode: String,
    refNum: String,
    remarks: String
  },
  parentUserIds: [
    {
      userId: ObjectId,
      parentUserId: ObjectId
    }
  ],
  family: {
    members: [
      {
        relation: {
          type: String,
          enum: [
            "Mother",
            "Father",
            "Brother",
            "Sister",
            "Uncle",
            "Aunt",
            "Spouse",
            "Son",
            "Daughter"
          ]
        },
        name: String,
        age: String,
        occupation: String,
        education: String,
        income: String
      }
    ],
    familyType: {
      type: String,
      enum: ["Joint", "Nuclear Family"]
    }
  },
  payroll: {
    ctc: {
      type: String,
      default: '0'
    },
    basicPay: {
      type: String,
      default: '0'
    },
    ctcEffectiveFromDate: Date,
    ctcEffectiveToDate: Date,
    paidLeaveBalance: {
      type: String,
      default: '0'
    },
    earnedLeaveBalance: {
      type : String,
      default: "0"
    },
    mode: {
      type: String,
      enum:['Cash','Cheque','Tansfer to Bank Account'],
      default:'Cash'
    },
    gradeRule: ObjectId
  },
  address: [
    {
      doorNum: String,
      streetName1: String,
      streetName2: String,
      landmark: String,
      zipcode: String,
      district: String,
      state: String,
      addressType: {
        type: String,
        enum: ["Permanent", "Current", "Others"]
      }
    }
  ],
  documents: [
    {
      documentTypeId: ObjectId,
      file: String,
      fileSize: String,
      metaData: MetaData.schema
    }
  ],
  contactDetails: {
    personal: {
      phone: String,
      landLineNum: String,
      email: {
        type: String,
        lowercase: true,
        validate: {
          isAsync: false,
          validator: validator.isEmail,
          message: "{VALUE} is not a valid Mail"
        },
        required: [true, "Employee Personal mail must given"]
      }
    },
    official: {
      phone: String,
      landLineNum: String,
      email: {
        type: String,
        lowercase: true,
        validate: {
          isAsync: false,
          validator: validator.isEmail,
          message: "{VALUE} is not a valid Mail"
        }
      }
    }
  },
  educationalDetails: [
    {
      courseName: String,
      instituteName: String,
      passOutYear: String,
      status: String,
      description: String,
      scoredPercent: String
    }
  ],
  workExperiences: [
    {
      companyName: String,
      designation: String,
      experienceYears: String,
      jobDescription: String,
      relivingReason: String,
      relivingIs: {
        type: String,
        enum: ["Formal", "Informal"]
      },
      remarks: String
    }
  ],
  identityProofs: [
    {
      identityName: String,
      identityNum: String,
      authorityName: String,
      issuePlace: String,
      expiryDate: Date,
      remarks: String
    }
  ],
  bankDetails: {
    official: {
      name: String,
      accountNum: String,
      accountPlace: String,
      accountType: String,
      debitCardNum: String,
      debitCardType: String,
      remarks: String
    },
    personal: {
      name: String,
      accountNum: String,
      accountPlace: String,
      accountType: String,
      debitCardNum: String,
      debitCardType: String,
      remarks: String
    }
  },
  languageSkills: [
    {
      toSpeak: String,
      toRead: String,
      toWrite: String
    }
  ],
  skills: [
    {
      skillId: ObjectId,
      experienceYears: String,
      startDate: {
        month: String,
        year: String
      },
      endDate: {
        month: String,
        year: String
      },
      remarks: String
    }
  ],
  hobbies: [
    {
      name: String,
      timeBound: {
        type: String,
        enum: ["Frequent", "Often", "Occasional", "Rare"]
      },
      remarks: String
    }
  ],
  leaveSettings: [{
    startDate: Date,
    endDate: Date,
    leavePerMonth: String,
    reason: String,
    metaData: MetaData.schema
  }],
  earnedLeave: [{
    month: String,
    year: String,
    leaveCount: String,
    reason: String,
    actualReason: String,
    metaData: MetaData.schema
  }],
  earnedLeaveHistory: [{
    month: String,
    year: String,
    leaveCount: String,
    reason: String,
    metaData: MetaData.schema
  }],
  deductionEarnedLeave: [{
    month: String,
    year: String,
    leaveCount: String,
    reason: String,
    metaData: MetaData.schema
  }],
  bio: {
    height: String,
    weight: String,
    color: String,
    moleIdentification: String,
    bloodGroup: String,
    eyePower: String,
    handicapped: {
      type: Boolean,
      default: false
    },
    handicappedPercent: String,
    multipleHandicapped: {
      type: Boolean,
      default: false
    },
    multipleHandicappedPercent: String,
    illness: {
      physical: {
        physicalIllnessName: String,
        treatmentName: String,
        hospitalName: String,
        treatmentDuration: String,
        illnessStatus: String
      },
      mental: {
        mentalIllnessName: String,
        treatmentName: String,
        hospitalName: String,
        treatmentDuration: String,
        llnessStatus: String
      }
    }
  }
});

module.exports = moongoose.model("EmployeeProfile", employeeProfileSchema);
