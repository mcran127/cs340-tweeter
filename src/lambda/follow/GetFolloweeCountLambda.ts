import { FollowUserCountResponse, FollowUserItemRequest } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoFollowDao } from "../../model/dao/DaoConcrete/DynamoFollowDao";

export const handler = async (
  request: FollowUserItemRequest
): Promise<FollowUserCountResponse> => {
  const followDao = new DynamoFollowDao();
  const authDao = new DynamoAuthDao();
  const followService: FollowService = new FollowService(followDao, authDao);
  const numFollowers = await followService.getFolloweeCount(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    followNum: numFollowers,
  };
};
