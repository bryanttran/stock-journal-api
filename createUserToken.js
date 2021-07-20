import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const createUserToken = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  console.log(data);
  const params = {
    TableName: process.env.userTokenTable,
    Item: {
      // The attributes of the item to be created
      userTokenId: uuid.v1(), // A unique uuid
      userId: event.requestContext.identity.cognitoIdentityId, // The id of the author
      atoken: data.atoken, // Parsed from request body
      rtoken: data.rtoken, // Parsed from request body
      tier: data.tier, // validating new creation of userTokens
      lastAccessDate: Date.now(), // Current Unix timestamp to log when we need to grab new stocks
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});