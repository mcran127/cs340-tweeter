import { UserDto } from "tweeter-shared";

export interface IUserDao {
  getUser(alias: string): Promise<UserDto | null>;
  validateUser(alias: string, password: string): Promise<boolean>;
  createUser(user: UserDto, password: string): Promise<void>;
}
