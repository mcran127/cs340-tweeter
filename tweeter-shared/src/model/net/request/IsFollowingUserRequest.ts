import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface IsFollowingUserRequest extends TweeterRequest{
  readonly token: string;
  readonly user: UserDto;
  readonly selectedUser: UserDto;
}
