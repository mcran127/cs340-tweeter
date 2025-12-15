import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { IFollowDao } from "../DaoInterfaces/IFollowDao";
import { DynamoDBClient, QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { DynamoUserDao } from "./DynamoUserDao";
import { UserDto } from "tweeter-shared";

export class DynamoFollowDao implements IFollowDao {
  private readonly client = DynamoDBDocumentClient.from(new DynamoDBClient());
  private readonly userDao = new DynamoUserDao();
  readonly tableName = "follows";
  readonly indexName = "follows_index";
  readonly follower_handleAttr = "follower_handle";
  readonly followee_handleAttr = "followee_handle";
  readonly follower_nameAttr = "follower_name";
  readonly followee_nameAttr = "followee_name";

  async getPageOfFollowees(
    followerHandle: string,
    pageSize: number,
    lastFolloweeHandle: string | undefined
  ): Promise<[UserDto[], boolean]> {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: `${this.follower_handleAttr} = :fh`,
      ExpressionAttributeValues: {
        ":fh": followerHandle,
      },
      Limit: pageSize,
      ExclusiveStartKey:
        lastFolloweeHandle === undefined
          ? undefined
          : {
              [this.follower_handleAttr]: followerHandle,
              [this.followee_handleAttr]: lastFolloweeHandle,
            },
    };

    const output = await this.client.send(new QueryCommand(params));

    return this.convertToUserDTO(output, this.followee_handleAttr);
  }

  async getPageOfFollowers(
    followeeHandle: string,
    pageSize: number,
    lastFollowerHandle: string | undefined
  ): Promise<[UserDto[], boolean]> {
    const params = {
      TableName: this.tableName,
      IndexName: this.indexName,
      KeyConditionExpression: `${this.followee_handleAttr} = :feh`,
      ExpressionAttributeValues: {
        ":feh": followeeHandle,
      },
      Limit: pageSize,
      ExclusiveStartKey:
        lastFollowerHandle === undefined
          ? undefined
          : {
              [this.followee_handleAttr]: followeeHandle,
              [this.follower_handleAttr]: lastFollowerHandle,
            },
    };

    const output = await this.client.send(new QueryCommand(params));

    return this.convertToUserDTO(output, this.follower_handleAttr);
  }

  async getFollowerCount(alias: string): Promise<number> {
    const result = await this.client.send(
      new GetCommand({
        TableName: "Users",
        Key: { alias },
        ProjectionExpression: "followerCount",
      })
    );

    return result.Item?.followerCount ?? 0;
  }

  async getFolloweeCount(alias: string): Promise<number> {
    const result = await this.client.send(
      new GetCommand({
        TableName: "Users",
        Key: { alias },
        ProjectionExpression: "followeeCount",
      })
    );

    return result.Item?.followeeCount ?? 0;
  }

  async isFollower(
    followerHandle: string,
    followeeHandle: string
  ): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.follower_handleAttr]: followerHandle,
        [this.followee_handleAttr]: followeeHandle,
      },
      ProjectionExpression: this.follower_handleAttr,
    };

    const output = await this.client.send(new GetCommand(params));
    return !!output.Item;
  }
  async follow(followerHandle: string, followeeHandle: string): Promise<void> {
    const follower = await this.userDao.getUser(followerHandle);
    const followee = await this.userDao.getUser(followeeHandle);

    if (!follower || !followee) {
      throw new Error("Follower or followee does not exist");
    }

    const params = {
      TableName: this.tableName,
      Item: {
        [this.follower_handleAttr]: followerHandle,
        [this.followee_handleAttr]: followeeHandle,
        [this.follower_nameAttr]: `${follower.firstName} ${follower.lastName}`,
        [this.followee_nameAttr]: `${followee.firstName} ${followee.lastName}`,
      },
      ConditionExpression:
        "attribute_not_exists(follower_handle) AND attribute_not_exists(followee_handle)",
    };

    await this.client.send(new PutCommand(params));

    await this.userDao.incrementFolloweeCount(followerHandle);
    await this.userDao.incrementFollowerCount(followeeHandle);
  }
  async unfollow(
    followerHandle: string,
    followeeHandle: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.follower_handleAttr]: followerHandle,
        [this.followee_handleAttr]: followeeHandle,
      },
    };

    await this.client.send(new DeleteCommand(params));

    await this.userDao.decrementFolloweeCount(followerHandle);
    await this.userDao.decrementFollowerCount(followeeHandle);
  }

  private async convertToUserDTO(
  output: QueryCommandOutput,
  handleAttr: string
): Promise<[UserDto[], boolean]> {
  const handles = (output.Items ?? []).map(item => item[handleAttr]).filter(h => typeof h === "string");

  if (handles.length === 0) return [[], !!output.LastEvaluatedKey];

  const users: UserDto[] = [];

  for (let i = 0; i < handles.length; i += 100) {
    const batchHandles = handles.slice(i, i + 100);
    const result = await this.userDao.batchGetUsers(batchHandles);
    users.push(...result);
  }

  return [users, !!output.LastEvaluatedKey];
}

}
