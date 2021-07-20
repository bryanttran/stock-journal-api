import handler from "./libs/handler-lib";
import fetch from 'node-fetch';
import { decodeAccessJWT } from "./utilsJWT";
import {validateAccessToken} from './userTokenUtils';

export const main = handler(async (event, context) => {
    const TDAcctURL = "https://api.tdameritrade.com/v1/accounts";

    let validTokens = await validateAccessToken(event);
    console.log(`**finished validateAccessToken`);
    console.log(validTokens);
    console.log(validTokens.atoken);
    console.log(validTokens.userTokenId);
    if(validTokens) {
        console.log(`**INSIDE VALID TOKENS`);
    }
    if(validTokens.userTokenId) {
        console.log(`**NEW USER TOKEN ID`);
    }
    if(!validTokens) {
        console.log(`**INVALID TOKENS`);
        return {"invalidRecord": true};
    }
    console.log(event);
    console.log(event.body);
    let body = JSON.parse(event.body);
    console.log(body);

    let decodedAccess = decodeAccessJWT(body.atoken);
    let auth = `Bearer ${decodedAccess}`;
    console.log(auth);
    try {
        let response = await fetch(TDAcctURL, {
            method: "GET",
            headers: {
                "Authorization": auth,
            },
        });
        console.log(response.status);
        response = await response.json();
        console.log(response);
        let acctList = [];
        response.map((response) => acctList.push(response.securitiesAccount.accountId));
        console.log(acctList);
        let ret = {
            "acctList": acctList,
            "invalidRecord": false,
            "newAccessToken": validTokens.atoken || null,
            "newUserToken": validTokens.userTokenId || null
        };
        console.log(ret);
        return ret;
    } catch(e){
        console.log(`in catch ${e}`);
    }
});