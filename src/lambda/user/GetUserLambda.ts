import { GetUserRequest, GetUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDao } from "../../model/dao/DaoConcrete/DynamoUserDao";
import { S3ImageDao } from "../../model/dao/DaoConcrete/S3ImageDao";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";

export const handler = async (
  request: GetUserRequest
): Promise<GetUserResponse> => {
  const userDao = new DynamoUserDao();
  const imageDao = new S3ImageDao();
  const authDao = new DynamoAuthDao();
  const userService: UserService = new UserService(userDao, imageDao, authDao);

  const user = await userService.getUser(request.token, request.alias);

  return {
    success: true,
    message: null,
    user: user,
  };
};
