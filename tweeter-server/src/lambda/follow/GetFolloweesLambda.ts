import { PagedUserItemRequest, PagedUserItemResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoFollowDao } from "../../model/dao/DaoConcrete/DynamoFollowDao";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";

export const handler = async (
  request: PagedUserItemRequest
): Promise<PagedUserItemResponse> => {
  const followDao = new DynamoFollowDao();
  const authDao = new DynamoAuthDao();
  const followService: FollowService = new FollowService(followDao, authDao);
  const [items, hasMore] = await followService.loadMoreFollowees(
    request.token,
    request.userAlias,
    request.pageSize,
    request.lastItem
  );

  return {
    success: true,
    message: null,
    items: items,
    hasMore: hasMore,
  };
};
