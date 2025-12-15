import { To, NavigateOptions } from "react-router-dom";
import { UserService } from "../model.service/UserService";
import { AuthToken } from "tweeter-shared";
import { MessageView, Presenter } from "./Presenter";

export interface AppNavView extends MessageView {
  navigate: (to: To, options?: NavigateOptions) => void;
  clearUserInfo: () => void;
}

export class AppNavPresenter extends Presenter<AppNavView> {
  private _userService: UserService;

  public constructor(view: AppNavView) {
    super(view);
    this._userService = new UserService();
  }

  public async logOut(authToken: AuthToken) {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

    this.doFailureReport(async () => {
      await this.userService.logout(authToken!);

      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    }, "log user out");
  }

  public get userService() {
    return this._userService
  }
}
