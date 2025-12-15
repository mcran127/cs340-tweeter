import { StatusUserItemRequest, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoAuthDao } from "../../model/dao/DaoConcrete/DynamoAuthDao";
import { DynamoStatusDao } from "../../model/dao/DaoConcrete/DynamoStatusDao";

export const handler = async (
  request: StatusUserItemRequest
): Promise<TweeterResponse> => {
  const statusDao = new DynamoStatusDao();
  const authDao = new DynamoAuthDao();
  const statusService: StatusService = new StatusService(statusDao, authDao);

  await statusService.postStatus(request.token, request.lastItem);

  return {
    success: true,
    message: null,
  };
};
