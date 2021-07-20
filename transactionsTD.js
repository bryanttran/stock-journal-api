import handler from "./libs/handler-lib";
import fetch from 'node-fetch';
import { decodeAccessJWT } from "./utilsJWT";
import {validateAccessToken, getLastStockDatePull} from './userTokenUtils';
import moment from 'moment';
import {updateUserTokenPullDate} from './updateUserTokenPullDate';
import {createStockBatch} from './createStockBatch';

export const main = handler(async (event, context) => {
    let TDAcctURL = "https://api.tdameritrade.com/v1/accounts/";

    let validTokens = await validateAccessToken(event);
    let ret = {};
    console.log(`**finished validateAccessToken`);
    console.log(validTokens);
    if(validTokens && validTokens.atoken) {
        ret.atoken = validTokens.atoken;
        console.log(validTokens.atoken);
        console.log(ret);
        console.log(ret.atoken);
        console.log(`**CREATED NEW ATOKEN`);
    }
    if(!validTokens) {
        console.log(`**INVALID TOKENS`);
        return {"invalidRecord": true};
    }
    console.log(event);
    console.log(event.body);

    let lastStockDatePullISO = await getLastStockDatePull(event);
    let lastStockDatePull = moment(lastStockDatePullISO).format('YYYY-MM-DD');
    console.log(lastStockDatePull);

    let body = JSON.parse(event.body);
    console.log(body);

    let decodedAccess = decodeAccessJWT(body.atoken);
    let auth = `Bearer ${decodedAccess}`;
    console.log(auth);

    const formData = new URLSearchParams();
    formData.append('type', 'TRADE');
    formData.append('startDate', lastStockDatePull);

    TDAcctURL = TDAcctURL + body.selectedAccount + "/transactions?" + formData.toString();

    console.log(TDAcctURL);
    try {
        let response = await fetch(TDAcctURL, {
            method: "GET",
            headers: {
                "Authorization": auth,
            }
        });
        console.log(response.status);
        response = await response.json();
        console.log(response);

        let pullDate = new Date(lastStockDatePullISO);
        console.log(pullDate);
        let transactions = response.filter((stock) => {
            if(stock.description && stock.description === "DIVIDEND REINVEST") {
                console.log(`stock.description ${stock.description}`);
                return false;
            }
            if(!stock.settlementDate) {
                console.log(`stock.settlementDate ${stock.settlementDate}`);
                return false;
            }
            let stockDate = new Date(stock.transactionDate);
            if(stockDate <= pullDate ) {
                console.log(`stockDate ${stockDate} ${pullDate}`);
                return false;
            }
            return true;
        }).map((stock) => {
            console.log(stock.transactionItem.instrument);
            return {
                "transactionDate": moment(stock.transactionDate).toString(),
                "price": stock.transactionItem.price,
                "accountNumber": body.selectedAccount,
                "instruction": stock.transactionItem.instruction,
                "ticker": (stock.transactionItem.instrument && stock.transactionItem.instrument.description) ? stock.transactionItem.instrument.description : stock.transactionItem.instrument.symbol, //TODO
            };
        });
        console.log(transactions);
        for(let transaction of transactions) {
            console.log(transaction);
            await createStockBatch(event, transaction);
        }
        //Update the ISO pull date to the most recent
        await updateUserTokenPullDate(event, moment().toISOString());
        console.log(ret);
        return ret;
    } catch(e){
        console.log(`in catch ${e}`);
    }
});