import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const getUserToken = handler(async (event, context) => {
    console.log(event.requestContext.identity.cognitoIdentityId);
    let body = JSON.parse(event.body);
    console.log(body);
    console.log(body.userTokenId);
  const params = {
    TableName: process.env.userTokenTable,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    Key: {
      userTokenId: body.userTokenId, // The unique id of the table
      userId: event.requestContext.identity.cognitoIdentityId, // The id of user from AWS
    },
  };

  const result = await dynamoDb.get(params);
  if (!result.Item) {
    throw new Error("Item not found.");
  }
  // Return the retrieved item
  return result.Item;
});