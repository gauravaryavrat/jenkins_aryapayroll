'use strict';

var cron = require('node-cron');
var Promise = require('bluebird');
var guruSettings = require('../server/models/guru-settings');
var FsqrQueue = require('../server/models/foursquare-queue');
var OrderNotificationSettings = require('../server/models/business/restaurant_admin/order-notification-preferences');
var logger = require('../utils/logger')(module);
//for scraping
const restaurantController = require('../server/controllers/restaurant-controller');
logger = require('../utils/logger')(module);
var sem = require('semaphore')(1);  // only one instance of semaphore is allowed
const Sequelize = require('sequelize');
var crypto = require('./crypto');
const dwolla = require('./dwolla');
const OrdersLib = require('./orders');
const moment = require('moment');
const  config = require('../server/config');
const Orders = require('../server/models/orders')(global.sequelize, Sequelize.DataTypes);
const restaurantAdminSchema = require('../server/models/business/restaurant_admin/restaurant_admin');
//for rating reminders
const ratingReminder = require('../server/controllers/rating-reminder-controller');
const User = require('../server/models/user');
const setting = require('../server/models/business/setting');
const ScheduledJobs = require('../server/models/common/scheduled-jobs');

//for scraping
const searchController = require('../server/controllers/search-controller');

//for discount notifications
const notificationController = require('../server/controllers/notification-controller');

//for expiring credit reversals
const creditController = require('../server/controllers/credit-controller');

module.exports.startAutoUpdateVenueDetails = function () {
    const expression = "0 23 * * *";
    if (cron.validate(expression)) {
        logger.info(`[AutoUpdateVenueDetails] - Cron scheduled for auto Update Venue Details (${expression})`);
        global.autoUpdateVenueDetailsCron = cron.schedule(expression, function () {
          autoUpdateVenueDetails();
        }, true);
    } else {
        logger.error(`invalid cron expression: ${expression}`);
    }
}

const autoUpdateVenueDetails = async () => {
  logger.info("[AutoUpdateVenueDetails] - Auto update venue details starts");

  let queue    = await FsqrQueue.get();
  let newQueue = [...queue];

  if (queue && queue.length){
    for (var i = 0; i < queue.length; i++){
      let id = queue[i];
      try {
        let res = await restaurantController.getVenueData(null, id, {returnErr : true});
        logger.info("[AutoUpdateVenueDetails] - Update venue Details CRON : updated venue :  " + id);
        newQueue = newQueue.filter(i => i != id);
      } catch(e) {
        if (e && e.error && e.error.meta && e.error.meta.errorType){
          logger.info("[AutoUpdateVenueDetails] - Update venue Details CRON : updated total - " + i);
          logger.error("[AutoUpdateVenueDetails] - Update venue Details CRON stopped due to " + e.error.meta.errorType);
          break;
        } else {
          logger.error("[AutoUpdateVenueDetails] - Update venue Details CRON stopped due to unknown :" + e);
        }
      }
    }
  }
  logger.info("[AutoUpdateVenueDetails] - Update venue Details CRON : remaining - " + newQueue);
  FsqrQueue.set(newQueue);
}

