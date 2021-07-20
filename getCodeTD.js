import handler from "./libs/handler-lib";
import fetch from 'node-fetch';
import {signRefreshJWT, signAccessJWT } from './utilsJWT';
import { createUserToken } from './createUserToken';
import {updateUserToken} from './updateUserToken';

export const main = handler(async (event, context) => {
    const TDAuthURL = "https://api.tdameritrade.com/v1/oauth2/token";

    console.log(event);
    let body = await JSON.parse(event.body);
    console.log(body.code);
    let decodedCode = decodeURIComponent(body.code);
    console.log(decodedCode);
    //decodedCode = decodedCode.substring(1, decodedCode.length-1);

    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('refresh_token', '');
    formData.append('access_type', 'offline');
    formData.append('code', decodedCode);
    formData.append('client_id', process.env.tdClientId);
    formData.append('redirect_uri', process.env.tdRedirectUri);

    let accessToken, refreshToken;
    console.log(formData.toString());

    try{
        let response = await fetch(TDAuthURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });
        console.log(response);

        let tokenAPI = await response.json();
        accessToken = tokenAPI.access_token;
        refreshToken = tokenAPI.refresh_token;

        console.log(tokenAPI);
        console.log(accessToken);
        console.log(refreshToken);
        console.log("JWT PART");
        let accessJWT = signAccessJWT(accessToken);
        let refreshJWT = signRefreshJWT(refreshToken);
        body.atoken = accessJWT;
        body.rtoken = refreshJWT;
        event.body = JSON.stringify(body);
        try {
            console.log(accessJWT);
            console.log(refreshJWT);
            console.log(event);
            console.log(body.userTokenId);
            if(body.userTokenId) { // Existing user, updating record
                console.log("Existing user token, updating record");
                let res = await updateUserToken(event);
                console.log(res);
                return event.body;
            } else { // New record
                console.log("Null user token, new user, creating new record");
                let res = await createUserToken(event);
                console.log(res);
                return res.body;
            }
        } catch (e) { console.log(e); }

        // Return the tokens
        return {"access_token": accessJWT,"refresh_token": refreshJWT};
    } catch(e) {
        console.log(`in catch ${e}`);
    }
});