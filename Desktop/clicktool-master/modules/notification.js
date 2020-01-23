var FCM = require('fcm-node');
var serverKey = 'AIzaSyBRGMO2GraIVB7Rhqw-8XRSROehNU2oeBc'; //put your server key here
var fcm = new FCM(serverKey);
var sendNotificaiton = function (tokens, notificationParamsObject, callback) {
    var message = {//this may vary according to the message type (single recipient, multicast, topic, et cetera)
//        to: 'f9Xrz4qqjn0:APA91bFMonCBUdxQMCgXFkCDAqAFy88G9n0KT4aOSe9QI8ZtqyrBNOs0QS2ufyXv285ez4eKTmZ7T_yI_wu4jC9zuPMoMAegjLV8lftzONuMc-2D9QPXqHfV2BJwckYrpYZ63ORyix-cFmJ7yuRmkGHkH6pjy6kgmQ',
        to: tokens,
//        collapse_key: 'your_collapse_key',

//        notification: {
//            title: 'Title of your push notification',
//            body: 'Body of your push notification'
//        },

        notification: {//you can send only notification or only data(or include both)
            id: (notificationParamsObject._id) ? notificationParamsObject._id : "",
            title: (notificationParamsObject.title) ? notificationParamsObject.title : "",
            type: (notificationParamsObject.type) ? notificationParamsObject.type : "",
            message: (notificationParamsObject.message) ? notificationParamsObject.message : "",
            timestamp: (notificationParamsObject.createdAt) ? notificationParamsObject.createdAt : "",
            userid: (notificationParamsObject.memberId) ? notificationParamsObject.memberId : "",
            data: (notificationParamsObject.data) ? notificationParamsObject.data : {},
        },

        data: {//you can send only notification or only data(or include both)
            id: (notificationParamsObject._id) ? notificationParamsObject._id : "",
            title: (notificationParamsObject.title) ? notificationParamsObject.title : "",
            type: (notificationParamsObject.type) ? notificationParamsObject.type : "",
            message: (notificationParamsObject.message) ? notificationParamsObject.message : "",
            timestamp: (notificationParamsObject.createdAt) ? notificationParamsObject.createdAt : "",
            userid: (notificationParamsObject.memberId) ? notificationParamsObject.memberId : "",
            data: (notificationParamsObject.data) ? notificationParamsObject.data : {},
        }
    };
    fcm.send(message, function (err, response) {
        if (err) {
            ("Something has gone wrong!", err);
            callback(err);
        } else {
            ("Successfully sent with response: ", response);
            callback(response);
        }
    });
}

exports.sendNotificaiton = sendNotificaiton;