"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const MetaData = require('./meta-data');
const Utilities = require('../utilities');

const userDeviceSchema = new Schema({
    user_id: ObjectId,
    metaData: MetaData.schema,
    deviceInfo: {
        device_mac_addr: String,
        emei_meid_esn: String,
        device_model: String,
        device_density: String,
        device_resolution: String
    },
    simInfo: {
        sim_serial_number: String,
        sim_mccmnc: String,
        sim_operator_nm: String,
        sim_operator: String,
        sim_network_operator_nm: String,
        sim_network_operator: String,
        sim_country_iso: String
    },
    osInfo: {
        os_type: String,
        os_ver: String,
        os_kernal_ver: String,
        os_build_num: String
    },
    cloudInfo: {
        cloud_key_to_notify: String,
        cloud_key_last_error: String,
        cloud_key_error: String
    },
    locationInfo: {
        current_location_latitude: String,
        current_location_longitude: String,
        current_location_updated_at: String,
    },
    app_client_ver: String,
    current_app_ver: String,
    current_app_client_ver: String,
    country_code: String,
    state_id: String,
    city_id: String,
    status: String,
    remote_device_id: String,
    last_accessed: Date,
    first_app_client_ver: String,
    actions_required: String,
    pending_events: String,
    actions_required_time: String,
    contact_id: String,
    online_status: String,
    source_app: String,
    trno: Number,
});

userDeviceSchema.statics.addDevice = async function(data) {
    try {
        let UserDevice = mongoose.model('user_device', userDeviceSchema);
        let newUserDevice = new UserDevice();
        // Meta Data Info
        newUserDevice.metaData = new MetaData();
        newUserDevice.metaData.createdBy = data.user_id;
        newUserDevice.metaData.createdAt = MetaData.dateInfo();
        newUserDevice.trno = Utilities.getCurrentTrno();
        // Device info
        newUserDevice.deviceInfo = data.deviceInfo;
        // Sim Info
        newUserDevice.simInfo = data.simInfo;
        // OS Info
        newUserDevice.osInfo = data.osInfo;
        // Cloud Info
        newUserDevice.cloudInfo = data.cloudInfo;
        // Location Info
        newUserDevice.locationInfo = data.locationInfo;
        // Other Info
        newUserDevice.user_id = data.user_id;
        newUserDevice.app_client_ver = data.app_client_ver;
        newUserDevice.current_app_ver = data.current_app_ver;
        newUserDevice.current_app_client_ver = data.current_app_client_ver;
        newUserDevice.country_code = data.country_code;
        newUserDevice.state_id = data.state_id;
        newUserDevice.city_id = data.city_id;
        newUserDevice.status = data.status;
        newUserDevice.remote_device_id = data.remote_device_id;
        newUserDevice.last_accessed = data.last_accessed;
        newUserDevice.first_app_client_ver = data.first_app_client_ver;
        newUserDevice.actions_required = data.actions_required;
        newUserDevice.pending_events = data.pending_events;
        newUserDevice.actions_required_time = data.actions_required_time;
        newUserDevice.contact_id = data.contact_id;
        newUserDevice.online_status = data.online_status;
        newUserDevice.source_app = data.source_app;

        // save user device info
        let savedUserDeviceInfo = await newUserDevice.save();
        return savedUserDeviceInfo;

    } catch (error) {
        return error;
    }
}

module.exports = mongoose.model('user_device', userDeviceSchema);