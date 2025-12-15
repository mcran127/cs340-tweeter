import {
  AppNavPresenter,
  AppNavView,
} from "../../src/presenter/AppNavPresenter";
import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { AuthToken } from "tweeter-shared";
import { UserService } from "../../src/model.service/UserService";

describe("AppNavPresenter", () => {
  let mockAppNavPresenterView: AppNavView;
  let appNavPresenter: AppNavPresenter;
  let mockService: UserService;

  const authToken = new AuthToken("abc123", Date.now());

  beforeEach(() => {
    mockAppNavPresenterView = mock<AppNavView>();
    const mockAppNavPresenterViewInstance = instance(mockAppNavPresenterView);
    when(mockAppNavPresenterView.displayInfoMessage(anything(), 0)).thenReturn(
      "messageId123"
    );

    const appNavPresenterSpy = spy(
      new AppNavPresenter(mockAppNavPresenterViewInstance)
    );
    appNavPresenter = instance(appNavPresenterSpy);

    mockService = mock<UserService>();
    when(appNavPresenterSpy.userService).thenReturn(instance(mockService));
  });

  it("tells the view to display a logging out message", async () => {
    await appNavPresenter.logOut(authToken);

    verify(
      mockAppNavPresenterView.displayInfoMessage("Logging Out...", 0)
    ).once();
  });

  it("calls logout on the user service with the correct auth token", async () => {
    await appNavPresenter.logOut(authToken);
    verify(mockService.logout(authToken)).once();

    let [capturedAuthToken] = capture(mockService.logout).last();
    expect(capturedAuthToken).toEqual(authToken);
  });

  it("clear the info message that was displayed previously, clear the user info, and navigate to the login page on success", async () => {
    await appNavPresenter.logOut(authToken);

    verify(mockAppNavPresenterView.deleteMessage("messageId123")).once();
    verify(mockAppNavPresenterView.clearUserInfo()).once();
    verify(mockAppNavPresenterView.navigate("/login")).once();
    verify(mockAppNavPresenterView.displayErrorMessage(anything())).never();
  });

  it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page on fail", async () => {
    let error = new Error("An error occured");
    when(mockService.logout(anything())).thenThrow(error);

    await appNavPresenter.logOut(authToken);

    verify(
      mockAppNavPresenterView.displayErrorMessage(
        "Failed to log user out because of exception: Error: An error occured"
      )
    ).once();
    verify(mockAppNavPresenterView.deleteMessage(anything())).never();
    verify(mockAppNavPresenterView.clearUserInfo()).never();
    verify(mockAppNavPresenterView.navigate("/login")).never();
  });
});
