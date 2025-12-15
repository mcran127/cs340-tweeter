import {
  PagedStatusItemRequest,
  PagedStatusItemResponse,
} from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoStatusDao } from "../../model/dao/DaoConcrete/DynamoStatusDao";

export const handler = async (
  request: PagedStatusItemRequest
): Promise<PagedStatusItemResponse> => {
  const statusDao = new DynamoStatusDao();
  const authDao = new DynamoAuthDao();
  const statusService: StatusService = new StatusService(statusDao, authDao);

  return await statusService.loadMoreStoryItems(
    request.token,
    request.userAlias,
    request.pageSize,
    request.lastItem
  );
};