var processAch = function () {
    sem.take(function () {
        Orders.getPendingOrdersForPayout().then(function (orderData) {
            var restaurantData = {};

            //fetch all restaurant admins whose status is active and payment method is ach and funding source url is not null
            orderData.forEach(function (item, index) {
                var fields = item.dataValues;
                if (restaurantData[fields.venue_id] && restaurantData[fields.venue_id]['amount']) {
                    var amount = restaurantData[fields.venue_id]['amount'];
                    restaurantData[fields.venue_id].amount = eval(amount + parseFloat(fields.total_price));
                    restaurantData[fields.venue_id].orderIds.push(fields.order_id);
                } else {
                    restaurantData[fields.venue_id] = {
                        amount: parseFloat(fields.total_price),
                        orderIds: [fields.order_id],
                        venueId: fields.venue_id
                    };
                }
            });
            return restaurantData;
        }).then(function (restaurantData) {

            restaurantAdminSchema.getAchRestaurants().then(function (restaurants) {
                restaurants.forEach(function (restaurant, index) {
                    if(restaurantData[restaurant.venueId]){
                        restaurantData[restaurant.venueId]['fundingSourceUrl'] = restaurant.payments.ACHFundingSourceUrl;
                    }
                });
                return restaurantData;
            }).then(function (restaurantData) {
                //filter out all restaurants whose fundingsourceurl do not exists, means they are not eligible for mass payment on dwolla
                var achRestaurants = [];
                for (var venueId in restaurantData) {
                    if (restaurantData.hasOwnProperty(venueId)) {
                        if (restaurantData[venueId].fundingSourceUrl) {
                            achRestaurants.push(restaurantData[venueId]);
                        }
                    }
                }

                var paymentLineItems = [];
                var paymentCorrelationID = crypto.randomString();
                //iterate over each restaurant and create a payment item
                achRestaurants.forEach(function (restaurant, index) {
                    var itemCorrelationID = crypto.randomString();
                    var paymentLineItem = {
                        "_links": {
                            "destination": {
                                "href": restaurant.fundingSourceUrl
                            }
                        },
                        "amount": {
                            "currency": "USD",
                            "value": parseFloat(restaurant.amount)
                        },
                        "metadata": {
                            "correlationID": itemCorrelationID,
                            "venueId" : restaurant.venueId
                        }
                    };
                    console.log(restaurant);
                    //Set order status to pending and set item_correlation field
                    restaurant.orderIds.forEach(function(orderID, index){
                        Orders.update({
                            venue_payment_status: 'transfer-created',
                            payment_item_correlation_id: itemCorrelationID,
                            payment_correlation_id: paymentCorrelationID
                        },{where: {order_id: orderID}})
                            .catch(function (err) {
                               logger.error(err.stack);
                        });
                    });

                    paymentLineItems.push(paymentLineItem);
                });

                if(paymentLineItems.length > 0){
                    guruSettings.getFundingSourceId().then(function (settings) {
                        if (Object.keys(settings).length === 0) {
                            sem.leave();
                            return "Invalid Dwolla funding source id";
                        } else {
                            dwolla.getAppToken().then(function (appToken) {
                                dwolla.getFundingSourceDetailById(appToken, settings[0].fundingSourceId).then(function (adminFundingSource) {
                                    var adminFundingSourceUrl = adminFundingSource._links.self.href;

                                    //logger.info(adminFundingSourceUrl);
                                    var massPaymentData = {};
                                    massPaymentData.adminFundingSourceUrl = adminFundingSourceUrl;
                                    massPaymentData.paymentLineItems = paymentLineItems;
                                    massPaymentData.paymentCorrelationID = paymentCorrelationID;
                                    logger.info(massPaymentData);
                                    dwolla.createMassPayment(appToken, massPaymentData).then(function (massPaymentUrl) {
                                        logger.info(`Dwolla Mass Payment request success: ${massPaymentUrl}`);
                                        sem.leave();
                                    }).catch(function (error) {
                                        logger.error(error.message);
                                        sem.leave();
                                    });
                                }).catch(function (error) {
                                    logger.error(error.message);
                                    sem.leave();
                                });
                            }).catch(function (error) {
                                logger.error(error.message);
                                sem.leave();
                            });
                        }
                    });
                } else {
                    logger.info(`No payment has to be made for orders till ${Date.now()}`);
                    sem.leave();
                    return true;
                }
            });
        }).catch(function (error) {
            logger.error(error.message);
            sem.leave();
        });

    });
}

module.exports.processAch = processAch;

