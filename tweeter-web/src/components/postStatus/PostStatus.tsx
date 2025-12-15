import "./PostStatus.css";
import { useRef, useState } from "react";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo } from "../userInfo/UserHooks";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../presenter/PostStatusPresenter";
import { Status } from "tweeter-shared";

interface Props {
  presenter?: PostStatusPresenter;
}

const PostStatus = (props: Props) => {
  const { displayErrorMessage, displayInfoMessage, deleteMessage } =
    useMessageActions();

  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser, authToken } = useUserInfo();

  const listener: PostStatusView = {
    displayInfoMessage: displayInfoMessage,
    deleteMessage: deleteMessage,
    displayErrorMessage: displayErrorMessage,
    clearPost: () => {
      setPost("");
    },
  };

  const presenterRef = useRef<PostStatusPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenter ?? new PostStatusPresenter(listener);
  }

  const submitPost = async (event: React.MouseEvent) => {
    setIsLoading(true);

    try {
      presenterRef.current!.post = post;

      const status = new Status(post, currentUser!, Date.now());
      await presenterRef.current!.postStatus(authToken!, status);

      setPost("");
    } finally {
      setIsLoading(false);
    }
  };

  const clearPost = (event: React.MouseEvent) => {
    event.preventDefault();
    setPost("");
  };

  const checkButtonStatus: () => boolean = () => {
    return !post.trim() || !authToken || !currentUser;
  };

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          aria-label="postStatusText"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => setPost(event.target.value)}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          aria-label="postStatusButton"
          disabled={checkButtonStatus()}
          style={{ width: "8em" }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          aria-label="clearStatusButton"
          disabled={checkButtonStatus()}
          onClick={clearPost}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
