"use strict";
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const logger = require('./utils/logger')(module);
const AndroidNotify = require('./lib/android-notification')
    // Generate trno
module.exports.getCurrentTrno = function getCurrentTrno() {
    const newDate = new Date();
    return Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds());
}

//notification 
module.exports.GenNoti = async function GenNoti(data, req, res) {
    try {
        let notificationInfo1;
        var data = {
            cloud_key_to_notify: data.cloud_key_to_notify,
            os_type: data.os_type,
            notification: {
                title: data.title,
                body: data.body,
            }
        }
        if (data.os_type === 'a') {
            notificationInfo1 = await AndroidNotify.sendNotifications(data);
            if (notificationInfo1.successCount === 1) {
                // await notiSave.create(data);
                logger.info('Notification send successfully!!!');
                // return res.send({ message: "Notification send successfully!!!", data: data })
            }
        }
    } catch (error) {
        console.log(error);
        logger.info({ status: 'error', message: error.message });
        // return res.send({ status: 'error', message: error.message });
    }
}