import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { SQSHandler, SQSEvent } from "aws-lambda";
import { DynamoFollowDao } from "../../model/dao/DaoConcrete/DynamoFollowDao";
import { randomUUID } from "crypto";

const sqs = new SQSClient({});
const followDao = new DynamoFollowDao();

const DISTRIBUTE_QUEUE =
  "https://sqs.us-east-1.amazonaws.com/593793058305/cs340-distributeStatus";

const FEED_DIVIDER_QUEUE =
  "https://sqs.us-east-1.amazonaws.com/593793058305/cs340-feedDivider";

const FOLLOWER_PAGE_SIZE = 1000;
const FOLLOWER_CHUNK_SIZE = 50;
const SQS_BATCH_SIZE = 10;

interface FeedDividerMessage {
  authorAlias: string;
  timestamp: number;
  post: string;
  lastFollower?: string;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const message: FeedDividerMessage = JSON.parse(record.body);
    const { authorAlias, timestamp, post, lastFollower } = message;

    console.log("Feed Divider start", { authorAlias, lastFollower });

    const [followers, hasMore] = await followDao.getPageOfFollowers(
      authorAlias,
      FOLLOWER_PAGE_SIZE,
      lastFollower
    );

    if (followers.length === 0) continue;

    const followerChunks: string[][] = [];
    for (let i = 0; i < followers.length; i += FOLLOWER_CHUNK_SIZE) {
      followerChunks.push(
        followers.slice(i, i + FOLLOWER_CHUNK_SIZE).map((f) => f.alias)
      );
    }

    for (let i = 0; i < followerChunks.length; i += SQS_BATCH_SIZE) {
      const batchChunks = followerChunks.slice(i, i + SQS_BATCH_SIZE);

      const entries = batchChunks.map((chunk) => ({
        Id: randomUUID(),
        MessageBody: JSON.stringify({
          authorAlias,
          timestamp,
          post,
          followerChunk: chunk,
        }),
      }));

      try {
        await sqs.send(
          new SendMessageBatchCommand({
            QueueUrl: DISTRIBUTE_QUEUE,
            Entries: entries,
          })
        );
      } catch (err) {
        console.error("Failed to send SQS batch", err);
        throw err;
      }
    }

    if (hasMore) {
      const nextMessage: FeedDividerMessage = {
        authorAlias,
        timestamp,
        post,
        lastFollower: followers[followers.length - 1].alias,
      };

      await sqs.send(
        new SendMessageBatchCommand({
          QueueUrl: FEED_DIVIDER_QUEUE,
          Entries: [
            {
              Id: randomUUID(),
              MessageBody: JSON.stringify(nextMessage),
            },
          ],
        })
      );
    }
  }
  console.log("Feed Divider done");
};