var startRestaurantBatchPaymentCron = function () {
    guruSettings.getBatchPaymentTime().then(function (settings) {
        var time = {
            hh: 12,
            mm: 0
        };

        if (Object.keys(settings).length > 0) {
            var batchPaymentTime = settings[0].batchPaymentTime;
            var splitedTime = batchPaymentTime.split(":", 2);
            time = {
                hh: parseInt(splitedTime[0]),
                mm: parseInt(splitedTime[1])
            };
        }

        const expression = time.mm + " " + time.hh + " * * *";

        if (cron.validate(expression)) {
            logger.info(`cron scheduled for ${batchPaymentTime}`);
            global.restaurantBatchPaymentCron = cron.schedule(expression, function () {
                logger.info("batch payment successfully started");
                processAch();
            }, true);
        } else {
            logger.error(`invalid cron expression: ${expression}`);
        }
    });
}

module.exports.startRestaurantBatchPaymentCron = startRestaurantBatchPaymentCron;


/* rating reminders ; set the cron which first checkes if setting flag is on or off */
var startSendRatingRemindersCron = function () {
    setting.getRatingReminderData().then(function (settings) { //if flag is set, send reminders
      let jsonsettings = JSON.parse(settings);
      var time = { //cron runs at 0 and 30 minute of every hour
          hh: "*",
          mm: "0,30"
      };
      const expression = time.mm + " " + time.hh + " * * *";

      if (cron.validate(expression)) {
        logger.info("rating reminder cron scheduled for ",expression);
        global.sendRatingRemindersCron = cron.schedule(expression, function () {
          let minhours = jsonsettings.ratingReminderMinHours || 4;
          processRatingReminders(jsonsettings.ratingReminderFlag,minhours);
        }, true);
      } else {
          logger.error(`invalid cron expression: ${expression}`);
      }
    });
}

module.exports.startSendRatingRemindersCron = startSendRatingRemindersCron;

