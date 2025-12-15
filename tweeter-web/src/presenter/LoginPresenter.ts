import { User } from "tweeter-shared";
import { AuthenticationPresenter } from "./AuthenticationPresenter";

export class LoginPresenter extends AuthenticationPresenter {
  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string
  ) {
    await this.AuthenticationFlow(
      () => {
        return this.userService.login(alias, password);
      },
      (user: User) => {
        if (!!originalUrl) {
          this.view.navigate(originalUrl);
        } else {
          this.view.navigate(`/feed/${user.alias}`);
        }
      },
      rememberMe,
      this.errorDescription()
    );
  }

  protected errorDescription(): string {
    return "log user in";
  }
}
