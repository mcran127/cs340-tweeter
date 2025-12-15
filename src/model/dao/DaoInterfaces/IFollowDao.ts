import { UserDto } from "tweeter-shared";

export interface IFollowDao {
  getPageOfFollowees(
    followerHandle: string,
    pageSize: number,
    lastFolloweeHandle: string | undefined
  ): Promise<[UserDto[], boolean]>;

  getPageOfFollowers(
    followeeHandle: string,
    pageSize: number,
    lastFollowerHandle: string | undefined
  ): Promise<[UserDto[], boolean]>;

  getFollowerCount(followeeHandle: string): Promise<number>;

  getFolloweeCount(followerHandle: string): Promise<number>;

  isFollower(followerHandle: string, followeeHandle: string): Promise<boolean>;

  follow(followerHandle: string, followeeHandle: string): Promise<void>;

  unfollow(followerHandle: string, followeeHandle: string): Promise<void>;
}
