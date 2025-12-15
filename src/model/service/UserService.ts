import { Buffer } from "buffer";
import { UserDto, AuthTokenDto } from "tweeter-shared";
import { Service } from "./Service";
import { IUserDao } from "../dao/DaoInterfaces/IUserDao";
import { IImageDao } from "../dao/DaoInterfaces/IImageDao";
import { IAuthDao } from "../dao/DaoInterfaces/IAuthDao";

export class UserService implements Service {
  constructor(
    private userDao: IUserDao,
    private imageDao: IImageDao,
    private authDao: IAuthDao
  ) {}

  public async getUser(
    authToken: string,
    alias: string
  ): Promise<UserDto | null> {
    if (!(await this.authDao.validateAuthToken(authToken))) {
      throw new Error("Could not validate AuthToken");
    }

    return this.userDao.getUser(alias);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const user = await this.userDao.getUser(alias);

    if (user === null) {
      throw new Error("Invalid alias or password");
    }

    if (!(await this.userDao.validateUser(user.alias, password))) {
      throw new Error("Invalid alias or password");
    }

    const newToken: AuthTokenDto = (await this.authDao.createAuthToken(alias))
      .dto;

    return [user, newToken];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const fileName = `${alias}.${imageFileExtension}`;

    const imageUrl = await this.imageDao.putImage(
      fileName,
      userImageBytes
    );

    const userDTO: UserDto = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      imageUrl: imageUrl,
    };

    const newToken = await this.authDao.createAuthToken(alias);
    await this.userDao.createUser(userDTO, password);

    return [userDTO, newToken.dto];
  }

  public async logout(authToken: string): Promise<void> {
    return await this.authDao.deleteAuthToken(authToken);
  }
}
