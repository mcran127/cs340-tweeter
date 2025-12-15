import { PagedStatusItemResponse, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { IStatusDao } from "../dao/DaoInterfaces/IStatusDao";
import { IAuthDao } from "../dao/DaoInterfaces/IAuthDao";

export class StatusService implements Service {
  constructor(private statusDao: IStatusDao, private authDao: IAuthDao) {}

  public async loadMoreFeedItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<PagedStatusItemResponse> {
    await this.authValidation(authToken);

    const [statuses, hasMore] = await this.statusDao.loadMoreFeedItems(
      userAlias,
      pageSize,
      lastItem
    );

    return {
      success: true,
      message: null,
      items: statuses,
      hasMore,
    };
  }

  public async loadMoreStoryItems(
    authToken: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<PagedStatusItemResponse> {
    await this.authValidation(authToken);

    const [statuses, hasMore] = await this.statusDao.loadMoreStoryItems(
      userAlias,
      pageSize,
      lastItem
    );

    return {
      success: true,
      message: null,
      items: statuses,
      hasMore,
    };
  }

  public async postStatus(
    authToken: string,
    newStatus: StatusDto
  ): Promise<void> {
    await this.authValidation(authToken);

    await this.statusDao.postStatus(newStatus);
  }

  private async authValidation(authToken: string) {
    if (!(await this.authDao.validateAuthToken(authToken))) {
      throw new Error("Could not validate AuthToken");
    }
  }
}
