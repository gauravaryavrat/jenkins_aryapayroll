const User = require('../server/models/user');
const Promise = require('bluebird');

const ONE_MONTH_AGO = (new Date().valueOf() - 1000 * 60 * 60 * 24 * 30);
const ONE_WEEK_AGO = (new Date().valueOf() - 1000 * 60 * 60 * 24 * 7);

/**
 * Get usage metrics totals
 * @param {Object} db - Db instance from express request
 */
const getUsageTotals = (db) => {
    return Promise.all([
        getTotalUsersRegistered(),
        getTotalUnverifiedUsers(),
        getTotalUsersLoginsWithinOneMonth(),
        getTotalUsersLoginsWithinOneWeek(),
        getTotalItemRatings(db),
        getTotalRestaurantRatings(db),
        getTotalRatingsWithinOneMonth(db),
        getTotalRatingsWithinOneWeek(db),
        getTotalGuruReviews(db),
        getTotalGuruReviewsWithinOneMonth(db),
        getTotalGuruReviewsWithinOneWeek(db),
        getUsersListTotals(db)
    ])
    .then((results) => {
        const response = {
            users : {
                usersRegistered : results[0],
                usersUnverified : results[1],
                usersLoginsInOneMonth : results[2],
                usersLoginsInOneWeek : results[3],
            },
            ratings : {
                itemRatings: results[4],
                restaurantRatings: results[5],
                ratingsInOneMonth : results[6],
                ratingsInOneWeek : results[7],
            },
            guruReviews : {
                guruReviews : results[8],
                guruReviewsWithinOneMonth : results[9],
                guruReviewsWithinOneWeek : results[10]
            },
            individualUsersMetrics: results[11]
        }
        response.ratings.totalRatingsCount = response.ratings.totalItemRatings + response.ratings.totalRestaurantRatings;
        return response;
    })
    .catch((err) => err);
};

//USERS METRICS


/**
 * Get list of users details 
 * @return Array of user details
 */
const getUsersListTotals = (db) => {
    return User.aggregate([
    { $project: {
        "firstName": "$profile.contactInfo.firstName",
        "lastName": "$profile.contactInfo.lastName",
        "email": "$local.email",
        "referralId": "$profile.referralId",
        "permissions": "$profile.groupPermissions"
    }}
    ])
    .then((usersDetails) => {
        return parseUsersDetails(db, usersDetails).then((results) => {
            return results;
        })
    })
};

/**
 * 
 * @param {Array} usersDetails 
 */
const parseUsersDetails = (db, usersDetails) => {
   return Promise.resolve(usersDetails).map((user) => {
        let userDetails = {
            "userId": (user._id).toString(),
            "firstName" : user.firstName || "Unknown",
            "lastName" : user.lastName || "Unknown",
            "email" : user.email || "Unknown",
        };
        //Check if user has any permissions set
        if (user.permissions) {
            //This values could've been generated directly on the aggregation Mongo query, but
            //Not all users have the 'groupPermissions' field on the DB, which causes the $in Aggregation pipeline operator to fail
            userDetails.isUser =  user.permissions.includes("User");
            userDetails.isSalesperson = user.permissions.includes("Salesperson");
            userDetails.isRestaurantAdmin = user.permissions.includes("Restaurant Admin");
        }
        //Retrieve user referral information
        return getUserReferralInfo(user.referralId)
        .then((referralInfo) => {
            userDetails.referralInfo = referralInfo || 'Not Found';
            return userDetails;
        })
        .then((userInfo) => {
            //Get user ratings totals
            return getUserRatingsTotals(db, userDetails.userId);
        })
        .then((ratingRotals) => {
            userDetails.ratingsTotals = ratingRotals || 'No Ratings';
            return userDetails;
        })
    })
};

/**
 * Get all the ratings total for a given user
 * @param {String} userId 
 */
const getUserRatingsTotals = (db, userId) => {
    return Promise.all([
        getTotalItemRatings(db, userId),
        getTotalRestaurantRatings(db, userId),
        getTotalRatingsWithinOneMonth(db, userId),
        getTotalRatingsWithinOneWeek(db, userId),
        getTotalGuruReviews(db, userId),
        getTotalGuruReviewsWithinOneMonth(db, userId),
        getTotalGuruReviewsWithinOneWeek(db, userId)
    ]).then((totals) => {
        return {
            itemRatings: totals[0],
            restaurantRatings: totals[1],
            ratingsInOneMonth : totals[2],
            ratingsInOneWeek : totals[3],
            guruReviews : totals[4],
            guruReviewsWithinOneMonth : totals[5],
            guruReviewsWithinOneWeek : totals[6]
        };
    })
};

/**
 * Find and Get the user details of a given referral Id
 * @param {String} referralId 
 */