//send reminder mails to users who have not rated a restaurant after having meal
//minhours is the hours after posting a rating after which only rating remonder can be sent
//user notifications times are in utc and in 24 hours format
var processRatingReminders = function (ratingReminderFlag,minhours) {
    sem.take(function () {
      if(ratingReminderFlag){ //send remnder only if this is set to true
    //decide current mealtime based on current time
        //get start and end period with a gap of30 minutes in 24 hour units, this is utc time since user stored time is also utc.
        let currentTimeStart = getCurrentTimeStart();
        let currentTimeEnd   = getCurrentTimeEnd();
        logger.info("rating reminder currentTimeStart = ",currentTimeStart, " and currentTimeEnd=",currentTimeEnd);

        ratingReminder.getUserForRatingReminders(minhours).then(userData => {
        //the mealtime mentioned in the notification will be what the user wants for the current time
        //user specified time should fall between now and next 30 minutes.
          var reminderData=[] ;
          const mealtimeArr=["breakfast","lunch","dinner"] ;
          let defaultBreakfastTime = config.defaults.notificationBreakfastTime || "09:00";
          let defaultLunchTime = config.defaults.notificationLunchTime || "13:00" ;
          let defaultDinnerTime = config.defaults.notificationDinnerTime || "19:00";

         for(let i=0; i<3; i++){
            reminderData[i] = new Array(); //index 0 for email, 1 for phone and 2 for in-app
            for(let j=0; j<3; j++){ //index 0 for breakfast, 1 for lunch, 2 for in-app
              reminderData[i][j] = new Array();
            }
          }
            JSON.parse(userData).forEach(function (item, index) {
//                logger.info(`may be sending rating reminder to `,item.local.email," with id=",item._id);
                let enableNotification = true;
                //dont send any notifications if all notifications are disabled
                if(item && item.profile && item.profile.notifications && item.profile.notifications.all &&  item.profile.notifications.all.enableNotification==false ){
                  enableNotification = false;
                }
                if(enableNotification){
                  let ratingReminderData = ''; //gets set if specific notifications have been set
                  if(item && item.profile && item.profile !="undefined" && item.profile.notifications && item.profile.notifications!="undefined" && item.profile.notifications.postMealRatingReminders &&  item.profile.notifications.postMealRatingReminders!="undefined"){
                    ratingReminderData = item.profile.notifications.postMealRatingReminders;
                  }
                  //if specific not set, so use defaults and check, else use specifics
                  let userBreakfastTime = ratingReminderData!='' && ratingReminderData.breakfast && ratingReminderData.breakfast!="undefined"  && ratingReminderData.breakfast.mealTime  || defaultBreakfastTime;
                  let userLunchTime = ratingReminderData!='' && ratingReminderData.lunch && ratingReminderData.lunch!="undefined"  && ratingReminderData.lunch.mealTime || defaultLunchTime;
                  let userDinnerTime = ratingReminderData!='' && ratingReminderData.dinner && ratingReminderData.dinner!="undefined"  && ratingReminderData.dinner.mealTime  || defaultDinnerTime;
                  let currentMealTime = null;
                logger.info("userBreakfastTime=",userBreakfastTime);
                  if( userBreakfastTime >= currentTimeStart && userBreakfastTime < currentTimeEnd && (ratingReminderData=='' || ratingReminderData.breakfast.enableNotification==true)){
                    currentMealTime = "breakfast";
                  }
                  else if( userLunchTime >= currentTimeStart && userLunchTime < currentTimeEnd && (ratingReminderData=='' || ratingReminderData.lunch.enableNotification==true)){
                    currentMealTime = "lunch";
                  }
                  else if( userDinnerTime >= currentTimeStart && userDinnerTime < currentTimeEnd && (ratingReminderData=='' || ratingReminderData.dinner.enableNotification==true)){
                    currentMealTime = "dinner";
                  }
                  if(currentMealTime!=null){
                     logger.info(`definitely sending rating reminder to `,item.local.email," with id=",item._id," for mealtime=",currentMealTime);
                     if(item.profile){
                       if((ratingReminderData=='' || item.profile.notifications.postMealRatingReminders.notifyType.email == true) && item.local && item.local.email ){
                          logger.info(`will be sending rating reminder by email to `,item.local.email, "for mealtime=",currentMealTime);
                          reminderData[0][mealtimeArr.indexOf(currentMealTime)].push(item.local.email);
                       }
                       if((ratingReminderData=='' || item.profile.notifications.postMealRatingReminders.notifyType.textMessage == true) && item.profile && item.profile.contactInfo && item.profile.contactInfo.phone && item.profile.contactInfo.phone!="" ){ //phone number has been defined
                          logger.info("will be sending rating reminder by phone to ",item.profile.contactInfo.phone," for user=",item.local.email," for mealtime=",currentMealTime);
                          reminderData[1][mealtimeArr.indexOf(currentMealTime)].push(item.profile.contactInfo.phone);
                       }
                       if(ratingReminderData=='' || item.profile.notifications.postMealRatingReminders.notifyType.inApp == true  ){
                          logger.info(`will be sending rating reminder via inapp notifications to `,item.local.email," for mealtime=",currentMealTime," for userid=",item._id);
                          reminderData[2][mealtimeArr.indexOf(currentMealTime)].push(item._id);
                       }
                     } else{
                       logger.info('ODDDD NO PROFILE, hence no rating reminders notifications ',item.local.email);
                     }
                  } //current mealtime is not null
                  else{
                    logger.info('NOT sending rating reminder because current mealtime is coming as null.r ',item.local.email);
                  }
                } //notifications enabled
                else{
                  logger.info('NOT sending rating reminder because all notifications are disabled for ',item.local.email);
                }
            });
            return reminderData;
        }).then(function (reminderData) {
                logger.info(`going to call actual sending of reminders `);
                ratingReminder.sendRatingReminders(reminderData)
                logger.info(`createRatingReminder completion success: `);
                sem.leave();
        }).catch(function (error) {
            logger.error(error.message);
            sem.leave();
        });
       } else { //dont send any reminders
            logger.error(`rating reminders are set to disabled, not sending any`);
            sem.leave();
       }
    });
}

