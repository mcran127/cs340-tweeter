import { UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { IFollowDao } from "../dao/DaoInterfaces/IFollowDao";
import { IAuthDao } from "../dao/DaoInterfaces/IAuthDao";

export class FollowService implements Service {
  constructor(private followDao: IFollowDao, private authDao: IAuthDao) {}

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authValidation(token);

    return this.followDao.getPageOfFollowees(
      userAlias,
      pageSize,
      lastItem?.alias
    );
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    await this.authValidation(token);

    return this.followDao.getPageOfFollowers(
      userAlias,
      pageSize,
      lastItem?.alias
    );
  }

  public async getIsFollowerStatus(
    authToken: string,
    user: UserDto,
    selectedUser: UserDto
  ): Promise<boolean> {
    await this.authValidation(authToken);

    return await this.followDao.isFollower(user.alias, selectedUser.alias);
  }

  public async getFolloweeCount(
    authToken: string,
    user: UserDto
  ): Promise<number> {
    await this.authValidation(authToken);

    return await this.followDao.getFolloweeCount(user.alias);
  }

  public async getFollowerCount(
    authToken: string,
    user: UserDto
  ): Promise<number> {
    await this.authValidation(authToken);

    return await this.followDao.getFollowerCount(user.alias);
  }

  public async follow(
    authToken: string,
    userToFollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.authValidation(authToken);

    const currentUser = await this.authDao.getUserFromToken(authToken);
    if (!currentUser) throw new Error("Invalid auth token");

    await this.followDao.follow(currentUser.alias, userToFollow.alias);

    const followerCount = await this.getFollowerCount(authToken, currentUser);
    const followeeCount = await this.getFolloweeCount(authToken, currentUser);

    return [followerCount, followeeCount];
  }

  public async unfollow(
    authToken: string,
    userToUnfollow: UserDto
  ): Promise<[followerCount: number, followeeCount: number]> {
    await this.authValidation(authToken);

    const currentUser = await this.authDao.getUserFromToken(authToken);
    if (!currentUser) throw new Error("Invalid auth token");

    await this.followDao.unfollow(currentUser.alias, userToUnfollow.alias);

    const followerCount = await this.getFollowerCount(authToken, currentUser);
    const followeeCount = await this.getFolloweeCount(authToken, currentUser);

    return [followerCount, followeeCount];
  }

  private async authValidation(authToken: string) {
    if (!(await this.authDao.validateAuthToken(authToken))) {
      throw new Error("Could not validate AuthToken");
    }
  }
}
