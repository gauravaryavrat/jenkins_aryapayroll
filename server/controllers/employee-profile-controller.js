const User = require("../models/user");
const commonFunction = require("../commonFunctions");
const ObjectID = require("mongodb").ObjectID;
const Company = require("../models/company");
const Branch = require("../models/branch");
const MetaData = require("../models/meta-data");
const multer = require("multer");
const path = require("path");
const moment = require('moment');
const Department = require('../models/department');
const JobProfile = require('../models/job-profile');
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const sanitize = require('mongo-sanitize');
const GradeRule = require('../models/grade-rule');
const DocumentTypes = require('../models/document-types');

module.exports.addEmployeeProfile = async function(req, res) {
    try {
        const parentUserId = req.params.parentUserId;
        // Sanitize official and Personal Email
        req.body.contactDetails.personal.email = sanitize(req.body.contactDetails.personal.email.toLowerCase());
        req.body.contactDetails.official.email = sanitize(req.body.contactDetails.official.email.toLowerCase());
        const employeeProfileData = req.body;
        employeeProfileData.origin = req.headers.host;
        var errorCode = 1;
        // Check Whether wants its personal mail login mail and same respective to official
        personalMail = sanitize(req.body.contactDetails.personal.email.toLowerCase());
        officialMail = sanitize(req.body.contactDetails.official.email.toLowerCase());
        if (req.body.officialEmailAsLoginEmail) {
            employeeProfileData.loginEmail = officialMail;
            employeeProfileData.mailType = 'Official';
        } else {
            employeeProfileData.loginEmail = personalMail;
            employeeProfileData.mailType = 'Personal';
        }
        employeeProfileData.firstName = commonFunction.getFirstName(
            employeeProfileData.name
        );
        employeeProfileData.lastName = commonFunction.getLastName(
            employeeProfileData.name
        );
        employeeProfileData.parentUserId = parentUserId;

        return await User.addEmployeeProfile(employeeProfileData)
            .then(newEmployeeProfile => {
                var returnEmployeeData = {
                    employeeDetails: {
                        _id: newEmployeeProfile.employeeProfile._id,
                        firstName: newEmployeeProfile.employeeProfile.profile.contactInfo.firstName,
                        lastName: newEmployeeProfile.employeeProfile.profile.contactInfo.lastName,
                        imageUrl: newEmployeeProfile.employeeProfile.profile.imageUrl,
                        timeZone: newEmployeeProfile.employeeProfile.profile.timeZone,
                        isActive: newEmployeeProfile.employeeProfile.isActive,
                        phone: newEmployeeProfile.employeeProfile.employeeProfile.contactDetails
                            .personal.phone,
                        email: newEmployeeProfile.employeeProfile.local.email
                    }
                };
                return returnEmployeeData;
            }).catch(function(err) {
                throw new Error(err.message);
            })
            .then(async employeeCompanyDetails => {
                return await Company.findById({
                        _id: ObjectID(employeeProfileData.companyId)
                    })
                    .then(foundCompany => {
                        if (foundCompany) {
                            employeeCompanyDetails.employeeDetails.company_name =
                                foundCompany.name;
                        } else {
                            employeeCompanyDetails.employeeDetails.company_name =
                                "Company Not Found";
                        }
                        return employeeCompanyDetails;
                    })
                    .then(async employeeBranchDetails => {
                        return await Branch.findById({
                                _id: ObjectID(employeeProfileData.branchId)
                            })
                            .then(foundBranch => {
                                if (foundBranch) {
                                    employeeBranchDetails.employeeDetails.branch_name =
                                        foundBranch.name;
                                } else {
                                    employeeBranchDetails.employeeDetails.branch_name =
                                        "Branch Not Found";
                                }
                                return employeeBranchDetails;
                            })
                            .then(employeeDetails => {
                                return res.send({
                                    status: "success",
                                    message: "Employee Profile Added Successfully",
                                    data: employeeDetails
                                });
                            });
                    })
                    .catch(function(err) {
                        throw new Error(`Problem to add branch details ${err.message}`);
                    });
            })
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Set Employee Password
module.exports.setEmployeePassword = function(req, res) {
    try {
        const userId = req.params.userId;
        const setPasswordData = req.body;
        setPasswordData.userId = userId;

        if (
            commonFunction.valueIsEmpty(setPasswordData.password) ||
            commonFunction.valueIsEmpty(setPasswordData.passwordConfirmation)
        ) {
            throw new Error("Password is required.");
        }
        User.setEmployeePassword(setPasswordData)
            .then(user => {
                if (user) {
                    return res.send({
                        status: "success",
                        message: "Password set successfully"
                    });
                }
            })
            .catch(function(err) {
                return res.send({ status: "error", message: err.message });
            });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Add Employee Skills
module.exports.addEmployeeSkills = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.skills) {
            var updateData = {
                "employeeProfile.skills": req.body.skills
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedSkills => {
            const returnSkillsData = {
                _id: updatedSkills._id,
                skills: updatedSkills.employeeProfile.skills
            };
            return res.send({
                status: 'success',
                message: "Employee Skills Added Successfully",
                data: returnSkillsData
            });
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Add Employee Family Deatils

module.exports.addFamilyMembers = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.family) {
            var updateData = {
                "employeeProfile.family.members": req.body.family.members
            };
            if (req.body.familyType) {
                var familyType = req.body.familyType;
            } else {
                var familyType = "";
            }
        }
        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData, "employeeProfile.family.familyType": familyType }, { new: true }).then(updatedFamily => {
            const returnFamilyData = {
                _id: updatedFamily._id,
                family: updatedFamily.employeeProfile.family
            };
            return res.send({
                status: 'success',
                message: "Employee Family Details Added Successfully",
                data: returnFamilyData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Address Deatils
module.exports.addEmployeeAddress = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.address) {
            var updateData = {
                "employeeProfile.address": req.body.address
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedAddress => {
            const returnAddressData = {
                _id: updatedAddress._id,
                address: updatedAddress.employeeProfile.address
            };
            return res.send({
                status: 'success',
                message: "Employee Address Details Added Successfully",
                data: returnAddressData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Educational Deatils
module.exports.addEducationalDetails = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.educationalDetails) {
            var updateData = {
                "employeeProfile.educationalDetails": req.body.educationalDetails
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedEducationalDetails => {
            const returnEducationalDetails = {
                _id: updatedEducationalDetails._id,
                educationalDetails: updatedEducationalDetails.employeeProfile.educationalDetails
            };
            return res.send({
                status: 'success',
                message: "Employee Educational Details Added Successfully",
                data: returnEducationalDetails
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Work Experiences Deatils
module.exports.addWorkExperiences = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.workExperiences) {
            var updateData = {
                "employeeProfile.workExperiences": req.body.workExperiences
            };
        }
        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedWorkExperiences => {
            const returnWorkExperiencesData = {
                _id: updatedWorkExperiences._id,
                workExperiences: updatedWorkExperiences.employeeProfile.workExperiences
            };
            return res.send({
                status: 'success',
                message: "Employee Work Experiences Details Added Successfully",
                data: returnWorkExperiencesData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Identity Proofs Deatils
module.exports.addIdentityProofs = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.identityProofs) {
            var updateData = {
                "employeeProfile.identityProofs": req.body.identityProofs
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedIdentityProofs => {
            const returnIdentityProofsData = {
                _id: updatedIdentityProofs._id,
                identityProofs: updatedIdentityProofs.employeeProfile.identityProofs
            };
            return res.send({
                status: 'success',
                message: "Employee Identity Proofs Details Added Successfully",
                data: returnIdentityProofsData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Bank Deatils
module.exports.addBankDetails = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.bankDetails) {
            var updateData = {
                "employeeProfile.bankDetails": req.body.bankDetails
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) },
            updateData, { new: true }
        ).then(updatedBankDetails => {
            const returnBankDetails = {
                _id: updatedBankDetails._id,
                bankDetails: updatedBankDetails.employeeProfile.bankDetails
            };
            return res.send({
                status: 'success',
                message: "Employee Bank Details Added Successfully",
                data: returnBankDetails
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add language skills Deatils
module.exports.addLanguageSkills = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        console.log(req.body);
        if (req.body.languageSkills) {
            var updateData = {
                "employeeProfile.languageSkills": req.body.languageSkills
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedLanguageSkills => {
            const returnLanguageSkillsData = {
                _id: updatedLanguageSkills._id,
                languageSkills: updatedLanguageSkills.employeeProfile.languageSkills
            };
            return res.send({
                status: 'success',
                message: "Employee Language Skills Details Added Successfully",
                data: returnLanguageSkillsData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Hobbies Deatils
module.exports.addHobbies = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.hobbies) {
            var updateData = {
                "employeeProfile.hobbies": req.body.hobbies
            };
        }
        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { $push: updateData }, { new: true }).then(updatedHobbies => {
            const returnHobbiesData = {
                _id: updatedHobbies._id,
                hobbies: updatedHobbies.employeeProfile.hobbies
            };
            return res.send({
                status: 'success',
                message: "Employee Hobbies Details Added Successfully",
                data: returnHobbiesData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Add Employee Bio Deatils
module.exports.addBio = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.bio) {
            var updateData = {
                "employeeProfile.bio": req.body.bio
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) },
            updateData, { new: true }
        ).then(updatedBio => {
            const returnBioData = {
                _id: updatedBio._id,
                bio: updatedBio.employeeProfile.bio
            };
            return res.send({
                status: 'success',
                message: "Employee Hobbies Details Added Successfully",
                data: returnBioData
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// User Assign Parent Ids
module.exports.assignParentIds = async function(req, res) {
    try {
        if (req.body.parentIdsData.userId === req.body.parentIdsData.parentUserId)
            return res.send({ status: 'error', message: 'You Can not Assign TL To HimSelf/HerSelf' });

        var userId = req.params.userId;
        if (req.body.parentIdsData) {
            var updateData = {
                "employeeProfile.parentUserIds": req.body.parentIdsData
            };
            // Check if user was already assigned with the parent user Id
            if (!(await commonFunction.userAlreadyAssign(req.body, userId))) {
                // Assign the parent Ids
                return await User.findOneAndUpdate({ _id: ObjectID(userId) }, { $push: updateData }, { new: true }).then(updateUserIds => {
                    const returnUserData = {
                        _id: updateUserIds._id,
                        assignParentIds: updateUserIds.employeeProfile.parentUserIds
                    };
                    return res.send({
                        status: 'success',
                        message: "Assign Successfully",
                        data: returnUserData
                    });
                });
            } else {
                let parentName = await User.getDisplayName(req.body.parentIdsData.parentUserId);
                return res.send({
                    status: "error",
                    message: `User Already Assigned With The Given TL/Manager ${parentName}`
                });
            }
        } else {
            return res.send({
                status: "error",
                message: "There is no Ids to assign"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Unassign the Parent Ids
module.exports.unassignParentIds = async function(req, res) {
    try {
        // Check the required fields
        if (!req.params.userId || !req.params.parentUserId) {
            return res.send({
                status: "error",
                message: "Missing User Id or Parent User Id"
            });
        }
        return await commonFunction
            .unassignIds(req.params.userId, req.params.parentUserId)
            .then(removeParentId => {
                if (removeParentId) {
                    User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, {
                            $pull: {
                                "employeeProfile.parentUserIds": {
                                    _id: ObjectID(removeParentId)
                                }
                            }
                        }, { new: true },
                        function(err, data) {
                            if (err) {
                                return res.send({
                                    status: "error",
                                    message: "error in deleting parent ids"
                                });
                            }
                            return res.send({
                                status: 'success',
                                message: "UnAssigned TL/Manger Successfully",
                                data: data
                            });
                        }
                    );
                }
            })
            .catch(function(err) {
                res.send({ status: "error", message: err.message });
            });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Address
module.exports.updateAddress = async function(req, res) {
    try {
        var addressId = req.params.addressId;
        var employeeId = req.params.employeeId;
        if (req.body.address) {
            return User.findOneAndUpdate({
                _id: ObjectID(employeeId),
                "employeeProfile.address._id": ObjectID(addressId)
            }, {
                $set: {
                    "employeeProfile.address.$.doorNum": req.body.address.doorNum,
                    "employeeProfile.address.$.streetName1": req.body.address.streetName1,
                    "employeeProfile.address.$.streetName2": req.body.address.streetName2,
                    "employeeProfile.address.$.landmark": req.body.address.landmark,
                    "employeeProfile.address.$.zipcode": req.body.address.zipcode,
                    "employeeProfile.address.$.addressType": req.body.address.addressType,
                    "employeeProfile.address.$.state": req.body.address.state,
                    "employeeProfile.address.$.district": req.body.address.district
                }
            }, { new: true }).then(updatedAddress => {
                return res.send({
                    status: 'success',
                    message: "Employee Address Successfully",
                    data: updatedAddress.employeeProfile.address
                });
            });
        } else {
            return res.send({
                status: "error",
                message: "Please update values to see changes"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Family Details
module.exports.updateFamilyDetails = async function(req, res) {
    try {
        if (req.body.family) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.family.members._id": ObjectID(req.params.familyId)
            }, {
                $set: {
                    "employeeProfile.family.members.$.relation": req.body.family.members.relation,
                    "employeeProfile.family.members.$.name": req.body.family.members.name,
                    "employeeProfile.family.members.$.age": req.body.family.members.age,
                    "employeeProfile.family.members.$.occupation": req.body.family.members.occupation,
                    "employeeProfile.family.members.$.education": req.body.family.members.education,
                    "employeeProfile.family.members.$.income": req.body.family.members.income,
                    "employeeProfile.family.familyType": req.body.familyType
                }
            }, { new: true }).then(updatedFamilyDetails => {
                return res.send({
                    status: "success",
                    message: "Employee Family Details Successfully",
                    data: updatedFamilyDetails.employeeProfile.family
                });
            });
        } else {
            return res.send({
                status: "error",
                message: "Please update values to see changes"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Skills
module.exports.updateSkills = function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        var skillId = req.params.skillId;
        if (req.body.skills) {
            return User.findOneAndUpdate({
                _id: ObjectID(employeeId),
                "employeeProfile.skills._id": ObjectID(skillId)
            }, {
                $set: {
                    "employeeProfile.skills.$.skillId": req.body.skills.skillId,
                    "employeeProfile.skills.$.experienceYears": req.body.skills.experienceYears,
                    "employeeProfile.skills.$.startDate.month": req.body.skills.startDate.month,
                    "employeeProfile.skills.$.startDate.year": req.body.skills.startDate.year,
                    "employeeProfile.skills.$.endDate.month": req.body.skills.endDate.month,
                    "employeeProfile.skills.$.endDate.year": req.body.skills.endDate.year,
                    "employeeProfile.skills.$.remarks": req.body.skills.remarks
                }
            }, { new: true }).then(updatedSkills => {
                return res.send({
                    status: "success",
                    message: "Employee Skills Updated Successfully",
                    data: updatedSkills.employeeProfile.skills
                });
            });
        } else {
            return res.send({
                status: "error",
                message: "Please update values to see changes"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Educational Data
module.exports.updateEducationalDetails = function(req, res) {
    try {
        if (req.body.educationalDetails) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.educationalDetails._id": ObjectID(
                    req.params.educationId
                )
            }, {
                $set: {
                    "employeeProfile.educationalDetails.$.courseName": req.body.educationalDetails.courseName,
                    "employeeProfile.educationalDetails.$.instituteName": req.body.educationalDetails.instituteName,
                    "employeeProfile.educationalDetails.$.passOutYear": req.body.educationalDetails.passOutYear,
                    "employeeProfile.educationalDetails.$.status": req.body.educationalDetails.status,
                    "employeeProfile.educationalDetails.$.description": req.body.educationalDetails.description,
                    "employeeProfile.educationalDetails.$.scoredPercent": req.body.educationalDetails.scoredPercent
                }
            }, { new: true }).then(updatedEducationalDetails => {
                return res.send({
                    status: "success",
                    message: "Employee Educational Details Update Successfully",
                    data: updatedEducationalDetails.employeeProfile.educationalDetails
                });
            });
        } else {
            return res.send({
                status: "error",
                message: "Please update values to see changes"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Work Experience
module.exports.updateWorkExperience = function(req, res) {
    try {
        if (req.body.workExperiences) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.workExperiences._id": ObjectID(
                    req.params.workExperienceId
                )
            }, {
                $set: {
                    "employeeProfile.workExperiences.$.companyName": req.body.workExperiences.companyName,
                    "employeeProfile.workExperiences.$.designation": req.body.workExperiences.designation,
                    "employeeProfile.workExperiences.$.experienceYears": req.body.workExperiences.experienceYears,
                    "employeeProfile.workExperiences.$.jobDescription": req.body.workExperiences.jobDescription,
                    "employeeProfile.workExperiences.$.relivingReason": req.body.workExperiences.relivingReason,
                    "employeeProfile.workExperiences.$.relivingIs": req.body.workExperiences.relivingIs,
                    "employeeProfile.workExperiences.$.remarks": req.body.workExperiences.remarks
                }
            }, { new: true }).then(updatedWorkExperiences => {
                return res.send({
                    status: "success",
                    message: "Employee Work Experiences Updated Successfully",
                    data: updatedWorkExperiences.employeeProfile.workExperiences
                });
            });
        } else {
            return res.send({
                status: "error",
                message: "Please update values to see changes"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Identity Proofs
module.exports.updateIdentityProof = function(req, res) {
    try {
        if (req.body.identityProofs) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.identityProofs._id": ObjectID(req.params.proofId)
            }, {
                $set: {
                    "employeeProfile.identityProofs.$.identityName": req.body.identityProofs.identityName,
                    "employeeProfile.identityProofs.$.identityNum": req.body.identityProofs.identityNum,
                    "employeeProfile.identityProofs.$.authorityName": req.body.identityProofs.authorityName,
                    "employeeProfile.identityProofs.$.issuePlace": req.body.identityProofs.issuePlace,
                    "employeeProfile.identityProofs.$.expiryDate": req.body.identityProofs.expiryDate,
                    "employeeProfile.identityProofs.$.remarks": req.body.identityProofs.remarks
                }
            }, { new: true }).then(updatedIdentityProofs => {
                return res.send({
                    status: "success",
                    message: "Employee Identity Proof Update Successfully",
                    data: updatedIdentityProofs.employeeProfile.identityProofs
                });
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Language Skill
module.exports.updateLanguageSkill = function(req, res) {
    try {
        if (req.body.languageSkills) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.languageSkills._id": ObjectID(req.params.languageId)
            }, {
                $set: {
                    "employeeProfile.languageSkills.$.toSpeak": req.body.languageSkills.toSpeak,
                    "employeeProfile.languageSkills.$.toRead": req.body.languageSkills.toRead,
                    "employeeProfile.languageSkills.$.toWrite": req.body.languageSkills.toWrite
                }
            }, { new: true }).then(updatedLanguageSkills => {
                return res.send({
                    status: "success",
                    message: "Employee language Skill Update Successfully",
                    data: updatedLanguageSkills.employeeProfile.languageSkills
                });
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Hobby Data
module.exports.updateHobby = function(req, res) {
    try {
        if (req.body.hobbies) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.hobbies._id": ObjectID(req.params.hobbyId)
            }, {
                $set: {
                    "employeeProfile.hobbies.$.name": req.body.hobbies.name,
                    "employeeProfile.hobbies.$.timeBound": req.body.hobbies.timeBound,
                    "employeeProfile.hobbies.$.remarks": req.body.hobbies.remarks
                }
            }, { new: true }).then(updatedHobbies => {
                return res.send({
                    status: "success",
                    message: "Employee Hobby Update Successfully",
                    data: updatedHobbies.employeeProfile.hobbies
                });
            });
        } else {
            return res.send({
                status: "error",
                message: "Please update values to see changes"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Educational Data
module.exports.updateBankDetails = function(req, res) {
    try {
        if (req.body.bankDetails) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId)
            }, {
                $set: {
                    "employeeProfile.bankDetails.official": req.body.bankDetails.official,
                    "employeeProfile.bankDetails.personal": req.body.bankDetails.personal
                }
            }, { new: true }).then(updatedBankDetails => {
                return res.send({
                    status: "success",
                    message: "Employee Bank Details Update Successfully",
                    data: updatedBankDetails.employeeProfile.bankDetails
                });
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Update Employee Bio
module.exports.updateBio = function(req, res) {
    try {
        if (req.body.bio) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId)
            }, {
                $set: {
                    "employeeProfile.bio": req.body.bio
                        // "employeeProfile.bio.illness.physical":
                        //   req.body.bankDetails.official,
                        // "employeeProfile.bio.illness.mental":
                        //   req.body.bankDetails.personal,
                }
            }, { new: true }).then(updatedBio => {
                return res.send({
                    status: "success",
                    message: "Employee Bio Update Successfully",
                    data: updatedBio.employeeProfile.bio
                });
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

//List Employee Addresses
module.exports.listAddresses = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        var addressDetails = [];
        var employeeAddress = await User.findById({ _id: ObjectID(employeeId) });
        if (employeeAddress.employeeProfile.address.length > 0) {
            employeeAddress.employeeProfile.address.forEach(items => {
                var addressDetail = {
                    _id: items._id,
                    addressType: items.addressType,
                    state: items.state,
                    district: items.district,
                    zipcode: items.zipcode,
                    landmark: items.landmark,
                    streetName1: items.streetName1,
                    streetName2: items.streetName2,
                    doorNum: items.doorNum
                };
                addressDetails.push(addressDetail);
            });
            return res.send({
                status: "success",
                message: "Address List Success",
                data: addressDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add address, There is no address linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Employee Family Details
module.exports.listFamilyDetails = async function(req, res) {
    try {
        var employeesFamilyDetails = {};
        employeesFamilyDetails.familyDetails = [];
        var employeeFamilyDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (employeeFamilyDetails.employeeProfile.family.members.length > 0) {
            employeesFamilyDetails.familyType =
                employeeFamilyDetails.employeeProfile.family.familyType;
            employeeFamilyDetails.employeeProfile.family.members.forEach(items => {
                var familyDetail = {
                    _id: items._id,
                    relation: items.relation,
                    name: items.name,
                    age: items.age,
                    occupation: items.occupation,
                    education: items.education,
                    income: items.income
                };
                employeesFamilyDetails.familyDetails.push(familyDetail);
            });

            return res.send({
                status: "success",
                message: "Family Details List Success",
                data: employeesFamilyDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add family details, There is no family details associated with this ID",
                data: employeesFamilyDetails
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

//List Employee Skills
module.exports.listSkills = async function(req, res) {
    try {
        var skillDetails = [];
        var employeeSkills = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (employeeSkills.employeeProfile.skills.length > 0) {
            employeeSkills.employeeProfile.skills.forEach(items => {
                var skillDetail = {
                    skillId: items.skillId,
                    experienceYears: items.experienceYears,
                    startDate: {
                        month: items.startDate.month,
                        year: items.startDate.year
                    },
                    endDate: {
                        month: items.endDate.month,
                        year: items.endDate.year
                    },
                    remarks: items.remarks
                };
                skillDetails.push(skillDetail);
            });
            return res.send({
                status: "success",
                message: "Skills List Success",
                data: skillDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add skill, There is no skill linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Educational Details
module.exports.listEducationalDetails = async function(req, res) {
    try {
        var educationalDetails = [];
        var employeeEducationalDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (
            employeeEducationalDetails.employeeProfile.educationalDetails.length > 0
        ) {
            employeeEducationalDetails.employeeProfile.educationalDetails.forEach(
                items => {
                    var educationalDetail = {
                        _id: items._id,
                        courseName: items.courseName,
                        instituteName: items.instituteName,
                        passOutYear: items.passOutYear,
                        status: items.status,
                        description: items.description,
                        scoredPercent: items.scoredPercent
                    };
                    educationalDetails.push(educationalDetail);
                }
            );
            return res.send({
                status: "success",
                message: "Educational Details List Successfully",
                data: educationalDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add educational details, There is no educational details linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Identity Proofs
module.exports.listIdentityProofs = async function(req, res) {
    try {
        var identityProofDetails = [];
        var employeeIdentityProofDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (
            employeeIdentityProofDetails.employeeProfile.identityProofs.length > 0
        ) {
            employeeIdentityProofDetails.employeeProfile.identityProofs.forEach(
                items => {
                    var identityProofDetail = {
                        _id: items._id,
                        identityName: items.identityName,
                        identityNum: items.identityNum,
                        authorityName: items.authorityName,
                        issuePlace: items.issuePlace,
                        expiryDate: items.expiryDate,
                        remarks: items.remarks
                    };
                    identityProofDetails.push(identityProofDetail);
                }
            );
            return res.send({
                status: "success",
                message: "Educational Identity Proof List Successfully",
                data: identityProofDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add Identity Proof Details, There is no identity proof details linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};
// List Employee Work Experiences
module.exports.listWorkExperiences = async function(req, res) {
    try {
        var workExperiences = [];
        var employeeWorkExperiences = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (employeeWorkExperiences.employeeProfile.workExperiences.length > 0) {
            employeeWorkExperiences.employeeProfile.workExperiences.forEach(items => {
                var workExperience = {
                    _id: items._id,
                    companyName: items.companyName,
                    designation: items.designation,
                    experienceYears: items.experienceYears,
                    jobDescription: items.jobDescription,
                    relivingReason: items.relivingReason,
                    relivingIs: items.relivingIs,
                    remarks: items.remarks
                };
                workExperiences.push(workExperience);
            });
            return res.send({
                status: "success",
                message: "Educational Work Experience List Successfully",
                data: workExperiences
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add Work Experience Details, There is no Work Experience details linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Language Skills Details
module.exports.listLanguageSkills = async function(req, res) {
    try {
        var languageSkillsDetails = [];
        var employeeLanguageSkillsDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (
            employeeLanguageSkillsDetails.employeeProfile.languageSkills.length > 0
        ) {
            employeeLanguageSkillsDetails.employeeProfile.languageSkills.forEach(
                items => {
                    var languageSkillsDetail = {
                        _id: items._id,
                        toSpeak: items.toSpeak,
                        toRead: items.toRead,
                        toWrite: items.toWrite
                    };
                    languageSkillsDetails.push(languageSkillsDetail);
                }
            );
            return res.send({
                status: "success",
                message: "Language Skills List Successfully",
                data: languageSkillsDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add Language Skill, There is no Language Skill linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Hobbies Details
module.exports.listHobbies = async function(req, res) {
    try {
        var hobbyDetails = [];
        var employeeHobbyDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (employeeHobbyDetails.employeeProfile.hobbies.length > 0) {
            employeeHobbyDetails.employeeProfile.hobbies.forEach(items => {
                var hobbyDetail = {
                    _id: items._id,
                    name: items.name,
                    timeBound: items.timeBound,
                    remarks: items.remarks
                };
                hobbyDetails.push(hobbyDetail);
            });
            return res.send({
                status: "success",
                message: "Educational Hobby List Successfully",
                data: hobbyDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add Hobby, There is no Hobby linked with this ID",
                data: []
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Employee Bank Details
module.exports.listBankDetails = async function(req, res) {
    try {
        var employeeBankDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (employeeBankDetails.employeeProfile.bankDetails) {
            return res.send({
                status: "success",
                message: "Bank details List Successfully",
                data: employeeBankDetails.employeeProfile.bankDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add Bank details, There is no bank details linked with this ID",
                data: {}
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Employee Bio
module.exports.listBio = async function(req, res) {
    try {
        var employeeBio = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        if (employeeBio.employeeProfile.bio) {
            return res.send({
                status: "success",
                message: "Bio List Successfully",
                data: employeeBio.employeeProfile.bio
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add Bio, There is no bio linked with this ID",
                data: {}
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Address
module.exports.deleteAddress = function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.addressId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or Address Id"
            });
        }
        var employeeId = req.params.employeeId;
        var addressId = req.params.addressId;
        User.findByIdAndUpdate({ _id: ObjectID(employeeId) }, { $pull: { "employeeProfile.address": { _id: ObjectID(addressId) } } }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleteing address"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Adress deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Family Details
module.exports.deleteFamilyDetails = async function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.familyId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or Family Id"
            });
        }
        await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.family.members": {
                        _id: ObjectID(req.params.familyId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting family detail"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Family Detail Deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Skills
module.exports.deleteSkill = async function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.skillId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or skill Id"
            });
        }
        await User.findByIdAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.skills": { _id: ObjectID(req.params.skillId) }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleteing skill"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Skill deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Educational Details
module.exports.deleteEducationalDetails = function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.educationId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or Education Id"
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.educationalDetails": {
                        _id: ObjectID(req.params.educationId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting educational details"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Educational Details deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Work Experiences
module.exports.deleteWorkExperience = function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.workExperienceId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or work experience Id"
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.workExperiences": {
                        _id: ObjectID(req.params.workExperienceId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting work experience"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Work Experience deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Identity Proof
module.exports.deleteIdentityProof = function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.proofId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or Proof Id"
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.identityProofs": {
                        _id: ObjectID(req.params.proofId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting Identity Proof"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Identity Proof deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Language Skill
module.exports.deleteLanguageSkill = function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.languageId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or Language Id"
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.languageSkills": {
                        _id: ObjectID(req.params.languageId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting Language Skill"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Language Skill Deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Hobby
module.exports.deleteHobby = function(req, res) {
    try {
        if (!req.params.employeeId || !req.params.hobbyId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id or Hobby Id"
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $pull: {
                    "employeeProfile.hobbies": {
                        _id: ObjectID(req.params.hobbyId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting Hobby"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Hobby Deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Bank Details
module.exports.deleteBankDetails = function(req, res) {
    try {
        if (!req.params.employeeId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id "
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $set: {
                    "employeeProfile.bankDetails.official": "",
                    "employeeProfile.bankDetails.personal": ""
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting bank details"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Bank Details deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Bio
module.exports.deleteBio = function(req, res) {
    try {
        if (!req.params.employeeId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id "
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $set: {
                    "employeeProfile.bio": ""
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting bio"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee Bio deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// ADD Employee Payroll Settings
module.exports.addPayrollSetting = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        if (req.body.payroll) {
            var updateData = {
                "employeeProfile.payroll": req.body.payroll
            };
        }

        return await User.findOneAndUpdate({ _id: ObjectID(employeeId) },
            updateData, { new: true }
        ).then(updatedPayrollSetting => {
            const returnPayrollSetting = {
                _id: updatedPayrollSetting._id,
                payroll: updatedPayrollSetting.employeeProfile.payroll
            };
            return res.send({
                status: 'success',
                message: "Employee Payroll Settings Added Successfully",
                data: returnPayrollSetting
            });
        });
    } catch (err) {
        return res.send({ status: "err", message: err.message });
    }
};

// Update Employee Payroll Settings
module.exports.updatePayrollSetting = function(req, res) {
    try {
        if (req.body.payroll) {
            return User.findOneAndUpdate({
                _id: ObjectID(req.params.employeeId)
            }, {
                $set: {
                    "employeeProfile.payroll": req.body.payroll
                }
            }, { new: true }).then(updatedPayrollSetting => {
                return res.send({
                    status: "success",
                    message: "Employee Payroll Settings Update Successfully",
                    data: updatedPayrollSetting.employeeProfile.payroll
                });
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Employee Payroll Settings
module.exports.listPayrollSetting = async function(req, res) {
    try {
        var employeeBio = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });

        var returnData = {
            earnedLeaveBalance: employeeBio.employeeProfile.payroll.earnedLeaveBalance,
            ctc: employeeBio.employeeProfile.payroll.ctc,
            ctcEffectiveFromDate: employeeBio.employeeProfile.payroll.ctcEffectiveFromDate,
            ctcEffectiveToDate: employeeBio.employeeProfile.payroll.ctcEffectiveToDate,
            paidLeaveBalance: employeeBio.employeeProfile.payroll.paidLeaveBalance,
            gradeRule: employeeBio.employeeProfile.payroll.gradeRule,
            basicPay: employeeBio.employeeProfile.payroll.basicPay,
            mode: employeeBio.employeeProfile.payroll.mode
        }

        if (employeeBio.employeeProfile.payroll.gradeRule !== undefined) {
            var gradeRule = await GradeRule.findById({ _id: ObjectID(employeeBio.employeeProfile.payroll.gradeRule) });
            returnData.gradeRuleName = gradeRule.title;
        }


        if (employeeBio.employeeProfile.payroll) {
            return res.send({
                status: "success",
                message: "Payroll Settings List Successfully",
                data: returnData
            });
        } else {
            return res.send({
                status: "success",
                message: "Please First add payroll settings, There is no payroll settings linked with this ID",
                data: {}
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Employee Payroll Setting
module.exports.deletePayrollSetting = function(req, res) {
    try {
        if (!req.params.employeeId) {
            return res.send({
                status: "error",
                message: "Missing Employee Id "
            });
        }
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                $set: {
                    "employeeProfile.payroll": ""
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting payroll setting"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Employee payroll setting deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Add or update Employee Documents
module.exports.addDocument = function(req, res) {
    try {
        var storage = multer.diskStorage({
            destination: function(req, file, callback) {
                if (!fs.existsSync(
                        path.join(path.resolve(__dirname, "../../server"), "/public")
                    )) {
                    fs.mkdirSync(
                        path.join(path.resolve(__dirname, "../../server"), "/public")
                    );
                }
                if (!fs.existsSync(
                        path.join(
                            path.resolve(__dirname, "../../server"),
                            `/public/${req.params.companyId}`
                        )
                    )) {
                    fs.mkdirSync(
                        path.join(
                            path.resolve(__dirname, "../../server"),
                            `/public/${req.params.companyId}`
                        )
                    );
                }
                if (!fs.existsSync(
                        path.join(
                            path.resolve(__dirname, "../../server"),
                            `/public/${req.params.companyId}`, `/${req.params.employeeId}`
                        )
                    )) {
                    fs.mkdirSync(
                        path.join(
                            path.resolve(__dirname, "../../server"),
                            `/public/${req.params.companyId}`, `/${req.params.employeeId}`
                        )
                    );
                }
                callback(null, `./public/${req.params.companyId}/${req.params.employeeId}`);
            },
            filename: function(req, file, callback) {
                callback(
                    null,
                    file.fieldname + "-" + Date.now() + path.extname(file.originalname)
                );
            }
        });
        const upload = multer({
            storage: storage,
            limits: { fileSize: 1000000 },
            fileFilter: function(req, file, cb) {
                checkFileType(file, cb);
            }
        }).single("document");

        // Check File Type
        function checkFileType(file, cb) {
            // Allowed ext
            const filetypes = /jpeg|jpg|png|gif/;
            // Check ext
            const extname = filetypes.test(
                path.extname(file.originalname).toLowerCase()
            );
            // Check mime
            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb("Images Only!");
            }
        }
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.send({
                    status: "error",
                    message: `Multer Error While Uploading the Documents ${err}`
                });
            } else if (err) {
                return res.send({
                    status: "error",
                    message: err
                });
            }
            // Update Path in the database
            var alterFilePath = req.file.path.substr(req.file.path.indexOf("/"));
            var updateData = path.join(
                path.resolve(__dirname, "../../server"),
                req.file.path
            );
            var saveDocumnet = {
                documentTypeId: req.params.documentTypeId,
                file: updateData,
                fileSize: commonFunction.getFileSize(req.file.size),
                metaData: new MetaData(),
            };
            var responseMessage;
            if (req.params.type === 'Update') {
                saveDocumnet.metaData.updatedBy = req.params.userId;
                saveDocumnet.metaData.updatedAt = MetaData.dateInfo();
                responseMessage = 'Document Updated Successfully';
            } else if (req.params.type === 'Add') {
                saveDocumnet.metaData.createdBy = req.params.employeeId;
                saveDocumnet.metaData.createdAt = MetaData.dateInfo();
                responseMessage = 'Document Uploaded Successfully';
            }

            var existingDocument = await User.findById({
                _id: ObjectID(req.params.employeeId),
                "employeeProfile.documents.documentTypeId": ObjectID(
                    req.params.documentTypeId
                )
            });
            if (existingDocument.employeeProfile.documents.length > 0) {
                existingDocument.employeeProfile.documents.forEach(async items => {
                    if (items.documentTypeId == req.params.documentTypeId) {
                        saveDocumnet.metaData.createdBy = items.metaData.createdBy;
                        saveDocumnet.metaData.createdAt = items.metaData.createdAt;
                        await unlinkAsync(items.file);
                        await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                            $pull: {
                                "employeeProfile.documents": { _id: ObjectID(items._id) }
                            }
                        });
                    }
                });
                await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, { $push: { "employeeProfile.documents": saveDocumnet } }, { new: true });
            } else {
                await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, { $push: { "employeeProfile.documents": saveDocumnet } }, { new: true });
            }
            return res.send({
                status: "success",
                message: responseMessage,
                data: `http://${req.headers.host}${alterFilePath}`
            });
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

module.exports.removeDocuments = async function(req, res) {
    try {
        var existingDocument = await User.findById({
            _id: ObjectID(req.params.employeeId),
            "employeeProfile.documents.documentTypeId": ObjectID(
                req.params.documentTypeId
            )
        });
        if (existingDocument.employeeProfile.documents.length > 0) {
            existingDocument.employeeProfile.documents.forEach(async items => {
                if (items.documentTypeId == req.params.documentTypeId) {
                    await unlinkAsync(items.file);
                    await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, {
                        $pull: {
                            "employeeProfile.documents": { _id: ObjectID(items._id) }
                        }
                    });
                }
            });
        }
        return res.send({
            status: "success",
            message: "Document Remove Successfully"
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Employee Documents
module.exports.listDocuments = async function(req, res) {
    try {
        var documentDetails = await User.findById({ _id: ObjectID(req.params.employeeId) });
        var returnDocument = [];
        if (documentDetails.employeeProfile.documents.length > 0) {
            for (var i = 0; i < documentDetails.employeeProfile.documents.length; i++) {
                var documentTypeDetails = await DocumentTypes.findById({ _id: ObjectID(documentDetails.employeeProfile.documents[i].documentTypeId) });
                var fileName = `http://${req.headers.host}${documentDetails.employeeProfile.documents[i].file.slice(documentDetails.employeeProfile.documents[i].file.indexOf('public') + 6,documentDetails.employeeProfile.documents[i].file.length)}`
                var documentDetail = {
                    documentTypeId: documentDetails.employeeProfile.documents[i].documentTypeId,
                    documentTypeName: documentTypeDetails.title,
                    isRequired: documentTypeDetails.isRequired,
                    file: fileName,
                    fileSize: documentDetails.employeeProfile.documents[i].fileSize,
                    metaData: documentDetails.employeeProfile.documents[i].metaData
                }
                returnDocument.push(documentDetail);
            }
            return res.send({ status: 'success', message: 'Document List Successfully', data: returnDocument });
        } else {

            returnDocument = [];
            return res.send({ status: 'success', message: 'Document List Successfully', data: returnDocument });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// List Employee Details
module.exports.listEmployeeDetails = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        var employeeDetail = await User.findById({ _id: ObjectID(employeeId) });
        if (employeeDetail.employeeProfile) {
            let avatar;
            if (employeeDetail.profile.imageUrl === `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`) {
                avatar = `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
            } else {
                avatar = `http://${req.headers.host}${employeeDetail.profile.imageUrl.substr(employeeDetail.profile.imageUrl.indexOf('public')+6)}`
            }

            var title, positionName, name, companyName, employeeName;
            // Department Info
            var departmentInfo = await Department.findById({ _id: ObjectID(employeeDetail.employeeProfile.departmentId) });
            (!departmentInfo) ? title = "": title = departmentInfo.title;
            // Job Profile Info
            var jobProfileInfo = await JobProfile.findById({ _id: ObjectID(employeeDetail.employeeProfile.jobProfileId) });
            (!jobProfileInfo) ? positionName = "": positionName = jobProfileInfo.positionName;
            // Branch Info
            var branchDetails = await Branch.findById({ _id: ObjectID(employeeDetail.employeeProfile.branchId) });
            (!branchDetails) ? name = "": name = branchDetails.name;
            // Compnay Info
            var companyDetails = await Company.findById({ _id: ObjectID(employeeDetail.employeeProfile.companyId) });
            (!companyDetails) ? companyName = "": companyName = companyDetails.name;
            // Employee Info
            var employeeInfo = await User.getDisplayName(employeeDetail._id);
            (!employeeInfo) ? employeeName = "": employeeName = employeeInfo;

            var employeeDetails = {
                _id: employeeDetail._id,
                employeeName: employeeName,
                name: employeeName,
                age: employeeDetail.employeeProfile.age,
                email: employeeDetail.local.email,
                avatar: avatar,
                departmentId: employeeDetail.employeeProfile.departmentId,
                departmentName: title,
                jobProfileId: employeeDetail.employeeProfile.jobProfileId,
                jobProfileName: positionName,
                jobProfile: positionName,
                branchId: employeeDetail.employeeProfile.branchId,
                branchName: name,
                companyId: employeeDetail.employeeProfile.companyId,
                companyName: companyName,
                dob: (employeeDetail.employeeProfile.dob) ? commonFunction.dateFormatAlter(employeeDetail.employeeProfile.dob) : "",
                personalPhoneNum: (employeeDetail.employeeProfile.contactDetails.personal.landLineNum) ? employeeDetail.employeeProfile.contactDetails.personal.landLineNum : "",
                personalContactNum: (employeeDetail.employeeProfile.contactDetails.personal.phone) ? employeeDetail.employeeProfile.contactDetails.personal.phone : "",
                personalEmail: (employeeDetail.employeeProfile.contactDetails.personal.email) ? employeeDetail.employeeProfile.contactDetails.personal.email : "",
                officialPhoneNum: (employeeDetail.employeeProfile.contactDetails.official.landLineNum) ? employeeDetail.employeeProfile.contactDetails.official.landLineNum : "",
                officialContactNum: (employeeDetail.employeeProfile.contactDetails.official.phone) ? employeeDetail.employeeProfile.contactDetails.official.phone : '',
                officialEmail: (employeeDetail.employeeProfile.contactDetails.official.email) ? employeeDetail.employeeProfile.contactDetails.official.email : '',
            }
            return res.send({ status: "success", message: 'Employee Details List Success', data: employeeDetails });
        } else {
            return res.send({ status: "success", message: 'Employee Details List Success', data: {} });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Manage Leave Setting
module.exports.manageLeaveSettings = async function(req, res) {
    try {
        if (moment(req.body.endDate).isBefore(req.body.startDate)) {
            throw new Error(`You Had Entered End Date ${req.body.endDate} Before of Start Date ${req.body.startDate}`);
        }
        var currentDate = commonFunction.dateFormatAlter(new Date());
        if (moment(req.body.startDate).isBefore(currentDate, 'months')) {
            throw new Error(`You Can't Add Leave Settings For an Employee on pervious Month ${req.body.startDate}`);
        }
        var employeeDetail = await User.findById({ _id: ObjectID(req.params.employeeId) });
        var leaveSetting = {
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            leavePerMonth: req.body.leavePerMonth,
            reason: (req.body.reason) ? req.body.reason : '',
            metaData: new MetaData()
        }
        leaveSetting.metaData.createdBy = req.params.userId;
        leaveSetting.metaData.createdAt = MetaData.dateInfo();
        if (employeeDetail.employeeProfile.leaveSettings) {
            if (employeeDetail.employeeProfile.leaveSettings.length === 0) {
                var updatedLeaveSettings = await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, { $push: { "employeeProfile.leaveSettings": leaveSetting } }, { new: true });
                return res.send({ status: 'success', message: 'Leave Setting Added Successfully', data: updatedLeaveSettings.employeeProfile.leaveSettings });
            } else {
                var existingLeaveSetting = employeeDetail.employeeProfile.leaveSettings[employeeDetail.employeeProfile.leaveSettings.length - 1];
                var lastEnteredDate = commonFunction.dateFormatAlter(existingLeaveSetting.endDate);
                var currentDate = req.body.startDate;
                if (moment(currentDate).isSameOrBefore(lastEnteredDate)) {
                    return res.send({ status: 'error', message: `Entered Start Date ${req.body.startDate} is Already Taken in Leave Settings` });
                } else {
                    var updatedLeaveSettings = await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, { $push: { "employeeProfile.leaveSettings": leaveSetting } }, { new: true });
                    return res.send({ status: 'success', message: 'Leave Setting Added Successfully', data: updatedLeaveSettings.employeeProfile.leaveSettings });
                }
            }
        } else {
            var updatedLeaveSettings = await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, { $push: { "employeeProfile.leaveSettings": leaveSetting } }, { new: true });
            return res.send({ status: 'success', message: 'Leave Setting Added Successfully', data: updatedLeaveSettings.employeeProfile.leaveSettings });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Update Leave Settings
module.exports.updateLeaveSettings = async function(req, res) {
    try {
        if (moment(req.body.endDate).isBefore(req.body.startDate)) {
            throw new Error(`You Had Entered End Date ${req.body.endDate} Before of Start Date ${req.body.startDate}`);
        }
        var employeeDetails = await User.findById({ _id: ObjectID(req.params.employeeId) });
        employeeDetails.employeeProfile.leaveSettings.forEach((items) => {
            var savedStartDate = commonFunction.dateFormatAlter(items.startDate);
            var savedEnddate = commonFunction.dateFormatAlter(items.endDate);
            if (items._id != req.params.leaveSettingId) {
                if (moment(req.body.startDate).isBetween(savedStartDate, savedEnddate, null, '[]')) {
                    throw new Error(`There is already leave setting for employee on or between from ${savedStartDate} to ${savedEnddate} dates.`);
                }
            } else {
                return;
            }
        })
        var updatedLeaveSettings = await User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId), "employeeProfile.leaveSettings._id": ObjectID(req.params.leaveSettingId) }, {
            $set: {
                "employeeProfile.leaveSettings.$.startDate": req.body.startDate,
                "employeeProfile.leaveSettings.$.endDate": req.body.endDate,
                "employeeProfile.leaveSettings.$.leavePerMonth": req.body.leavePerMonth,
                "employeeProfile.leaveSettings.$.reason": req.body.reason,
                "employeeProfile.leaveSettings.$.metaData.createdBy": req.params.userId,
                "employeeProfile.leaveSettings.$.metaData.createdAt": MetaData.dateInfo()
            }
        }, { new: true });
        return res.send({ status: 'success', message: 'Leave Settings Updated Successfully', data: updatedLeaveSettings.employeeProfile.leaveSettings });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// List Leave Settings
module.exports.listLeaveSettings = async function(req, res) {
    try {
        var leaveSettings = await User.findById({ _id: ObjectID(req.params.employeeId) });
        var employeeDetails = {};
        employeeDetails.employeeId = leaveSettings._id;
        employeeDetails.leaveSettings = [];
        if (leaveSettings.employeeProfile.leaveSettings.length > 0) {
            for (var i = 0; i < leaveSettings.employeeProfile.leaveSettings.length; i++) {
                employeeDetails.leaveSettings.push(leaveSettings.employeeProfile.leaveSettings[i]);
            }
        } else {
            employeeDetails.leaveSettings = [];
        }
        return res.send({ status: 'success', message: 'Leave Setting List Successfully', data: employeeDetails });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Update Employee Profile
module.exports.updateEmployeeProfile = async function(req, res) {
    try {
        var updateData = {
            "employeeProfile.companyId": req.body.companyId,
            "employeeProfile.departmentId": req.body.departmentId,
            "employeeProfile.branchId": req.body.branchId,
            "profile.contactInfo.firstName": commonFunction.getFirstName(req.body.name),
            "profile.contactInfo.lastName": commonFunction.getLastName(req.body.name),
            "employeeProfile.jobProfileId": req.body.jobProfileId,
            "employeeProfile.dob": req.body.dob,
            "employeeProfile.age": commonFunction.getAge(req.body.dob),
            "employeeProfile.contactDetails.official": req.body.contactDetails.official,
        }

        updateData.metaData = new MetaData();
        var loginEmail, loginMailType;
        if (req.body.officialEmailAsLoginEmail) {
            loginEmail = sanitize(req.body.contactDetails.official.email.toLowerCase());
            loginMailType = 'Official Email';
        } else {
            loginEmail = sanitize(req.body.contactDetails.personal.email.toLowerCase());
            loginMailType = 'Personal Email';
        }
        const foundUser = await User.findOne({ "local.email": loginEmail });
        if (foundUser) {
            if (foundUser._id != req.params.employeeId) {
                throw new Error(`User With ${loginMailType} Address ${loginEmail} Already Registered`);
            }
        } else {
            updateData.local = {};
            updateData.local.email = loginEmail;
        }
        // Update Meta Data
        updateData.metaData.updatedBy = req.params.userId;
        updateData.metaData.updatedAt = MetaData.dateInfo();
        return User.findOneAndUpdate({ _id: ObjectID(req.params.employeeId) }, updateData, { new: true }).then((updatedUser) => {
            var returnEmployeeData = {
                employeeDetails: {
                    _id: updatedUser._id,
                    firstName: updatedUser.profile.contactInfo.firstName,
                    lastName: updatedUser.profile.contactInfo.lastName,
                    imageUrl: updatedUser.profile.imageUrl,
                    timeZone: updatedUser.profile.timeZone,
                    isActive: updatedUser.isActive,
                    phone: updatedUser.employeeProfile.contactDetails
                        .personal.phone,
                    email: updatedUser.local.email
                }
            };
            return res.send({ status: 'success', message: 'Employee Profile Updated Successfully', data: returnEmployeeData });
        })
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}