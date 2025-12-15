import {
  FollowUserCountsResponse,
  FollowUserItemRequest,
} from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoFollowDao } from "../../model/dao/DaoConcrete/DynamoFollowDao";

export const handler = async (
  request: FollowUserItemRequest
): Promise<FollowUserCountsResponse> => {
  const followDao = new DynamoFollowDao();
  const authDao = new DynamoAuthDao();
  const followService: FollowService = new FollowService(followDao, authDao);
  const [numFollowers, numFollowees] = await followService.follow(
    request.token,
    request.user
  );

  return {
    success: true,
    message: null,
    followerNum: numFollowers,
    followeeNum: numFollowees,
  };
};
