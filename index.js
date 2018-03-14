'use strict';

const q = require('q');
const rp = require("request-promise");
const _ = require('lodash');
const apiKey = '';
const baseUrl = '';     

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}
 
// --------------- Events -----------------------
 
function dispatch(intentRequest, callback) {
    console.log(`request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
    console.log(JSON.stringify(intentRequest));
    const sessionAttributes = intentRequest.sessionAttributes;
   
    const slots = intentRequest.currentIntent.slots;

    const moodType = slots.moodType;
    const livingRoomStatus = slots.onOff;
    const frontLightStatus = slots.onOff;
    const resultPromise = q.defer();

    if(intentRequest.currentIntent.name == 'SetMood'){
        commandCenterFunctions[moodType]();
        callback(close(sessionAttributes, 'Fulfilled',
        {'contentType': 'PlainText', 'content': `Setting the mood lighting to ${moodType}`}));
    } else if(intentRequest.currentIntent.name == 'LivingRoomControl'){
        livingRoomFunctions[livingRoomStatus]();
        callback(close(sessionAttributes, 'Fulfilled',
                {'contentType': 'PlainText', 'content': `Setting living room ${livingRoomStatus}`}));
    } else if(intentRequest.currentIntent.name == 'FrontLight'){
        frontLightFunctions[frontLightStatus]();
        callback(close(sessionAttributes, 'Fulfilled',
                {'contentType': 'PlainText', 'content': `Setting front light ${frontLightStatus}`}));
    } else if(intentRequest.currentIntent.name == 'TemperatureSensor'){
        getRoomTemperature().then(body => {
            let tempInFaren = body.temperature.alexaSpokenValue;
            resultPromise.resolve();

            callback(close(sessionAttributes, 'Fulfilled',
                {'contentType': 'PlainText', 'content': `${tempInFaren}`}));
            });     
    } else if(intentRequest.currentIntent.name == 'Status'){
        getStatus().then(status => {
            var formattedStatus = formatStatus(status);
            callback(close(sessionAttributes, 'Fulfilled',
                {'contentType': 'PlainText', 'content': `${formattedStatus}`}));
        }).catch(function (err) {
            callback(close(sessionAttributes, 'Fulfilled',
                {'contentType': 'PlainText', 'content': `err`}));
        });
    }

}

function getStatus(){
    const options = {
        uri: `${baseUrl}/status?apiKey=` + apiKey,
        json: true 
    };

    return rp(options)
}

function formatStatus(status){
    var result = '';
    _.forEach(status, function(value) {
        result += `${value}\n`;
    });

    return result;
}

function getRoomTemperature(){
    const options = {
        uri: `${baseUrl}/sensor/?apiKey=${apiKey}`,
        json: true 
    };

    return rp(options);
}

let commandCenterFunctions = {
    "gaming" : function(){
        const options = {
            uri: `${baseUrl}/commandcenter/mood/gaming?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    },
    "movies" : function(){
        const options = {
            uri: `${baseUrl}/commandcenter/mood/movies?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    },
    "normal" : function(){
        const options = {
            uri: `${baseUrl}/commandcenter/mood/normal?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    },
    "off" : function(){
        const options = {
            uri: `${baseUrl}/commandcenter/mood/off?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    }
}

let livingRoomFunctions = {
    "on" : function(){
        const options = {
            uri: `${baseUrl}/livingroom/on?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    },
    "off" : function(){
        const options = {
            uri: `${baseUrl}/livingroom/off?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    }
}

let frontLightFunctions = {
    "on" : function(){
        const options = {
            uri: `${baseUrl}/frontlight/on?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    },
    "off" : function(){
        const options = {
            uri: `${baseUrl}/frontlight/off?apiKey=${apiKey}`,
            json: true 
        };

        return rp(options);
    }
}
 
// --------------- Main handler -----------------------
 
// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};