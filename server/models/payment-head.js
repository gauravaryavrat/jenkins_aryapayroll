const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
const validator = require("validator");
const sanitize = require("mongo-sanitize");
const logger = require("../utils/logger")(module);
const UiOptions = require("./ui-options");
const MetaData = require("./meta-data");
const ObjectID = require("mongodb").ObjectID;

const paymentHeadSchema = new Schema({
  companyId: { type: ObjectId },
  metaData: MetaData.schema,
  trno: Number,
  title: {
    type: String,
    required: ["Company Payement Heads Title Must Given"]
  },
  type: {
    type: String,
    enum: ["Addition", "Deduction"]
  },
  parentId: ObjectId //ObjectID of another Payment Head
});

// /////////////////////////////////
// PROPERTIES
// /////////////////////////////////

paymentHeadSchema.statics.addPaymentHead = function addPaymentHead(data) {
  title = sanitize(data.title);
  const promise = this.findOne({
    companyId: ObjectID(data.companyId),
    'title': { $regex:  title, $options: 'i'}
  });
  return (
    promise
      .then(foundTitle => {
        if (foundTitle) {
          throw new Error(`Company Payment Heads Title ${title} already taken`);
        } else {
          const PaymentHead = mongoose.model("PaymentHead", paymentHeadSchema);
          const newPaymentHead = new PaymentHead();
          newPaymentHead.metaData = new MetaData();
          //Add Meta Data For Payment Heads
          newPaymentHead.metaData.createdBy = data.companyId;
          newPaymentHead.metaData.createdAt = MetaData.dateInfo();
          // Add Payment Head Details
          newPaymentHead.companyId = data.companyId;
          newPaymentHead.trno = MetaData.getCurrentTrno();
          newPaymentHead.title = data.title;
          newPaymentHead.type = data.type;
          newPaymentHead.parentId = data.parentId;

          return newPaymentHead;
        }
      })
      // save the company payment head details
      .then(newPaymentHead => {
        return newPaymentHead
          .save()
          .then(savedPaymentHead => {
            logger.info(
              "********  COMPANY PAYMENT HEAD ADDED SUCCESSFULLY ********",
              savedPaymentHead.title
            );
            return { paymentHead: savedPaymentHead };
          })
          .catch(function(err) {
            throw new Error(err.message);
          });
      })
  );
};

module.exports = mongoose.model("PaymentHead", paymentHeadSchema);
