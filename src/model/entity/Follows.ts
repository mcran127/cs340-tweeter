export class Follows {
  follower_handle: string;
  followee_handle: string;
  follower_name: string;
  followee_name: string;

  constructor(
    follower_handle: string,
    followee_handle: string,
    follower_name: string,
    followee_name: string
  ) {
    this.follower_handle = follower_handle;
    this.followee_handle = followee_handle;
    this.follower_name = follower_name;
    this.followee_name = followee_name;
  }
}