//return in 24 hour units, of utc
function getCurrentTimeStart() {
    var d = new Date();
    var h = d.getUTCHours();
    var m = d.getUTCMinutes();
/*      var ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12;
      h = h ? h : 12; // the hour '0' should be '12' */
      h = h < 10 ? "0" + h : h; //prefix hour with 0, so that 09:30am < 10:00 am
    if(m<30){
         m="00";
    }
    else{
        m="30"
    }
//    return h + ":" + m +ampm;
    return h + ":" + m;

}
//return in 24 hour units of utc
function getCurrentTimeEnd() {
    var d = new Date();
    var h = d.getUTCHours();
    var m = d.getUTCMinutes();
/*      var ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12;
      h = h ? h : 12; // the hour '0' should be '12'
*/    if(m<30){
         m="30";
    }
    else if(m>30 && h>=23){ //stay in same day
         m="59";
    }
    else{
        h=parseInt(h)+1;
        m="00"
    }
      h = h < 10 ? "0" + h : h; //prefix hour with 0, so that 09:30am < 10:00 am
//    return h + ":" + m +ampm; //return 24 hour unit
    return h + ":" + m ;
}

module.exports.processRatingReminders = processRatingReminders;

var startRestaurantScrapingCron = function (db) {
    var time = { //not sure about this, but asumesthis meansthat cron runs at 23 00
        hh: 23,
        mm: 0
    };
    const expression = time.mm + " " + time.hh + " * * *";

    if (cron.validate(expression)) {
        logger.info("startRestaurantScraping cron scheduled for ",expression);
       global.startRestaurantScrapingCron = cron.schedule(expression, function () {
               searchController.startRestaurantScraping(db);
          logger.info("cron for scraping venues successfully completed");
        }, true);
    } else {
        logger.error(`invalid cron expression: ${expression}`);
    }
}

module.exports.startRestaurantScrapingCron = startRestaurantScrapingCron;


var startMenuScrapingCron = function (db) {
    var time = { //not sure about this, but asumesthis meansthat cron runs at 23 10
        hh: 23,
        mm: 10
    };
    const expression = time.mm + " " + time.hh + " * * *";

    if (cron.validate(expression)) {
        logger.info("startMenuScrapingCron cron scheduled for ",expression);
       global.startMenuScrapingCron = cron.schedule(expression, function () {
               searchController.startMenuScraping(db);
          logger.info("cron for scraping menus successfully completed");
        }, true);
    } else {
        logger.error(`invalid cron expression: ${expression}`);
    }
}

module.exports.startMenuScrapingCron = startMenuScrapingCron;

var salespersonPaymentCron = function () {
    const expression = "0 0 1-7,15-21 * 3";

    if (cron.validate(expression)) {
        logger.info("salesperson payment cron scheduled for ",expression);
            cron.schedule(expression, function () {
                logger.info("cron for salesperson payment successfully completed");
            }, true);
    } else {
        logger.error(`invalid cron expression: ${expression}`);
    }
}

module.exports.salespersonPaymentCron = salespersonPaymentCron;

/* cron to pass reversal entries for expired credits to qb */
var startReverseExpiredCreditCron = function (db) {
    var time = {
        hh: 5,
        mm: 10
    };
    const expression = time.mm + " " + time.hh + " * * *";

    if (cron.validate(expression)) {
       logger.info("startCreditExpireCron cron scheduled for ",expression);
         global.startReverseExpiredCreditCron = cron.schedule(expression, function () {
               creditController.reverseExpiredRestaurantCredit();
          logger.info("cron for reverseExpiredCredit successfully completed");
        }, true);
    } else {
        logger.error(`invalid cron expression: ${expression}`);
    }
}

module.exports.startReverseExpiredCreditCron = startReverseExpiredCreditCron;


