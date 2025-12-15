import { useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserHooks";
import {
  UserNavigationPresenter,
  UserNavigationView,
} from "../../presenter/UserNavigationPresenter";
import { useRef } from "react";

export const useUserNavigation = (featurePath: string) => {
  const navigate = useNavigate();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: UserNavigationView = {
    displayErrorMessage: displayErrorMessage,
    setDisplayedUser: setDisplayedUser,
    navigate: navigate,
  };

  const presenterRef = useRef<UserNavigationPresenter>(
    new UserNavigationPresenter(listener)
  );

  const navigateToUser = async (event: React.MouseEvent): Promise<void> => {
    presenterRef.current.navigateToUser(
      event,
      authToken!,
      displayedUser!,
      featurePath
    );
  };

  return {
    navigateToUser,
  };
};
