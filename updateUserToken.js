import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const updateUserToken = handler(async (event) => {
  console.log(`event`);
  console.log(event);
  let body = JSON.parse(event.body);
  //const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.userTokenTable,
    // 'Key' defines the partition key and sort key of the item to be updated
    Key: {
      userTokenId: body.userTokenId, // The id of the author
      userId: event.requestContext.identity.cognitoIdentityId, // The id of the user from the path
    },
    Item: {
      "lastAccessDate": Date.now(),
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET atoken = :atoken, rtoken = :rtoken, lastAccessDate = :lastAccessDate, tier = :tier",
    ExpressionAttributeValues: {
      ":atoken": body.atoken || null,
      ":rtoken": body.rtoken || null,
      ":tier": body.tier || null,
      ":lastAccessDate": Date.now(),
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW",
  };

  console.log(params);
  await dynamoDb.update(params);

  return { status: true };
});