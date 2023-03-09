/*
 * Desc: Config.js contains all configuration variables and keys needed in the application
 * Usage: To create a new config key, use config.<your key name >. Then import the config.js in your module
 *
 */

var config = module.exports;
const PRATE_ENV = process.env.PRATE_ENV; //The PRATE_ENV is set by the platerate.env on the AWS instances('test', 'staging', 'production')
const RUNNING_ON_AWS = (PRATE_ENV && PRATE_ENV !== '');


config.express = {
    port: process.env.PORT || 3002,
    ip: '127.0.0.1'
};



config.dbConnection = {
    string: process.env.DB_PR || 'mongodb://localhost:27017/aryaPayroll',
    mongoURI: process.env.DB_PR || 'mongodb://localhost:27017/aryaPayroll',
    mysql: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.SQLDB_USER,
        password: process.env.SQLDB_PASSWORD,
        dbName: process.env.SQLDB_NAME || 'arya_payroll'
    }
};

config.mailgun = {
    key: process.env.MAILGUN_API_KEY,
    attachment_dir: './dist/public/email_attachments/',
};

// Email Provider
config.emailProvider = {
    name: 'PureSMTP',
}

// Sender Email Credentials and configurations
config.smtp = {
    port: "",
    protocol: "",
    service: 'gmail',
    username: 'vikrant.kumar@aryavratinfotech.com',
    password: 'bnsuzdkpyxrtpowz',
    fromEmail: 'vikrant.kumar@aryavratinfotech.com'
}

config.auth = {
    'facebook': {
        'clientID': '1556842837659191', // your App ID
        'clientSecret': '7abd7c14a319fb2cf065a0e4ce476532', // your App Secret
        'callbackURL': process.env.FACEBOOK_AUTH_CB_URL // 'http://localhost:8080/auth/facebook/callback'
    },
    'google': {
        'clientID': '514893100906-v9re7vgp91d54c6s58jroo2lhtvahr4p.apps.googleusercontent.com',
        'clientSecret': 'TNuQ80LETNeGSwqPr_P0ivtt',
        'callbackURL': process.env.GOOGLE_AUTH_CB_URL // 'http://localhost:8080/auth/google/callback'
    },
    'twitter': {
        'consumerKey': 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL': process.env.TWITTER_AUTH_CB_URL // 'http://localhost:8080/auth/twitter/callback'
    }
}
config.google = {
    "googleLatLong": "http://maps.googleapis.com/maps/api/geocode/json",
    "distanceMatrix": "https://maps.googleapis.com/maps/api/distancematrix/json",
    "key": process.env.GOOGLE_MAP_API_KEY, // Deprecated, use maps_key instead
    "maps_key": process.env.GOOGLE_MAP_API_KEY, // "AIzaSyA6c7T6R-2o_IKhRzZdvrhDu7qRyZPm_ek"
};

// Application name
config.applicationName = {
    name: "AryaPayroll",
    homeUrl: 'http://192.168.1.119/users/login'
}

config.email = {
    feedback: 'rajat.jain@aryavratinfotech.com'
}

//defaults
config.defaults = {

}

//Set configs based on production env
if (PRATE_ENV === 'production') {
    config.express.ip = '0.0.0.0'
    config.express.isOnProduction = true;
} else {
    config.express.isOnProduction = false;
}

//Set base url of app
if (PRATE_ENV === 'production') {
    config.base_url = 'https://payroll.aryavratinfotech.com';
} else if (PRATE_ENV === 'staging') {
    config.base_url = 'https://staging-payroll.aryavratinfotech.com';
} else {
    config.base_url = 'https://test-payroll.aryavratinfotech.com';
}


//Set any configs that will need to run if we are running on any of the AWS instances
if (RUNNING_ON_AWS) {
    config.express.staticFilesPath = './dist/public';
} else {
    config.express.staticFilesPath = './public';
}