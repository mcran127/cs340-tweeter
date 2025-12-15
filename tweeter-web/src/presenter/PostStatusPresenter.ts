import { AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView {
  clearPost: () => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private _statusService: StatusService;
  private _post: string = "";

  public constructor(view: PostStatusView) {
    super(view);
    this._statusService = new StatusService();
  }

  public get post(): string {
    return this._post;
  }

  public set post(post: string) {
    this._post = post;
  }

  public get statusService() {
    return this._statusService;
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    const toastId = this.view.displayInfoMessage("Posting status...", 0);

    await this.doFailureReport(
      async () => {
        await this.statusService.postStatus(authToken, newStatus);
        this.view.displayInfoMessage("Status posted!", 2000);
        this.view.clearPost();
      },
      "post status",
      () => {
        this.view.deleteMessage(toastId);
      }
    );
  }
}
