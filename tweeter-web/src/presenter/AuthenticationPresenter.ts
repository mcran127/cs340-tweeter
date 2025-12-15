import { To, NavigateOptions } from "react-router-dom";
import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";

export interface AuthenticationView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (to: To, options?: NavigateOptions) => void;
}

export abstract class AuthenticationPresenter extends Presenter<AuthenticationView> {
  protected userService: UserService;
  protected _isLoading: boolean = false;

  public constructor(view: AuthenticationView) {
    super(view);
    this.userService = new UserService();
  }

  public get isLoading(): boolean {
    return this._isLoading;
  }

  public async AuthenticationFlow(
    operation: () => Promise<[user: User, authToken: AuthToken]>,
    navigateTo: (user: User) => void,
    rememberMe: boolean,
    operationDescription: string
  ): Promise<void> {
    this.doFailureReport(
      async () => {
        this._isLoading = true;

        const [user, authToken] = await operation();

        this.view.updateUserInfo(user, user, authToken, rememberMe);
        navigateTo(user);
      },
      operationDescription,
      () => {
        this._isLoading = false;
      }
    );
  }

  protected abstract errorDescription(): string;
}
