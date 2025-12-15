import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { To, NavigateOptions } from "react-router-dom";
import { Presenter, MessageView } from "./Presenter";

export interface UserInfoView extends MessageView {
  setDisplayedUser: (user: User) => void;
  navigate: (to: To, options?: NavigateOptions) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private followService: FollowService;

  constructor(
    view: UserInfoView,
    private setFollowerCount: (count: number) => void,
    private setFolloweeCount: (count: number) => void,
    private setIsFollower: (status: boolean) => void,
    private setIsLoading: (loading: boolean) => void
  ) {
    super(view);
    this.followService = new FollowService();
  }

  private async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.followService.getFollowerCount(authToken, user);
  }

  private async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.followService.getFolloweeCount(authToken, user);
  }

  private async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    return this.followService.getIsFollowerStatus(
      authToken,
      user,
      selectedUser
    );
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ) {
    this.doFailureReport(async () => {
      if (currentUser === displayedUser) {
        this.setIsFollower(false);
      } else {
        this.setIsFollower(
          await this.getIsFollowerStatus(
            authToken!,
            currentUser!,
            displayedUser!
          )
        );
      }
    }, "determine follower status");
  }

  private async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.followService.follow(authToken, userToFollow);
  }

  private async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.followService.unfollow(authToken, userToUnfollow);
  }

  public async setNumbFollowees(authToken: AuthToken, displayedUser: User) {
    this.doFailureReport(async () => {
      this.setFolloweeCount(
        await this.getFolloweeCount(authToken, displayedUser)
      );
    }, "get followees count");
  }

  public async setNumbFollowers(authToken: AuthToken, displayedUser: User) {
    this.doFailureReport(async () => {
      this.setFolloweeCount(
        await this.getFollowerCount(authToken, displayedUser)
      );
    }, "get followers count");
  }

  private getBaseUrl(): string {
    const segments = location.pathname.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  }

  public async followDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    return this.ToggleFollowDisplayedUser(
      event,
      displayedUser,
      authToken,
      true
    );
  }

  public async unfollowDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken
  ): Promise<void> {
    return this.ToggleFollowDisplayedUser(
      event,
      displayedUser,
      authToken,
      false
    );
  }

  public switchToLoggedInUser(
    event: React.MouseEvent,
    currentUser: User
  ): void {
    event.preventDefault();
    this.view.setDisplayedUser(currentUser!);
    this.view.navigate(`${this.getBaseUrl()}/${currentUser!.alias}`);
  }

  public async ToggleFollowDisplayedUser(
    event: React.MouseEvent,
    displayedUser: User,
    authToken: AuthToken,
    willFollow: boolean
  ) {
    event.preventDefault();

    var userToast = "";

    this.doFailureReport(
      async () => {
        this.setIsLoading(true);
        userToast = this.view.displayInfoMessage(
          `${willFollow ? "Following" : "Unfollowing"} ${
            displayedUser!.name
          }...`,
          0
        );

        const [followerCount, followeeCount] = willFollow
          ? await this.follow(authToken, displayedUser)
          : await this.unfollow(authToken, displayedUser);

        this.setIsFollower(willFollow);
        this.setFollowerCount(followerCount);
        this.setFolloweeCount(followeeCount);
      },
      `${willFollow ? "follow" : "unfollow"} user`,
      () => {
        this.view.deleteMessage(userToast);
        this.setIsLoading(false);
      }
    );
  }
}
