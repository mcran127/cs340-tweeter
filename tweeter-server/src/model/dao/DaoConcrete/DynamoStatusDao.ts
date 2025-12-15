import { StatusDto } from "tweeter-shared";
import { IStatusDao } from "../DaoInterfaces/IStatusDao";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoUserDao } from "./DynamoUserDao";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class DynamoStatusDao implements IStatusDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());
  private readonly userDao = new DynamoUserDao();
  private sqsClient = new SQSClient();
  readonly feed_handleAttr = "author";
  readonly story_handleAttr = "userAlias";
  readonly storyTableName = "Status";
  readonly feedTableName = "Feed";
  readonly sqs_url =
    "https://sqs.us-east-1.amazonaws.com/593793058305/cs340-feedDivider";

  async loadMoreFeedItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    if (!userAlias) {
      throw new Error("userAlias is required for DynamoDB query");
    }

    const params = {
      TableName: this.feedTableName,
      KeyConditionExpression: "userAlias = :userAlias",
      ExpressionAttributeValues: {
        ":userAlias": userAlias,
      },
      Limit: pageSize,
      ScanIndexForward: false,
      ExclusiveStartKey:
        lastItem == null || typeof lastItem.timestamp !== "number"
          ? undefined
          : {
              userAlias,
              timestamp: lastItem.timestamp,
            },
    };

    const result = await this.client.send(new QueryCommand(params));

    return this.convertToStatusDTO(result, this.feed_handleAttr);
  }

  async loadMoreStoryItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    if (!userAlias) {
      throw new Error("userAlias is required for DynamoDB query");
    }

    const params = {
      TableName: this.storyTableName,
      KeyConditionExpression: "userAlias = :userAlias",
      ExpressionAttributeValues: {
        ":userAlias": userAlias,
      },
      Limit: pageSize,
      ScanIndexForward: false,
      ExclusiveStartKey:
        lastItem == null || typeof lastItem.timestamp !== "number"
          ? undefined
          : {
              userAlias,
              timestamp: lastItem.timestamp,
            },
    };

    const result = await this.client.send(new QueryCommand(params));

    return this.convertToStatusDTO(result, this.story_handleAttr);
  }

  async postStatus(newStatus: StatusDto): Promise<void> {
    const userAlias = newStatus.user.alias;

    await this.client.send(
      new PutCommand({
        TableName: this.storyTableName,
        Item: {
          userAlias: userAlias,
          timestamp: newStatus.timestamp,
          post: newStatus.post,
          author: userAlias,
        },
      })
    );

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: this.sqs_url,
        MessageBody: JSON.stringify({
          authorAlias: userAlias,
          timestamp: newStatus.timestamp,
          post: newStatus.post,
        }),
      })
    );
  }

  private async convertToStatusDTO(
    output: QueryCommandOutput,
    handleAttr: string
  ): Promise<[StatusDto[], boolean]> {
    const statuses: StatusDto[] = [];

    for (const item of output.Items ?? []) {
      if (!item) continue;
      const handle = item[handleAttr];

      if (typeof handle !== "string") continue;

      const user = await this.userDao.getUser(handle);
      if (!user) continue;

      statuses.push({
        user,
        timestamp: item.timestamp,
        post: item.post,
      });
    }

    const hasMore = !!output.LastEvaluatedKey;
    return [statuses ?? [], hasMore ?? false];
  }
}
