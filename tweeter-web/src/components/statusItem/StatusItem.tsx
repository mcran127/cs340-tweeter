import { Link } from "react-router-dom";
import Post from "./Post";
import { Status } from "tweeter-shared";
import { useUserNavigation } from "../userItem/UserNavigationHooks";

interface Props {
  user: Status;
  featureURL: string;
}

const StatusItem = (props: Props) => {
  const { navigateToUser } = useUserNavigation(props.featureURL);

  return (
    <div className="col bg-light mx-0 px-0">
      <div className="container px-0">
        <div className="row mx-0 px-0">
          <div className="col-auto p-3">
            <img
              src={props.user.user.imageUrl}
              className="img-fluid"
              width="80"
              alt="Posting user"
            />
          </div>
          <div className="col">
            <h2>
              <b>
                {props.user.user.firstName} {props.user.user.lastName}
              </b>{" "}
              -{" "}
              <Link
                to={`${props.featureURL}${props.user.user.alias}`}
                onClick={navigateToUser}
              >
                {props.user.user.alias}
              </Link>
            </h2>
            {props.user.formattedDate}
            <br />
            <Post status={props.user} featurePath={props.featureURL} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusItem;
