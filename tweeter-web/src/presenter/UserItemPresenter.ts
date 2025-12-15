import { User } from "tweeter-shared";
import { PageItemPresenter } from "./PageItemPresenter";
import { FollowService } from "../model.service/FollowService";

export abstract class UserItemPresenter extends PageItemPresenter<User, FollowService> {
    protected serviceFactory(): FollowService {
        return new FollowService();
    }
}
