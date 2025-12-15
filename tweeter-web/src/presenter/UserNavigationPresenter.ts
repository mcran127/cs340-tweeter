import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { To, NavigateOptions } from "react-router-dom";
import { Presenter, View } from "./Presenter";

export interface UserNavigationView extends View{
  setDisplayedUser: (user: User) => void;
  navigate: (to: To, options?: NavigateOptions) => void;
}

export class UserNavigationPresenter extends Presenter<UserNavigationView>{
  private userService: UserService;

  public constructor(view: UserNavigationView) {
    super(view);
    this.userService = new UserService();
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

  public async navigateToUser(
    event: React.MouseEvent,
    authToken: AuthToken,
    displayedUser: User,
    featurePath: string
  ): Promise<void> {
    event.preventDefault();

    this.doFailureReport(async () => {
      const alias = this.extractAlias(event.target.toString());

      const toUser = await this.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  private extractAlias(value: string) {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
