import { AuthenticateResponse, LoginRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoUserDao } from "../../model/dao/DaoConcrete/DynamoUserDao";
import { S3ImageDao } from "../../model/dao/DaoConcrete/S3ImageDao";

export const handler = async (
  request: LoginRequest
): Promise<AuthenticateResponse> => {
  const userDao = new DynamoUserDao();
  const imageDao = new S3ImageDao();
  const authDao = new DynamoAuthDao();
  const userService: UserService = new UserService(userDao, imageDao, authDao);

  const [user, token] = await userService.login(
    request.alias,
    request.password
  );

  return {
    success: true,
    message: null,
    user: user,
    authToken: token,
  };
};
