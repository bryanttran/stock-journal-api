import handler from "./libs/handler-lib";
import fetch from 'node-fetch';
//import { decode } from "jsonwebtoken";
import {signAccessJWT, decodeRefreshJWT} from './utilsJWT.js';

export const getNewAccessTokenTD = handler(async (event, context) => {
    const TDAuthURL = "https://api.tdameritrade.com/v1/oauth2/token";

    console.log(`***getNewAccessTokenTD`);
    //console.log(event.rtoken);
    let decodedRefresh = decodeRefreshJWT(event.rtoken);

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', decodedRefresh);
    formData.append('client_id', process.env.tdClientId);
    formData.append('redirect_uri', process.env.tdRedirectUri);

    //console.log(formData.toString());

    try{
        let response = await fetch(TDAuthURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });
        let tokenTD = await response.json();
        console.log(tokenTD);
        let accessJWT = signAccessJWT(tokenTD.access_token);
        console.log(`accessJWT`);
        console.log(accessJWT);
        return {"atoken": accessJWT};
    } catch(e) {
        console.log(`in catch ${e}`);
    }
});