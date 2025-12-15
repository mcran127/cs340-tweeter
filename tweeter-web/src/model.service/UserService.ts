import { Buffer } from "buffer";
import {
  AuthToken,
  User,
  GetUserRequest,
  LoginRequest,
  RegisterRequest,
  LogoutRequest,
} from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../ServerFacade";

export class UserService implements Service {
  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    const request: GetUserRequest = {
      token: authToken.token,
      alias: alias,
    };

    const serverFacade = new ServerFacade();

    return await serverFacade.getUser(request);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    const request: LoginRequest = {
      alias: alias,
      password: password,
    };

    const serverFacade = new ServerFacade();
    try {
      return await serverFacade.login(request);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    if (!alias.startsWith("@")) {
      throw new Error("Alias must start with @");
    }
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");

    console.log("Starting Register");

    const request: RegisterRequest = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      password: password,
      userImageBytes: imageStringBase64,
      imageFileExtension: imageFileExtension,
    };

    const serverFacade = new ServerFacade();

    try {
      return await serverFacade.register(request);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }

  public logout(authToken: AuthToken): Promise<void> {
    const request: LogoutRequest = {
      token: authToken.token,
    };

    const serverFacade = new ServerFacade();

    try {
      return serverFacade.logout(request);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
}
