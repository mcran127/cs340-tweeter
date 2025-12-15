import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { IUserDao } from "../DaoInterfaces/IUserDao";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import { UserDto } from "tweeter-shared";

export class DynamoUserDao implements IUserDao {
  private tableName = "Users";
  private client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  async getUser(alias: string): Promise<UserDto | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { alias },
      })
    );

    return result.Item ? (result.Item as UserDto) : null;
  }

  async validateUser(alias: string, password: string): Promise<boolean> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { alias },
      })
    );

    if (!result.Item) return false;

    return await bcrypt.compare(password, result.Item.passwordHash);
  }

  async createUser(user: UserDto, password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          ...user,
          passwordHash,
          followerCount: 0,
          followeeCount: 0,
        },
        ConditionExpression: "attribute_not_exists(alias)",
      })
    );
  }

  async incrementFollowerCount(alias: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { alias },
        UpdateExpression: "ADD followerCount :inc",
        ExpressionAttributeValues: { ":inc": 1 },
      })
    );
  }

  async decrementFollowerCount(alias: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { alias },
        UpdateExpression: "ADD followerCount :dec",
        ExpressionAttributeValues: { ":dec": -1 },
      })
    );
  }

  async incrementFolloweeCount(alias: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { alias },
        UpdateExpression: "ADD followeeCount :inc",
        ExpressionAttributeValues: { ":inc": 1 },
      })
    );
  }

  async decrementFolloweeCount(alias: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { alias },
        UpdateExpression: "ADD followeeCount :dec",
        ExpressionAttributeValues: { ":dec": -1 },
      })
    );
  }

  async batchGetUsers(aliases: string[]): Promise<UserDto[]> {
    const keys = aliases.map(alias => ({ alias }));
    const response = await this.client.send(
      new BatchGetCommand({
        RequestItems: {
          [this.tableName]: { Keys: keys },
        },
      })
    );

    const items = response.Responses?.[this.tableName] ?? [];

    const users: UserDto[] = items.map(item => ({
      alias: item.alias,
      firstName: item.firstName,
      lastName: item.lastName,
      imageUrl: item.imageUrl,
    }));

    return users;
  }
}
