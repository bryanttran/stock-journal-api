//import Cookies from 'universal-cookie';
import handler from "./libs/handler-lib";

export const main = handler(async (event, context) => {
    console.log(event);
    console.log(context);
    return event;
});