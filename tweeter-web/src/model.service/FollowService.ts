import {
  AuthToken,
  User,
  PagedUserItemRequest,
  IsFollowingUserRequest,
  FollowUserItemRequest,
} from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../ServerFacade";

export class FollowService implements Service {
  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };

    const serverFacade = new ServerFacade();

    return await serverFacade.getMoreFollowees(request);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    const request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };

    const serverFacade = new ServerFacade();

    return await serverFacade.getMoreFollowers(request);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {

    const request: IsFollowingUserRequest = {
      token: authToken.token,
      user: user.dto,
      selectedUser: selectedUser.dto,
    }

    const serverFacade = new ServerFacade();
    
    return await serverFacade.getIsFollowerStatus(request);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowUserItemRequest = {
      token: authToken.token,
      user: user.dto,
    }

    const serverFacade = new ServerFacade();
    
    return await serverFacade.getFolloweeCount(request);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    const request: FollowUserItemRequest = {
      token: authToken.token,
      user: user.dto,
    }

    const serverFacade = new ServerFacade();
    
    return await serverFacade.getFollowerCount(request);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    await new Promise((f) => setTimeout(f, 2000));

    const request: FollowUserItemRequest = {
      token: authToken.token,
      user: userToFollow.dto,
    }

    const serverFacade = new ServerFacade();
    
    return await serverFacade.follow(request);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    // Pause so we can see the unfollow message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    const request: FollowUserItemRequest = {
      token: authToken.token,
      user: userToUnfollow.dto,
    }

    const serverFacade = new ServerFacade();
    
    return await serverFacade.unfollow(request);
  }
}
