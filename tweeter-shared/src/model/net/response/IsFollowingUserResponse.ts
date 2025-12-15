import { TweeterResponse } from "./TweeterResponse";

export interface IsFollowingUserResponse extends TweeterResponse {
  readonly isFollowing: boolean;
}