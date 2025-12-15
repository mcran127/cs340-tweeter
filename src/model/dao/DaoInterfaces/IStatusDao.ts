import { StatusDto } from "tweeter-shared";

export interface IStatusDao {
  loadMoreFeedItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]>;

  loadMoreStoryItems(
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]>;

  postStatus(newStatus: StatusDto): Promise<void>;
}
