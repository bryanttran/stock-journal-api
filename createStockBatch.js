import * as uuid from "uuid";
import handler from "./libs/handler-lib";
import dynamoDb from "./libs/dynamodb-lib";

export const createStockBatch = handler(async (event, transaction) => {
  const params = {
    TableName: process.env.tableName,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.identity.cognitoIdentityId, // The id of the author
      stockId: uuid.v1(), // A unique uuid
      ticker: transaction.ticker, // Parsed from request body
      price: transaction.price, // Parsed from request body
      instruction: transaction.instruction, // Parsed from request body
      accountNumber: transaction.accountNumber, // Parsed from request body
      transactionDate: transaction.transactionDate, // Transaction date // ISO format
    },
  };

  await dynamoDb.put(params);

  return params.Item;
});