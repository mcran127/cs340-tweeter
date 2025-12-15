import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SQSHandler } from "aws-lambda";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const FEED_TABLE = "Feed";

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const { authorAlias, timestamp, post, followerChunk } = JSON.parse(
      record.body
    );

    console.log("In Distribute Statues");

    const feedItems = followerChunk.map((alias: string) => ({
      PutRequest: {
        Item: {
          userAlias: alias,
          timestamp,
          post,
          author: authorAlias,
        },
      },
    }));

    for (let i = 0; i < feedItems.length; i += 25) {
      let batch = feedItems.slice(i, i + 25);
      let request: Record<string, typeof batch> = {
        [FEED_TABLE]: batch,
      };

      do {
        const response = await client.send(
          new BatchWriteCommand({
            RequestItems: request,
          })
        );

        request = response.UnprocessedItems ?? {};
      } while (Object.keys(request).length > 0);
    }
  }
};
