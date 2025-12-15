import { TweeterResponse } from "./TweeterResponse";

export interface FollowUserCountsResponse extends TweeterResponse {
  readonly followerNum: number;
  readonly followeeNum: number;
}
