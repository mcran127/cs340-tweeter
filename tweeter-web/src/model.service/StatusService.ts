import {
  AuthToken,
  Status,
  PagedStatusItemRequest,
  StatusUserItemRequest,
} from "tweeter-shared";
import { Service } from "./Service";
import { ServerFacade } from "../ServerFacade";

export class StatusService implements Service {
  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: PagedStatusItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };

    const serverFacade = new ServerFacade();

    return await serverFacade.loadMoreFeedItems(request);
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    const request: PagedStatusItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };

    const serverFacade = new ServerFacade();

    return await serverFacade.loadMoreStoryItems(request);
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    const request: StatusUserItemRequest = {
      token: authToken.token,
      lastItem: newStatus.dto
    };

    const serverFacade = new ServerFacade();

    return serverFacade.postStatus(request);
  }
}
