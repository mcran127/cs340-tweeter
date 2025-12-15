import { User, AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";
import {
  PostStatusView,
  PostStatusPresenter,
} from "../../src/presenter/PostStatusPresenter";
import { ServerFacade } from "../../src/ServerFacade";
import { mock, instance, anything, verify } from "@typestrong/ts-mockito";

describe("Final Post Status", () => {
  let statusService: StatusService;
  let serverFacade: ServerFacade;

  beforeEach(() => {
    serverFacade = new ServerFacade();
    statusService = new StatusService();
  });

  it("confirming a posted status to user's story", async () => {
    const [user, authToken]: [User, AuthToken] = await serverFacade.login({
      alias: "@1",
      password: "1",
    });

    const mockView = mock<PostStatusView>();
    const presenter = new PostStatusPresenter(instance(mockView));
    const newStatus = new Status("TestStatus", user, Date.now());

    await presenter.postStatus(authToken, newStatus);

    verify(mockView.displayInfoMessage("Posting status...", anything())).once();
    verify(mockView.displayInfoMessage("Status posted!", anything())).once();
    verify(mockView.displayErrorMessage(anything())).never();

    const [storyItems, hasMore]: [Status[], boolean] =
      await statusService.loadMoreStoryItems(authToken, user.alias, 10, null);

    expect(storyItems[0]).toBeDefined();
    expect(storyItems[0].post).toBe(newStatus.post);
    expect(storyItems[0].user.alias).toBe(user.alias);
  }, 20000);
});
