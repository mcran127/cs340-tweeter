import {
  AuthenticateResponse,
  AuthToken,
  FollowUserCountResponse,
  FollowUserCountsResponse,
  FollowUserItemRequest,
  GetUserRequest,
  GetUserResponse,
  IsFollowingUserRequest,
  IsFollowingUserResponse,
  LoginRequest,
  LogoutRequest,
  PagedStatusItemRequest,
  PagedStatusItemResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  RegisterRequest,
  Status,
  StatusDto,
  StatusUserItemRequest,
  TweeterResponse,
  User,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL =
    "https://hy7k3bbpk7.execute-api.us-east-1.amazonaws.com/prod";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/getFollowees");

    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follow/getFollowers");

    const items: User[] | null =
      response.success && response.items
        ? response.items.map((dto) => User.fromDto(dto) as User)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No followers found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getIsFollowerStatus(
    request: IsFollowingUserRequest
  ): Promise<boolean> {
    const response = await this.clientCommunicator.doPost<
      IsFollowingUserRequest,
      IsFollowingUserResponse
    >(request, "/follow/getIsFollowerStatus");

    if (response.success) {
      return response.isFollowing;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFolloweeCount(
    request: FollowUserItemRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      FollowUserItemRequest,
      FollowUserCountResponse
    >(request, "/follow/getFolloweesCount");

    if (response.success) {
      return response.followNum;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getFollowerCount(
    request: FollowUserItemRequest
  ): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      FollowUserItemRequest,
      FollowUserCountResponse
    >(request, "/follow/getFollowersCount");

    if (response.success) {
      return response.followNum;
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async follow(
    request: FollowUserItemRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      FollowUserItemRequest,
      FollowUserCountsResponse
    >(request, "/follow/follow");

    if (response.success) {
      return [response.followerNum, response.followeeNum];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async unfollow(
    request: FollowUserItemRequest
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      FollowUserItemRequest,
      FollowUserCountsResponse
    >(request, "/follow/unfollow");

    if (response.success) {
      return [response.followerNum, response.followeeNum];
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async getUser(request: GetUserRequest): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(request, "/user/getUser");

    if (response.success) {
      if (response.user == null) {
        throw new Error(`No user found`);
      } else {
        return User.fromDto(response.user);
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      AuthenticateResponse
    >(request, "/user/login");

    if (response.success) {
      if (!response.user || !response.authToken) {
        console.error("Login response is missing user or authToken", response);
        throw new Error("Invalid alias or password");
      }
      return [
        User.fromDto(response.user) as User,
        AuthToken.fromDto(response.authToken) as AuthToken,
      ];
    } else {
      console.error("Login failed with server response", response);

      const msg =
        (response as any).errorMessage ||
        response.message ||
        "Unknown login error";
      throw new Error(msg);
    }
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      AuthenticateResponse
    >(request, "/user/register");

    if (response.success) {
      console.log(response.user.imageUrl);
      return [
        User.fromDto(response.user) as User,
        AuthToken.fromDto(response.authToken) as AuthToken,
      ];
    } else {
      console.error(response);
      let msg =
        (response as any).errorMessage ||
        response.message ||
        "Unknown register error";
      if (msg == "The conditional request failed") {
        msg = "This alias is already taken, please try again";
      }
      console.log(msg);
      throw new Error(msg);
    }
  }

  public async logout(request: LogoutRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      LogoutRequest,
      TweeterResponse
    >(request, "/user/logout");

    if (response.success) {
    } else {
      console.error(response);
      const msg =
        (response as any).errorMessage ||
        response.message ||
        "Unknown logout error";
      throw new Error(msg);
    }
  }

  public async loadMoreFeedItems(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/status/loadFeedItems");

    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto: StatusDto) => Status.fromDto(dto) as Status)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No feed items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async loadMoreStoryItems(
    request: PagedStatusItemRequest
  ): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedStatusItemRequest,
      PagedStatusItemResponse
    >(request, "/status/loadStoryItems");

    const items: Status[] | null =
      response.success && response.items
        ? response.items.map((dto: StatusDto) => Status.fromDto(dto) as Status)
        : null;

    if (response.success) {
      if (items == null) {
        throw new Error(`No story items found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  public async postStatus(request: StatusUserItemRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      StatusUserItemRequest,
      TweeterResponse
    >(request, "/status/postStatus");

    if (response.success) {
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}