const getUserReferralInfo = (referralId) => {
    return User.findOne({"profile.referralId" : referralId}).then((user) => {
        if (!user || !user.contactInfo) return null;
        else return {
                "firstName": user.contactInfo.firstName,
                "lastName": user.contactInfo.lastName,
                "email": user.local.email
            };
    })
};

/*
* Get total of users registered, and verfified email
*/
const getTotalUsersRegistered = () => {
    return User.count({"registrationToken" : { "$eq" : null }})
};

/**
 * Get total users missing email verification 
 */
const getTotalUnverifiedUsers = () => {
    return User.count({"registrationToken" : { "$ne" : null }})
};

/*
* Get total users that logged in within 1 month
*/
const getTotalUsersLoginsWithinOneMonth = () => {
    return User.count({"lastLogin" : { "$gte" : new Date(ONE_MONTH_AGO) }})
};

/*
* Get total users that logged in within 1 week
*/
const getTotalUsersLoginsWithinOneWeek = () => {
    return User.count({"lastLogin" : { "$gte" : new Date(ONE_WEEK_AGO) }})
};

//RATINGS METRICS 
/*
* Get total item ratings reviews entered 
*/
const getTotalItemRatings = (db, userId) => {
   if (userId !== undefined && userId !== null) return db.collection('rating').count({"userId" : userId, "ratingType" : "Menu Item"});
   else return db.collection('rating').count({"ratingType" : "Menu Item"});
};

/*
* Get total restaurant ratings reviews entered 
*/
const getTotalRestaurantRatings = (db, userId) => {
   if (userId !== undefined && userId !== null) return db.collection('rating').count({"userId": userId, "ratingType" : "Restaurant"});
   else return db.collection('rating').count({"ratingType" : "Restaurant"});
};

/**
 * Get total reviews entered last month
 */
const getTotalRatingsWithinOneMonth = (db, userId) => {
   if (userId !== undefined && userId !== null) return db.collection('rating').count({"userId": userId, "dateUpdated" : { "$gte" : new Date(ONE_MONTH_AGO)}});
   else return db.collection('rating').count({"dateUpdated" : { "$gte" : new Date(ONE_MONTH_AGO)}});
};

/**
 * Get total reviews entered in a week month
 */
const getTotalRatingsWithinOneWeek = (db, userId) => {
   if (userId !== undefined && userId !== null) return db.collection('rating').count({"userId": userId, "dateUpdated" : { "$gte" : new Date(ONE_WEEK_AGO)}});
   else return db.collection('rating').count({"dateUpdated" : { "$gte" : new Date(ONE_WEEK_AGO)}});
};

//3. # guru reviews entered total
const getTotalGuruReviews = (db, userId) => {
   if (userId !== undefined && userId !== null) return db.collection('rating').count({"$and" : [{"userId": userId}, {"expertReview" : { "$exists" : true}}, {"ratingType" : "Menu Item"}]});
   else return db.collection('rating').count({"$and" : [ {"expertReview" : { "$exists" : true}}, {"ratingType" : "Menu Item"}]});
};

/** 
* guru reviews entered within on month
*/
const getTotalGuruReviewsWithinOneMonth = (db, userId) => {
   if  (userId !== undefined && userId !== null) {
        return db.collection('rating').count({
       "$and" : [ 
            {"userId": userId},
            {"expertReview" : { "$exists" : true}}, 
            {"ratingType" : "Menu Item"},
            {"dateUpdated" : { "$gte" : new Date(ONE_MONTH_AGO)}}
       ]
     });
   } else {
        return db.collection('rating').count({
            "$and" : [ 
                    {"expertReview" : { "$exists" : true}}, 
                    {"ratingType" : "Menu Item"},
                    {"dateUpdated" : { "$gte" : new Date(ONE_MONTH_AGO)}}
            ]
        });
   }
};

/** 
* guru reviews entered within on month
*/
const getTotalGuruReviewsWithinOneWeek = (db, userId) => {
   if (userId !== null && userId !== undefined) {
        return db.collection('rating').count({
        "$and" : [ 
                {"userId": userId},
                {"expertReview" : { "$exists" : true}}, 
                {"ratingType" : "Menu Item"},
                {"dateUpdated" : { "$gte" : new Date(ONE_WEEK_AGO)}}
            ]
        });
   } else {
        return db.collection('rating').count({
            "$and" : [ 
                    {"expertReview" : { "$exists" : true}}, 
                    {"ratingType" : "Menu Item"},
                    {"dateUpdated" : { "$gte" : new Date(ONE_WEEK_AGO)}}
            ]
        });
   }
};

module.exports = {
    getUsageTotals : getUsageTotals
}