/* discount notifications; set the cron which first checks if setting flag is on or off */
var startSendDiscountNotificationsCron = function () {
    logger.info("in startSendDiscountNotificationCron");
    setting.getDiscountNotificationsData().then(function (settings) { //if flag is set, send reminders
        let jsonsettings = JSON.parse(settings);
        logger.info("in startSendDiscountNotificationCron sending discount notifications ");
        var time = { //cron runs at time gap specified by admin
            hh: "*",
            mm: "*/"+jsonsettings.discountLocationMin
        };
        const expression = time.mm + " " + time.hh + " * * *";

        if (cron.validate(expression)) {
          logger.info("sending discount notification scheduled for ",expression);
          global.sendDiscountNotificationsCron = cron.schedule(expression, function () {
            processDealsNotifications(jsonsettings.discountNotificationFlag);
            processCreditsNotifications(jsonsettings.discountNotificationFlag);
           }, true);
        } else {
            logger.error(`invalid cron expression: ${expression}`);
        }
    });
}

module.exports.startSendDiscountNotificationsCron = startSendDiscountNotificationsCron;

module.exports.masterCronEveryMinute = function () {
    const expression = "* * * * *";
    if (cron.validate(expression)) {
        logger.info(`[masterCronEveryMinute] - Cron scheduled for every minute (${expression})`);
        global.masterCronEveryMinute = cron.schedule(expression, function () {
            var currentTime = moment(Date.now()).utc().format('Y-MM-DD H:m');
            logger.info(currentTime);
            ScheduledJobs.find({dateTime:currentTime}).then(currentJobs => {
                logger.info(`${currentJobs.length} Notifications will be fired`)
                currentJobs.forEach(function(job){
                    if(job.type == 'OrderNotifications'){
                        if(job.jobData && job.jobData.event){
                            OrdersLib.triggerNotificationsFromCron(job.jobData);
                        }
                    }
                });
            })
        }, true);
    } else {
        logger.error(`invalid cron expression: ${expression}`);
    }
}

//send discount notifications (deals)
//get users who have to be sent notifications
//get venues where deals are available
var processDealsNotifications = async function (discountNotificationFlag) {
    sem.take(async function () {
      if(discountNotificationFlag) {//send discount notifications only if set to true
        await processDeals();
        sem.leave();
      } else {
          logger.error(`Discount Notificationset is disabled by platerate admin, not sending any`);
          sem.leave();
      }
    });
}
//send discount notifications (credits)
//get users who have to be sent notifications
//get venues where credits are available
var processCreditsNotifications = async function (discountNotificationFlag) {
    sem.take(async function () {
      if(discountNotificationFlag) {//send discount notifications only if set to true
        await processCredits();
        sem.leave();
      } else {
          logger.error(`Discount Notificationset is disabled by platerate admin, not sending any`);
          sem.leave();
      }
    });
}

async function processDeals(){
    let usersData = await notificationController.getUsersForDiscountNotifications("deal");
    //foreach user, find list of venues closeby where deals are available and randomly select one and send deal notification
    if(usersData ){
      let usersjson = JSON.parse(usersData);
      for(let user of usersjson) {
          logger.info("Push notification for deal to",user.email," with id=",user.userId); //this returns user.email and userId
          if(user.profile.notifications && user.profile.notifications.deal && user.profile.notifications.deal.enableNotification ==true){
            let retval = await notificationController.pushDiscountNotificationsByCron("deal",user);
            logger.info("Push notification for deal done to",user.email," with id=",user.userId," with return value=",retval); //this returns user.email and userId
          }
        }
     }
     else{
          logger.info(`No users found for deals notifications: `);
     }
}

async function processCredits(){
    let usersData = await notificationController.getUsersForDiscountNotifications("credit");
      //foreach user, find list of venues closeby where credits are available and randomly select one and send deal notification
    if(usersData ){
      let usersjson = JSON.parse(usersData);
      for(let user of usersjson) {
        logger.info("Push notification for credit to",user.email," with id=",user.userId);
        if(user.profile.notifications && user.profile.notifications.credit && user.profile.notifications.credit.enableNotification ==true){
          let retval = await notificationController.pushDiscountNotificationsByCron("credit",user);
          logger.info("Push notification for credit done to",user.email," with id=",user.userId," with return value=",retval); //this returns user.email and userId
        }
        else{
          logger.info("Push notification for credit to",user.email," is disabled");
        }
      }
   }
   else{
        logger.info(`No users found for deals notifications: `);
   }
}
