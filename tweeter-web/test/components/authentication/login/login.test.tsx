import Login from "../../../../src/components/authentication/login/Login";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { LoginPresenter } from "../../../../src/presenter/LoginPresenter";

library.add(fab);

describe("Login Component Test", () => {
  it("When first rendered the sign-in button is disabled", () => {
    const { signInButton } = renderAndGetElements("/");

    expect(signInButton).toBeDisabled();
  });

  it("sign-in button is enabled when both the alias and password fields have text", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderAndGetElements("/");

    await user.type(aliasField, "as");
    await user.type(passwordField, "as");

    expect(signInButton).toBeEnabled();
  });

  it("sign-in button is disabled if either the alias or password field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderAndGetElements("/");

    await user.type(aliasField, "as");
    await user.type(passwordField, "as");

    expect(signInButton).toBeEnabled();

    await user.clear(aliasField);

    expect(signInButton).toBeDisabled();

    await user.type(aliasField, "as");

    expect(signInButton).toBeEnabled();

    await user.clear(passwordField);

    expect(signInButton).toBeDisabled();
  });

  it("presenter's login method is called with correct parameters when the sign-in button is pressed", async () => {
    const mockPresenter = mock<LoginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);

    const originalUrl = "htpp://somewhere.com";
    const alias = "@alias";
    const password = "password";

    const { signInButton, aliasField, passwordField, user } =
      renderAndGetElements(originalUrl, mockPresenterInstance);

    await user.type(aliasField, alias);
    await user.type(passwordField, password);
    await user.click(signInButton);

    verify(mockPresenter.doLogin(alias, password, false, originalUrl)).once();
  });
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <Login originalUrl={originalUrl} presenter={presenter} />
      ) : (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>
  );
}

function renderAndGetElements(originalUrl: string, presenter?: LoginPresenter) {
  const user = userEvent.setup();

  renderLogin(originalUrl, presenter);

  const signInButton = screen.getByRole("button", { name: /Sign in/i });
  const aliasField = screen.getByLabelText("alias");
  const passwordField = screen.getByLabelText("password");

  return { user, signInButton, aliasField, passwordField };
}
