import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  const data = JSON.parse(event.body);
  console.log(event);
  console.log(data);
  const params = {
    TableName: process.env.tableName,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.identity.cognitoIdentityId, // The id of the author
      stockId: uuid.v1(), // A unique uuid
      instruction: data.fields.instruction, // Parsed from request body
      ticker: data.fields.ticker, // Parsed from request body
      price: data.fields.price, // Parsed from request body
      transactionDate: data.fields.date, // Current Unix timestamp
      accountNumber: data.fields.accountNumber, // Current Unix timestamp
      content: data.fields.content, // Parsed from request body
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});