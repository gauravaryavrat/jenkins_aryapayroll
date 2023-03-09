const PaymentHead = require("../models/payment-head");
const ObjectID = require("mongodb").ObjectID;
const MetaData = require("../models/meta-data");
const commonFunction = require("../commonFunctions");
const GradeRule = require('../models/grade-rule');

// Add Payment Heads
module.exports.addPaymentHead = async function(req, res) {
  if (!req.body.title || !req.body.type) {
    return res.send({ status: "error", message: "Missing Title or Type" });
  }

  try {
    (req.body.parentId) ? req.body.parentId = req.body.parentId.trim():'';
    var paymentHeadData = commonFunction.cleanEmpytString(req.body);
    paymentHeadData.companyId = req.params.companyId;

    const newPaymentHeadData = await PaymentHead.addPaymentHead(
      paymentHeadData
    );
    if (newPaymentHeadData) {
      const returnPaymentHead = {
        _id: newPaymentHeadData.paymentHead._id,
        title: newPaymentHeadData.paymentHead.title
      };
      return res.send({
        status: "success",
        message: "Company Payment Head Added Successfully",
        data: returnPaymentHead
      });
    } else {
      return res.send({ status: "error", message: "Unable To Add Branch" });
    }
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

// update Payment Heads
module.exports.updatePaymentHead = async function(req, res) {
  const companyId = req.params.companyId;
  const paymentHeadId = req.params.paymentHeadId;
  const updateData = {};

  req.body.title ? (updateData.title = req.body.title) : "";
  req.body.type ? (updateData.type = req.body.type) : "";

  try {
    if (!commonFunction.isEmpty(updateData)) {
        // Return Promise If the title is already exists or not while update the payment heads
        var promise = PaymentHead.findOne({
          "companyId": ObjectID(companyId),
          title: updateData.title
        });
        return promise.then(foundTitle => {
          if (foundTitle) {
            if(foundTitle._id != paymentHeadId){
              return res.send({
                status: "error",
                message: `Company Payment Heads Title ${updateData.title} already taken`
              });
            }
          }
            return PaymentHead.findOneAndUpdate(
              { companyId: ObjectID(companyId), _id: ObjectID(paymentHeadId) },
              updateData,
              { new: true }
            ).then(updatedPaymentHead => {
              // Update Meta data and Trno
              updatedPaymentHead.metaData.createdAt = MetaData.dateInfo();
              updatedPaymentHead.metaData.createdBy = companyId;
              updatedPaymentHead.trno = MetaData.getCurrentTrno();
              updatedPaymentHead.save();
              return res.send({
                status: "success",
                message: "Company Payment Head Updated Successfully",
                data: updatedPaymentHead
              });
            });
        });
    } else {
      return res.send({
        status: "error",
        message: "Please Update the Values too see Changes"
      });
    }
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

// List all the Payment Heads of an individual company
module.exports.listAllPaymentHeads = async function(req, res) {
  try {
    const paymentHeadList = await PaymentHead.find({
      companyId: req.params.companyId
    });
    res.send({
      status: "success",
      message: "Payment Head List Success",
      data: paymentHeadList
    });
  } catch (err) {
    res.send({ status: "error", message: err.message });
  }
};

// Delete the Payment Head
module.exports.deletePaymentHead = async function(req, res) {
  const paymentHeadId = req.params.paymentHeadId;
  try {
    const deletedPaymentHead = await PaymentHead.deleteOne({
      _id: ObjectID(paymentHeadId)
    });
    if (deletedPaymentHead.deletedCount === 0) {
      res.send({
        status: "error",
        message:
          "No Company Payment Head To Delete. Please Check Your Payment Head Id"
      });
    } else {
      res.send({
        status: "success",
        message: "Payment Head Deleted Successfully"
      });
    }
  } catch (err) {
    res.send({ status: "error", message: err.message });
  }
};

// List Individual Payment Head List
module.exports.paymentHeadDetails = async function(req, res) {
  try {
    var paymentHeadDetails = await PaymentHead.findById({
      _id: ObjectID(req.params.paymentHeadId)
    });
    return res.send({
      status: "success",
      message: "Individual Payment Head list success",
      data: paymentHeadDetails
    });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

// List all the Payment Heads according to grade rule
module.exports.filterPaymentHeads = async function(req, res) {
  try {
    let gradePayementHeadDetails = await GradeRule.findById({_id: ObjectID(req.params.gradeRuleId)});
    let paymentHeadList = await PaymentHead.find({
      companyId: req.params.companyId
    });

    for(let i = 0; i < gradePayementHeadDetails.paymentHeads.length; i++){
      for(let j = 0; j < paymentHeadList.length; j++){
        if( (gradePayementHeadDetails.paymentHeads[i].paymentHeadId).toString() == (paymentHeadList[j]._id).toString() ){
          paymentHeadList.splice(j,1);
        }
      }
    }
    res.send({
      status: "success",
      message: "Payment Head List Success",
      data: paymentHeadList
    });
  } catch (err) {
    res.send({ status: "error", message: err.message });
  }
};