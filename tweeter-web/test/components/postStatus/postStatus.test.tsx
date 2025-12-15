import PostStatus from "../../../src/components/postStatus/PostStatus";
import { anything, capture, instance, mock, verify } from "@typestrong/ts-mockito";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { useUserInfo } from "../../../src/components/userInfo/UserHooks";
import { AuthToken, User } from "tweeter-shared";
import {} from "../../../src/components/userInfo/UserHooks";

jest.mock("../../../src/components/userInfo/UserHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

const mockUserInstance = new User("as", "as", "@as", "image.url");
const mockAuthTokenInstance = new AuthToken("as", Date.now());


describe("Post Status Component Test", () => {
  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  it("When first rendered the Post Status and Clear buttons are both disabled", () => {
    const { postButton, clearButton } = renderAndGetElements();

    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("Both buttons are enabled when the text field has text", async () => {
    const { statusField, postButton, clearButton, user } =
      renderAndGetElements();

    await user.type(statusField, "as");

    expect(postButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("Both buttons are disabled when the text field is cleared", async () => {
    const { statusField, postButton, clearButton, user } =
      renderAndGetElements();

    await user.type(statusField, "as");

    expect(postButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(statusField);

    expect(postButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("presenter's postStatus method is called with correct parameters when the Post Status button is pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const { statusField, postButton, user } = renderAndGetElements(
      mockPresenterInstance
    );

    await user.type(statusField, "as");
    await user.click(postButton);

    const [authCapture, statusCapture] = capture(mockPresenter.postStatus).last();

    expect(authCapture).toBe(mockAuthTokenInstance);
    expect(statusCapture.post).toBe("as");
    expect(statusCapture.user).toBe(mockUserInstance);

    verify(mockPresenter.postStatus(mockAuthTokenInstance, anything())).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}
    </MemoryRouter>
  );
}

function renderAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();

  renderPostStatus(presenter);

  const statusField = screen.getByLabelText("postStatusText");
  const postButton = screen.getByLabelText("postStatusButton");
  const clearButton = screen.getByLabelText("clearStatusButton");

  return { user, statusField, postButton, clearButton };
}
