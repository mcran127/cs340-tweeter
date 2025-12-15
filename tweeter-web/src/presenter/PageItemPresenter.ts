import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";
import { Service } from "../model.service/Service";

export const PAGE_SIZE = 10;

export interface PageItemView<T> extends View {
  addItems: (Items: T[]) => void;
}

export abstract class PageItemPresenter<T, U extends Service> extends Presenter<PageItemView<T>> {
  private _hasMoreItems = true;
  private _lastItem: T | null = null;
  private _service: U;
  private userService: UserService = new UserService();

  public constructor(view: PageItemView<T>) {
    super(view);
    this._service = this.serviceFactory();
  }

  protected abstract serviceFactory(): U;

  protected get lastItem() {
    return this._lastItem;
  }

  public get hasMoreItems() {
    return this._hasMoreItems;
  }

  protected set lastItem(value: T | null) {
    this._lastItem = value;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected get service() {
    return this._service;
  }

  reset() {
    this.lastItem = null;
    this.hasMoreItems = true;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

  public async loadMoreItems(authToken: AuthToken, userAlias: string) {
      this.doFailureReport(async () => {
        const [newItems, hasMore] = await this.getMoreItems(
          authToken,
          userAlias,
        );
  
        this.hasMoreItems = hasMore;
        this.lastItem =
          newItems.length > 0 ? newItems[newItems.length - 1] : null;
        this.view.addItems(newItems);
      }, this.itemDescription());
    }

    protected abstract itemDescription(): string;

    protected abstract getMoreItems(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>;
}
