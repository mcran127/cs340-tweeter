import { LogoutRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoUserDao } from "../../model/dao/DaoConcrete/DynamoUserDao";
import { S3ImageDao } from "../../model/dao/DaoConcrete/S3ImageDao";

export const handler = async (
  request: LogoutRequest
): Promise<TweeterResponse> => {
  const userDao = new DynamoUserDao();
  const imageDao = new S3ImageDao();
  const authDao = new DynamoAuthDao();
  const userService: UserService = new UserService(userDao, imageDao, authDao);

  await userService.logout(request.token);

  return {
    success: true,
    message: null,
  };
};
