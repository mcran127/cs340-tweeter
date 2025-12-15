import {
  IsFollowingUserRequest,
  IsFollowingUserResponse,
} from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoFollowDao } from "../../model/dao/DaoConcrete/DynamoFollowDao";

export const handler = async (
  request: IsFollowingUserRequest
): Promise<IsFollowingUserResponse> => {
  const followDao = new DynamoFollowDao();
  const authDao = new DynamoAuthDao();
  const followService: FollowService = new FollowService(followDao, authDao);
  const bIsFollowing = await followService.getIsFollowerStatus(
    request.token,
    request.user,
    request.selectedUser
  );

  return {
    success: true,
    message: null,
    isFollowing: bIsFollowing,
  };
};
