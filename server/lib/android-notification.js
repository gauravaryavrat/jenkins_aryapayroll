"use strict";
const Promise = require('bluebird');
const admin = require("firebase-admin");
admin.initializeApp({});
// Send Notifications
module.exports.sendNotifications = function sendNotifiactions(data) {
    return new Promise(function(resolve, reject) {
        var serviceAccount
        console.log("hi i am andirod");
        serviceAccount = require('../desktractleave-firebase-adminsdk-hy0yt-ea163afc07.json');
        var registrationToken = data.cloud_key_to_notify;
        var payload;

        payload = { data: data.notification };
        var options = {
            priority: "high",
            collapseKey: 'AryaPayroll'
        };
        var notifications = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // databaseURL: databaseURL
        }, `default${Math.floor((Math.random() * 100000000000) + 1)}`);
        // console.log("====================credential================\n", notifications);
        notifications.messaging().sendToDevice(registrationToken, payload, options)
            .then(function(response) {
                resolve(response)
            })
            .catch(function(err) {
                reject(err)
            });
    })
}