import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { IAuthDao } from "../DaoInterfaces/IAuthDao";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { AuthToken, UserDto } from "tweeter-shared";

export class DynamoAuthDao implements IAuthDao {
  private tableName = "AuthTokenSession";
  private inactivityExpiration = 60;
  private client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  async createAuthToken(userAlias: string): Promise<AuthToken> {
    const token: AuthToken = AuthToken.Generate();

    const tokenName = token.token;
    const expiration =
      Math.floor(token.timestamp / 1000) + this.inactivityExpiration * 60;

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          token: tokenName,
          userAlias: userAlias,
          inactivityExpiration: expiration,
        },
      })
    );

    return token;
  }
  async validateAuthToken(token: string): Promise<boolean> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { token: token },
      });
      const output = await this.client.send(command);

      if (!output.Item) return false;

      const timeNow = Math.floor(Date.now() / 1000);
      const expires = output.Item.inactivityExpiration;

      if (expires < timeNow) {
        return false;
      }

      const newExpire = timeNow + this.inactivityExpiration * 60;

      await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { token: token },
          UpdateExpression: "set inactivityExpiration = :inactivityExpiration",
          ExpressionAttributeValues: {
            ":inactivityExpiration": newExpire,
          },
        })
      );
      return true;
    } catch (error) {
      console.error("Token Validation error:", error);
      return false;
    }
  }

  async getUserFromToken(authToken: string): Promise<UserDto | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { token: authToken },
      })
    );

    if (!result.Item) return null;

    const userAlias = result.Item.userAlias;

    const userResult = await this.client.send(
      new GetCommand({
        TableName: "Users",
        Key: { alias: userAlias },
      })
    );

    return userResult.Item ? (userResult.Item as UserDto) : null;
  }

  async deleteAuthToken(token: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { token: token },
      })
    );
  }
}
