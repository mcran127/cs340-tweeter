import { TweeterResponse } from "./TweeterResponse";

export interface FollowUserCountResponse extends TweeterResponse {
  readonly followNum: number;
}
