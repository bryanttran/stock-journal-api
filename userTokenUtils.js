import {getUserToken} from './getUserToken';
import {getNewAccessTokenTD} from './getNewAccessTokenTD';
import {updateUserToken} from './updateUserToken';
import { createUserToken } from './createUserToken';
import moment from 'moment';

export async function validateAccessToken(event) {
    try {
        console.log("***validateAccessToken userTokenUtils.js");
        console.log(event);
        let eventBody = JSON.parse(event.body);

        let userTokenRes = await getUserToken(event); // gets database UserToken record
        console.log(userTokenRes);
        let userTokenBody = JSON.parse(userTokenRes.body);
        console.log(userTokenBody);

        if(userTokenRes.statusCode === 500) { // Creating new record in userToken table
            console.log("Creating new User Token");
            let createResponse = await createUserToken(event);
            console.log(createResponse);
            let createBody = JSON.parse(createResponse.body);
            console.log(createBody);
            return createBody;
        }
        let userTokenatoken = userTokenBody.atoken;
        let userTokenrToken = userTokenBody.rtoken;
        let userTokenId = userTokenBody.userTokenId;
        console.log(`@@@ ${eventBody.atoken} ${userTokenatoken} ${eventBody.rtoken} ${userTokenrToken} ${eventBody.userTokenId} ${userTokenId}`);
        if(eventBody.atoken === userTokenatoken && eventBody.rtoken === userTokenrToken && eventBody.userTokenId === userTokenId) { // validates the access token. Sends back a new token if expired
            console.log(`**valid db check`);
            let aTokenExpireDate = (userTokenBody.lastAccessDate + (29*60*1000));
            if(aTokenExpireDate < Date.now()) { // Expired token, create and return new token
                let newAccessEvent = await getNewAccessTokenTD(userTokenBody);
                console.log(`newAccessEvent.body`);
                let newAccessEventBody = JSON.parse(newAccessEvent.body);
                console.log(newAccessEventBody.atoken);
                eventBody.atoken = newAccessEventBody.atoken;
                event.body = JSON.stringify(eventBody);
                await updateUserToken(event); // updates userToken with new access token
                return {atoken: newAccessEventBody.atoken};
            } else { // valid and not expired token
                console.log("valid and not expired token");
                return true;
            }
        } else { // invalid access, refresh or already invalid.
            console.log(`**invalid db check, updating to invalid DB record`);
            updateUserToken(event, false); // setting token to invalid. Need to reauthenticate.
        }
    } catch(e) {
        console.log(e);
        return false;
    }
    return false;
};

// Function to return new ISO date or ISO date from userToken table
export async function getLastStockDatePull(event) {
    let eventBody = JSON.parse(event.body);
    let userTokenRes = await getUserToken(event); // gets database UserToken record
    let userTokenBody = JSON.parse(userTokenRes.body);
    console.log(userTokenBody);

    if(userTokenBody.lastStockDatePull) return userTokenBody.lastStockDatePull;

    let lastStockDatePull = "";
    console.log(`TEST ${userTokenBody.lastStockDatePull}`);
    if(!userTokenBody.lastStockDatePull) { // first time getting stocks
        console.log("null userTokenBody.lastStockDatePull");
        if(eventBody.tier === "pre") {
            console.log(moment().subtract(1, "month").toISOString());
            lastStockDatePull = moment().subtract(1, "month").toISOString();
        } else if (eventBody.tier === "pro") {
            console.log(moment().subtract(1, "year").toISOString());
            lastStockDatePull = moment().subtract(1, "year").toISOString();
        }
    }
    return lastStockDatePull;
};