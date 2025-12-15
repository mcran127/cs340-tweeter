import { AuthToken, UserDto } from "tweeter-shared";

export interface IAuthDao {
  createAuthToken(userAlias: string): Promise<AuthToken>;
  validateAuthToken(token: string): Promise<boolean>;
  deleteAuthToken(token: string): Promise<void>;
  getUserFromToken(token:string): Promise<UserDto | null>;
}
